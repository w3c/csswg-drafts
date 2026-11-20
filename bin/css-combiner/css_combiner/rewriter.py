"""ID disambiguation, URL/asset rewriting, CSS rule checking, and panel merging."""

from __future__ import annotations

import hashlib
import posixpath
import re
import sys
from collections import defaultdict
from typing import Any, NamedTuple
from urllib.parse import urlsplit, urlunsplit

import lxml.etree
import lxml.html

from .models import (
    BiblioUrlMap,
    CurrentWorkMap,
    CustomStyleBlock,
    DfnPanelMap,
    ElementT,
    ExtractedSpec,
    IdRegistry,
    LegacyRedirectMap,
    LevelSpecEntry,
    RefHintMap,
    ReplacedSpecMap,
    ShortnameLevelsMap,
    SpecId,
    StyleRuleIssue,
)

SPEC_HOSTS: frozenset[str] = frozenset(
    {
        "drafts.csswg.org",
        "drafts.fxtf.org",
        "drafts.css-houdini.org",
        "www.w3.org",
        "w3.org",
        "dev.w3.org",
    },
)
CSS2_SUBPAGES: frozenset[str] = frozenset(
    {
        "about.html",
        "aural.html",
        "box.html",
        "cascade.html",
        "changes.html",
        "colors.html",
        "conform.html",
        "cover.html",
        "fonts.html",
        "generate.html",
        "grammar.html",
        "indexlist.html",
        "intro.html",
        "leftblank.html",
        "media.html",
        "page.html",
        "propidx.html",
        "refs.html",
        "sample.html",
        "selector.html",
        "syndata.html",
        "tables.html",
        "text.html",
        "ui.html",
        "visudet.html",
        "visufx.html",
        "visuren.html",
        "zindex.html",
    },
)
EXTRA_LEGACY_ALIASES: dict[str, str] = {
    "css21": "css2",
    "css22": "css2",
    "css3-animations": "css-animations",
    "css3-background": "css-backgrounds",
    "css3-backgrounds": "css-backgrounds",
    "css3-border": "css-borders",
    "css3-box": "css-box",
    "css3-break": "css-break",
    "css3-cascade": "css-cascade",
    "css3-color": "css-color",
    "css3-conditional": "css-conditional",
    "css3-content": "css-content",
    "css3-exclusions": "css-exclusions",
    "css3-flexbox": "css-flexbox",
    "css3-fonts": "css-fonts",
    "css3-gcpm": "css-gcpm",
    "css3-grid-layout": "css-grid",
    "css3-images": "css-images",
    "css3-linebox": "css-inline",
    "css3-lists": "css-lists",
    "css3-mediaqueries": "mediaqueries",
    "css3-multicol": "css-multicol",
    "css3-namespace": "css-namespaces",
    "css3-page": "css-page",
    "css3-positioning": "css-position",
    "css3-regions": "css-regions",
    "css3-ruby": "css-ruby",
    "css3-selectors": "selectors",
    "css3-Sizing": "css-sizing",
    "css3-sizing": "css-sizing",
    "css3-speech": "css-speech",
    "css3-syntax": "css-syntax",
    "css3-tables": "css-tables",
    "css3-text": "css-text",
    "css3-text-decor": "css-text-decor",
    "css3-transforms": "css-transforms",
    "css3-transitions": "css-transitions",
    "css3-ui": "css-ui",
    "css3-values": "css-values",
    "css3-writing-modes": "css-writing-modes",
    "css-style-attr": "css-style-attr-1",
    "selectors4": "selectors-4",
}

LEVELLED_DIR_RE = re.compile(r"^(.+)-(\d+)$")
TR_DATED_SLUG_RE = re.compile(
    r"^(?:WD|FPWD|LCWD|CR|CRD|PR|PER|REC|NOTE)-(.+?)-(\d{8}|\d{4}-\d{2}-\d{2})$",
    re.IGNORECASE,
)
CSS_URL_FUNC_RE = re.compile(r"url\(\s*(['\"]?)([^'\")\s]+)\1\s*\)", re.IGNORECASE)
CSS_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
SELECTOR_ID_RE = re.compile(r"#(-?[a-zA-Z_][a-zA-Z0-9_-]*)")
REFHINT_PREFIX_RE = re.compile(r"^([0-9a-f]{6,16})_(#|https?://)(.+)$")

SPACE_SEPARATED_IDREF_ATTRS: tuple[str, ...] = (
    "aria-labelledby",
    "aria-describedby",
    "aria-controls",
    "aria-owns",
    "headers",
)
RELATIVE_ASSET_ATTRS: tuple[str, ...] = ("src", "poster", "data")
XLINK_HREF = "{http://www.w3.org/1999/xlink}href"
HEADING_TAGS: frozenset[str] = frozenset({"h1", "h2", "h3", "h4", "h5", "h6"})
RUNTIME_DATA_ATTRS: frozenset[str] = frozenset(
    {
        "data-algorithm",
        "data-anno-for",
        "data-dfn-for",
        "data-dfn-type",
        "data-fill-with",
        "data-for",
        "data-language",
        "data-mathml",
        "data-md",
        "data-mdn",
        "data-refhint-key",
        "data-var-color",
        "data-var-last-color",
    },
)
STYLED_DATA_LINK_TYPES: frozenset[str] = frozenset(
    {
        "at-rule",
        "biblio",
        "descriptor",
        "element",
        "element-attr",
        "function",
        "maybe",
        "propdesc",
        "property",
        "selector",
        "value",
    },
)

CONDITIONAL_AT_RULES: frozenset[str] = frozenset(
    {"media", "supports", "layer", "container", "document"},
)
DESCRIPTOR_AT_RULES: frozenset[str] = frozenset(
    {
        "keyframes",
        "-webkit-keyframes",
        "-moz-keyframes",
        "font-face",
        "counter-style",
        "property",
        "page",
        "color-profile",
        "font-feature-values",
        "font-palette-values",
        "position-try",
        "view-transition",
    },
)


class LinkResolution(NamedTuple):
    """Outcome of rewriting a URL or anchor reference."""

    new_url: str
    resolved_to_combined: bool
    target_spec_id: SpecId | None


class ExtractedUrlSlug(NamedTuple):
    """Parsed spec slug and whether the original TR URL was dated."""

    slug: str
    is_dated: bool


class MergedPanelsResult(NamedTuple):
    """Combined dfnPanelData, refsData, and set of external URLs rewritten to local."""

    dfn_panels: DfnPanelMap
    ref_hints: RefHintMap
    rewritten_external_urls: set[str]


class PanelLookupKey(NamedTuple):
    """Composite key identifying a spec's original external dfn-panel entry."""

    spec_id: SpecId
    orig_panel_id: str


class ExternalTermMeta(NamedTuple):
    """Biblio key, term label, and optional qualifier for an external index item."""

    biblio_upper: str
    term_text: str
    for_qualifier: str


class RewriteAllOutcome(NamedTuple):
    """Merged interactive panel data and collected CSS selector scoping issues."""

    panels: MergedPanelsResult
    style_issues: list[StyleRuleIssue]


def _is_element(node: object) -> bool:
    """Return True if node is an HTML/SVG element rather than a comment/PI."""
    return isinstance(getattr(node, "tag", None), str)


def rewrite_relative_asset_path(rel_url: str, spec_id: SpecId) -> str:
    """Rewrite a spec-local relative asset URL so it resolves from `all-css/`."""
    parsed = urlsplit(rel_url)
    if parsed.scheme or parsed.netloc or not parsed.path or parsed.path.startswith("/"):
        return rel_url
    joined = posixpath.normpath(posixpath.join(spec_id, parsed.path))
    from_all_css = posixpath.relpath(joined, "all-css")
    return urlunsplit(("", "", from_all_css, parsed.query, parsed.fragment))


def _rewrite_css_urls(css_text: str, spec_id: SpecId) -> str:
    """Rewrite relative url(...) references inside CSS text."""

    def _repl(match: re.Match[str]) -> str:
        quote = match.group(1)
        raw_url = match.group(2)
        if raw_url.startswith(("#", "data:", "http://", "https://", "//", "/")):
            return match.group(0)
        updated = rewrite_relative_asset_path(raw_url, spec_id)
        return f"url({quote}{updated}{quote})"

    return CSS_URL_FUNC_RE.sub(_repl, css_text)


class LinkResolver:
    """Resolves local and cross-document CSS specification URLs into combined anchors."""

    def __init__(
        self,
        extracted_specs: list[ExtractedSpec],
        current_work_exceptions: CurrentWorkMap,
        legacy_redirects: LegacyRedirectMap,
        replaced_specs: ReplacedSpecMap,
    ) -> None:
        """Initialize lookup tables from combined specs and build-index mappings."""
        self.combined_ids: set[SpecId] = {s.meta.spec_id for s in extracted_specs}
        self.id_registry: IdRegistry = {s.meta.spec_id: s.surviving_ids for s in extracted_specs}
        self.biblio_registry: dict[SpecId, BiblioUrlMap] = {s.meta.spec_id: s.biblio_urls for s in extracted_specs}
        self.current_work = current_work_exceptions
        self.replaced_specs = replaced_specs
        self.redirects: dict[str, str] = {k.lower(): v.lower() for k, v in legacy_redirects.items()}
        for alias_key, alias_val in EXTRA_LEGACY_ALIASES.items():
            self.redirects.setdefault(alias_key.lower(), alias_val.lower())

        levels_map: ShortnameLevelsMap = defaultdict(list)
        for spec in extracted_specs:
            sid = spec.meta.spec_id
            m_lvl = LEVELLED_DIR_RE.match(sid)
            if m_lvl:
                base = m_lvl.group(1).lower()
                lvl = int(m_lvl.group(2))
                levels_map[base].append(LevelSpecEntry(level=lvl, spec_id=sid))
            elif sid == "css2":
                levels_map["css2"].append(LevelSpecEntry(level=2, spec_id="css2"))

        for entries in levels_map.values():
            entries.sort(key=lambda e: e.level)
        self.shortname_levels: ShortnameLevelsMap = dict(levels_map)

    def _extract_spec_slug_from_url(self, href: str) -> ExtractedUrlSlug | None:
        """If href points to a W3C/CSSWG spec page, extract its shortname slug."""
        parsed = urlsplit(href)
        host = parsed.netloc.lower()
        if host not in SPEC_HOSTS:
            return None

        segments = [seg for seg in parsed.path.split("/") if seg]
        if not segments:
            return None

        if host in {"www.w3.org", "w3.org"}:
            if segments[0].lower() != "tr" or len(segments) < 2:
                return None
            idx = 1
            if segments[idx].isdigit() and len(segments[idx]) == 4:
                idx += 1
                if idx >= len(segments):
                    return None
            raw_slug = segments[idx]
            rest = segments[idx + 1 :]
        elif host == "dev.w3.org":
            if segments[0].lower() not in {"csswg", "fxtf"} or len(segments) < 2:
                return None
            raw_slug = segments[1]
            rest = segments[2:]
        else:
            raw_slug = segments[0]
            rest = segments[1:]

        is_dated = False
        m_dated = TR_DATED_SLUG_RE.match(raw_slug)
        if m_dated:
            raw_slug = m_dated.group(1)
            is_dated = True

        slug_lower = raw_slug.lower()
        if rest:
            if len(rest) > 1:
                return None
            leaf = rest[0].lower()
            if leaf in {"", "overview.html", "index.html"}:
                pass
            elif slug_lower in {"css2", "css21", "css22"} and rest[0] in CSS2_SUBPAGES:
                pass
            else:
                return None

        return ExtractedUrlSlug(slug=slug_lower, is_dated=is_dated)

    def _resolve_slug(self, raw_slug: str, fragment: str) -> SpecId | None:
        """Map a versioned or unversioned spec slug to a combined SpecId, or None."""
        slug = raw_slug.lower()
        # Follow redirect chains (at most 3 hops to prevent cycles).
        for _ in range(3):
            if slug in self.combined_ids or slug in self.shortname_levels:
                break
            if slug in self.redirects:
                slug = self.redirects[slug]
            else:
                break

        if slug in self.combined_ids:
            return slug

        # If slug is a superseded earlier level configured in [replaced], resolve to its
        # replacement spec when the requested #fragment exists there (or on bare links).
        if slug in self.replaced_specs:
            replacements = self.replaced_specs[slug]
            if not fragment:
                return replacements[0]
            for cand_spec in replacements:
                if fragment in self.id_registry.get(cand_spec, set()):
                    return cand_spec
            return None

        # If slug is explicitly versioned (e.g. css-typed-om-1) and not in combined_ids,
        # it refers to a spec not being combined; leave it external.
        if LEVELLED_DIR_RE.match(slug):
            return None

        level_entries = self.shortname_levels.get(slug)
        if not level_entries:
            return None

        preferred_spec: SpecId = level_entries[-1].spec_id
        if slug in self.current_work:
            exc_level = self.current_work[slug]
            if exc_level is not None:
                for entry in level_entries:
                    if entry.level == exc_level:
                        preferred_spec = entry.spec_id
                        break

        if not fragment or fragment in self.id_registry.get(preferred_spec, set()):
            return preferred_spec

        # When an unversioned link targets a term defined in an earlier base level
        # rather than a diff level, locate the combined level that defines that anchor.
        for entry in reversed(level_entries):
            if fragment in self.id_registry.get(entry.spec_id, set()):
                return entry.spec_id

        return preferred_spec

    def rewrite_url(self, href: str, current_spec_id: SpecId) -> LinkResolution:
        """Rewrite a local, cross-spec, or relative URL according to combiner rules."""
        stripped = href.strip()
        if not stripped or stripped.startswith(("mailto:", "javascript:", "data:", "tel:")):
            return LinkResolution(href, False, None)

        if stripped.startswith("#"):
            if stripped == "#":
                return LinkResolution("#", True, current_spec_id)
            frag = stripped[1:]
            # Resolve bibliography citations (#biblio-foo / #ref-foo) whose #references
            # backmatter was dropped: link locally if the cited spec is combined, else to its URL.
            if frag not in self.id_registry.get(current_spec_id, set()):
                bib_url = self.biblio_registry.get(current_spec_id, {}).get(frag)
                if bib_url:
                    bib_res = self.rewrite_url(bib_url, current_spec_id)
                    if bib_res.resolved_to_combined:
                        return bib_res
                    return LinkResolution(bib_url, False, None)
            return LinkResolution(f"#{current_spec_id}:{frag}", True, current_spec_id)

        parsed = urlsplit(stripped)
        if parsed.scheme in {"http", "https"} or stripped.startswith("//"):
            check_url = "https:" + stripped if stripped.startswith("//") else stripped
            extracted = self._extract_spec_slug_from_url(check_url)
            if extracted is None:
                return LinkResolution(href, False, None)
            # Leave dated historical W3C TR citations without a #fragment external.
            if extracted.is_dated and not parsed.fragment:
                return LinkResolution(href, False, None)
            target_spec = self._resolve_slug(extracted.slug, parsed.fragment)
            if target_spec is None:
                return LinkResolution(href, False, None)
            if parsed.fragment:
                return LinkResolution(f"#{target_spec}:{parsed.fragment}", True, target_spec)
            return LinkResolution(f"#{target_spec}", True, target_spec)

        if not parsed.scheme and not parsed.netloc:
            # Check if a relative link targets another combined spec folder.
            norm_target = posixpath.normpath(posixpath.join(current_spec_id, parsed.path))
            parts = [p for p in norm_target.split("/") if p and p != "."]
            if parts and parts[0] in self.combined_ids:
                if len(parts) == 1 or (len(parts) == 2 and parts[1].lower() in {"index.html", "overview.html"}):
                    target_spec = parts[0]
                    if parsed.fragment:
                        return LinkResolution(
                            f"#{target_spec}:{parsed.fragment}",
                            True,
                            target_spec,
                        )
                    return LinkResolution(f"#{target_spec}", True, target_spec)
            updated_asset = rewrite_relative_asset_path(stripped, current_spec_id)
            return LinkResolution(updated_asset, False, None)

        return LinkResolution(href, False, None)


def _split_top_level_commas(text: str) -> list[str]:
    """Split a CSS selector list on commas outside parentheses, brackets, and strings."""
    parts: list[str] = []
    buf: list[str] = []
    paren_depth = 0
    bracket_depth = 0
    in_quote: str | None = None
    idx = 0
    while idx < len(text):
        ch = text[idx]
        if in_quote is not None:
            buf.append(ch)
            if ch == "\\" and idx + 1 < len(text):
                idx += 1
                buf.append(text[idx])
            elif ch == in_quote:
                in_quote = None
        elif ch in {'"', "'"}:
            in_quote = ch
            buf.append(ch)
        elif ch == "(":
            paren_depth += 1
            buf.append(ch)
        elif ch == ")":
            paren_depth = max(0, paren_depth - 1)
            buf.append(ch)
        elif ch == "[":
            bracket_depth += 1
            buf.append(ch)
        elif ch == "]":
            bracket_depth = max(0, bracket_depth - 1)
            buf.append(ch)
        elif ch == "," and paren_depth == 0 and bracket_depth == 0:
            parts.append("".join(buf).strip())
            buf = []
        else:
            buf.append(ch)
        idx += 1

    tail = "".join(buf).strip()
    if tail:
        parts.append(tail)
    return parts


def _selector_is_id_prefixed(selector: str) -> bool:
    """Return True if a CSS selector is scoped with a leading ID selector."""
    sel = selector.strip()
    if not sel:
        return True
    if sel.startswith("#"):
        return True
    for pseudo in (":is(", ":where("):
        if sel.startswith(pseudo):
            # Extract balanced parenthesized argument list.
            depth = 0
            end_idx = -1
            for idx, ch in enumerate(sel):
                if ch == "(":
                    depth += 1
                elif ch == ")":
                    depth -= 1
                    if depth == 0:
                        end_idx = idx
                        break
            if end_idx != -1:
                inner = sel[len(pseudo) : end_idx]
                branches = _split_top_level_commas(inner)
                return bool(branches) and all(_selector_is_id_prefixed(b) for b in branches)
    return False


def _rewrite_selector_ids(prelude: str, spec_id: SpecId) -> str:
    """Rewrite #id tokens in a CSS selector prelude to #spec_id\\:id."""
    escaped_prefix = spec_id.replace(":", "\\:")
    return SELECTOR_ID_RE.sub(rf"#{escaped_prefix}\:\1", prelude)


def process_css_rules(
    *,
    css_text: str,
    spec_id: SpecId,
    source_name: str,
    rewrite_ids_and_urls: bool,
    issues_out: list[StyleRuleIssue],
    in_id_scope: bool = False,
) -> str:
    """Validate that CSS rules start with an ID selector and optionally rewrite IDs/URLs."""
    no_comments = CSS_COMMENT_RE.sub("", css_text)
    out_chunks: list[str] = []
    idx = 0
    length = len(no_comments)

    while idx < length:
        while idx < length and no_comments[idx].isspace():
            out_chunks.append(no_comments[idx])
            idx += 1
        if idx >= length:
            break

        # Scan until top-level ';' or '{'.
        start = idx
        paren_depth = 0
        bracket_depth = 0
        in_quote: str | None = None
        delim = ""
        while idx < length:
            ch = no_comments[idx]
            if in_quote is not None:
                if ch == "\\" and idx + 1 < len(no_comments):
                    idx += 2
                    continue
                if ch == in_quote:
                    in_quote = None
            elif ch in {'"', "'"}:
                in_quote = ch
            elif ch == "(":
                paren_depth += 1
            elif ch == ")":
                paren_depth = max(0, paren_depth - 1)
            elif ch == "[":
                bracket_depth += 1
            elif ch == "]":
                bracket_depth = max(0, bracket_depth - 1)
            elif paren_depth == 0 and bracket_depth == 0 and ch in {";", "{"}:
                delim = ch
                break
            idx += 1

        prelude = no_comments[start:idx].strip()
        if idx >= length or not delim:
            out_chunks.append(
                _rewrite_css_urls(no_comments[start:], spec_id) if rewrite_ids_and_urls else no_comments[start:],
            )
            break

        if delim == ";":
            idx += 1
            stmt = no_comments[start:idx]
            out_chunks.append(_rewrite_css_urls(stmt, spec_id) if rewrite_ids_and_urls else stmt)
            continue

        # Found '{': find matching '}'.
        brace_open = idx
        idx += 1
        brace_depth = 1
        in_quote = None
        while idx < length and brace_depth > 0:
            ch = no_comments[idx]
            if in_quote is not None:
                if ch == "\\" and idx + 1 < len(no_comments):
                    idx += 2
                    continue
                if ch == in_quote:
                    in_quote = None
            elif ch in {'"', "'"}:
                in_quote = ch
            elif ch == "{":
                brace_depth += 1
            elif ch == "}":
                brace_depth -= 1
            idx += 1

        body = no_comments[brace_open + 1 : idx - 1] if brace_depth == 0 else no_comments[brace_open + 1 :]

        if prelude.startswith("@"):
            at_name_match = re.match(r"^@([a-zA-Z0-9_-]+)", prelude)
            at_name = at_name_match.group(1).lower() if at_name_match else ""
            if at_name in CONDITIONAL_AT_RULES:
                rewritten_body = process_css_rules(
                    css_text=body,
                    spec_id=spec_id,
                    source_name=source_name,
                    rewrite_ids_and_urls=rewrite_ids_and_urls,
                    issues_out=issues_out,
                    in_id_scope=in_id_scope,
                )
                out_chunks.append(f"{prelude} {{{rewritten_body}}}")
            elif at_name == "scope":
                scoped_by_id = in_id_scope or ("#" in prelude)
                new_prelude = _rewrite_selector_ids(prelude, spec_id) if rewrite_ids_and_urls else prelude
                rewritten_body = process_css_rules(
                    css_text=body,
                    spec_id=spec_id,
                    source_name=source_name,
                    rewrite_ids_and_urls=rewrite_ids_and_urls,
                    issues_out=issues_out,
                    in_id_scope=scoped_by_id,
                )
                out_chunks.append(f"{new_prelude} {{{rewritten_body}}}")
            elif at_name in DESCRIPTOR_AT_RULES:
                new_body = _rewrite_css_urls(body, spec_id) if rewrite_ids_and_urls else body
                out_chunks.append(f"{prelude} {{{new_body}}}")
            else:
                new_body = _rewrite_css_urls(body, spec_id) if rewrite_ids_and_urls else body
                out_chunks.append(f"{prelude} {{{new_body}}}")
        else:
            if not in_id_scope:
                for sel in _split_top_level_commas(prelude):
                    if not _selector_is_id_prefixed(sel):
                        issues_out.append(
                            StyleRuleIssue(
                                spec_id=spec_id,
                                source_name=source_name,
                                selector=" ".join(sel.split()),
                            ),
                        )
            new_prelude = _rewrite_selector_ids(prelude, spec_id) if rewrite_ids_and_urls else prelude
            new_body = _rewrite_css_urls(body, spec_id) if rewrite_ids_and_urls else body
            out_chunks.append(f"{new_prelude} {{{new_body}}}")

    return "".join(out_chunks)


def _rewrite_srcset(srcset_val: str, spec_id: SpecId) -> str:
    """Rewrite relative image URLs inside an HTML srcset attribute."""
    updated_items: list[str] = []
    for raw_part in srcset_val.split(","):
        part = raw_part.strip()
        if not part:
            continue
        tokens = part.split(maxsplit=1)
        rewritten_url = rewrite_relative_asset_path(tokens[0], spec_id)
        if len(tokens) == 2:
            updated_items.append(f"{rewritten_url} {tokens[1]}")
        else:
            updated_items.append(rewritten_url)
    return ", ".join(updated_items)


def _strip_unused_data_attrs(el: ElementT) -> None:
    """Remove build-time Bikeshed data-* metadata attributes not used by runtime CSS or JS."""
    to_delete: list[str] = []
    for raw_key, raw_val in el.attrib.items():
        key = str(raw_key)
        if not key.startswith("data-"):
            continue
        if key in RUNTIME_DATA_ATTRS:
            continue
        if key == "data-lt" and el.tag == "dfn":
            continue
        if key == "data-link-type" and str(raw_val) in STYLED_DATA_LINK_TYPES:
            continue
        to_delete.append(key)
    for key in to_delete:
        del el.attrib[key]


def _rewrite_element_tree(
    *,
    roots: list[ElementT],
    spec: ExtractedSpec,
    resolver: LinkResolver,
    rewritten_external_urls: set[str],
    heading_shift: int,
    add_ed_links: bool,
) -> None:
    """Disambiguate IDs, rewrite links/assets, bump headings, and add ED links in-place."""
    spec_id = spec.meta.spec_id
    ed_base = spec.meta.ed_url.split("#")[0]

    for root in roots:
        for el in root.iter():
            if not _is_element(el):
                continue

            orig_id = el.get("id")
            if orig_id:
                el.set("id", f"{spec_id}:{orig_id}")

            anno_for = el.get("data-anno-for")
            if anno_for:
                el.set("data-anno-for", f"{spec_id}:{anno_for}")

            for_attr = el.get("for")
            if for_attr and el.tag in {"label", "output"} and for_attr in spec.surviving_ids:
                el.set("for", f"{spec_id}:{for_attr}")

            for idref_attr in SPACE_SEPARATED_IDREF_ATTRS:
                raw_refs = el.get(idref_attr)
                if raw_refs:
                    updated_tokens = [
                        f"{spec_id}:{tok}" if tok in spec.surviving_ids else tok for tok in raw_refs.split()
                    ]
                    el.set(idref_attr, " ".join(updated_tokens))

            for href_attr in ("href", XLINK_HREF):
                href_val = el.get(href_attr)
                if href_val is not None:
                    res = resolver.rewrite_url(href_val, spec_id)
                    el.set(href_attr, res.new_url)
                    if res.resolved_to_combined and not href_val.strip().startswith("#"):
                        rewritten_external_urls.add(href_val.strip())

            for asset_attr in RELATIVE_ASSET_ATTRS:
                asset_val = el.get(asset_attr)
                if asset_val:
                    el.set(asset_attr, rewrite_relative_asset_path(asset_val, spec_id))

            srcset_val = el.get("srcset")
            if srcset_val:
                el.set("srcset", _rewrite_srcset(srcset_val, spec_id))

            inline_style = el.get("style")
            if inline_style and "url(" in inline_style.lower():
                el.set("style", _rewrite_css_urls(inline_style, spec_id))

            if el.tag == "img":
                el.set("loading", "lazy")
                el.set("decoding", "async")
            elif el.tag == "iframe":
                el.set("loading", "lazy")

            _strip_unused_data_attrs(el)

            if el.tag == "style" and el.text:
                # Inline <style> blocks inside <main> also get ID/URL rewriting.
                dummy_issues: list[StyleRuleIssue] = []
                el.text = process_css_rules(
                    css_text=el.text,
                    spec_id=spec_id,
                    source_name=f"{spec_id} (inline <main> <style>)",
                    rewrite_ids_and_urls=True,
                    issues_out=dummy_issues,
                )

        # Bump headings and prepend ED source links after link rewriting so the ED link
        # itself stays pointing to the external Editor's Draft.
        for el in root.iter():
            if not _is_element(el) or el.tag not in HEADING_TAGS:
                continue
            old_lvl = int(el.tag[1])
            new_lvl = min(6, max(3, old_lvl + heading_shift))
            el.tag = f"h{new_lvl}"

            if add_ed_links and el in spec.original_heading_ids:
                orig_heading_id = spec.original_heading_ids[el]
                src_link = lxml.etree.Element("a")
                src_link.set("class", "source-spec-link")
                src_link.set("href", f"{ed_base}#{orig_heading_id}")
                src_link.set(
                    "title",
                    f"View section #{orig_heading_id} in {spec_id} Editor's Draft",
                )
                src_link.set("aria-label", f"Source section in {spec_id}")
                src_link.text = "↗"
                src_link.tail = " "
                if el.text:
                    src_link.tail = " " + el.text
                    el.text = None
                el.insert(0, src_link)


def _rewrite_ref_sections(
    raw_sections: object,
    spec_id: SpecId,
    surviving_ids: set[str],
) -> list[dict[str, Any]]:
    """Filter and prefix dfn-panel refSections for a single specification."""
    if not isinstance(raw_sections, list):
        return []
    cleaned_sections: list[dict[str, Any]] = []
    for sec in raw_sections:
        if not isinstance(sec, dict):
            continue
        raw_refs = sec.get("refs")
        if not isinstance(raw_refs, list):
            continue
        kept_refs: list[dict[str, str]] = []
        for ref in raw_refs:
            if not isinstance(ref, dict):
                continue
            rid = str(ref.get("id", ""))
            if rid and rid in surviving_ids:
                kept_refs.append({"id": f"{spec_id}:{rid}"})
        if kept_refs:
            raw_title = " ".join(str(sec.get("title", "")).split())
            cleaned_sections.append(
                {
                    "refs": kept_refs,
                    "title": f"[{spec_id}] {raw_title}" if raw_title else f"[{spec_id}]",
                },
            )
    return cleaned_sections


def make_external_panel_id(
    biblio_upper: str,
    url: str,
    term_text: str,
    for_qualifier: str,
) -> str:
    """Create a deterministic DOM/panel ID for a genuinely external index term."""
    digest = hashlib.sha1(
        f"{biblio_upper}|{url}|{term_text}|{for_qualifier}".encode(),
    ).hexdigest()[:12]
    return f"external-term:{digest}"


def rewrite_and_merge_all(
    extracted_specs: list[ExtractedSpec],
    resolver: LinkResolver,
) -> RewriteAllOutcome:
    """Rewrite all DOM trees, styles, dfn-panels, and ref-hints across specs."""
    rewritten_external_urls: set[str] = set()
    style_issues: list[StyleRuleIssue] = []

    for spec in extracted_specs:
        _rewrite_element_tree(
            roots=spec.main_elements,
            spec=spec,
            resolver=resolver,
            rewritten_external_urls=rewritten_external_urls,
            heading_shift=1,
            add_ed_links=True,
        )
        _rewrite_element_tree(
            roots=spec.security_privacy_elements,
            spec=spec,
            resolver=resolver,
            rewritten_external_urls=rewritten_external_urls,
            heading_shift=2,
            add_ed_links=True,
        )
        _rewrite_element_tree(
            roots=spec.mdn_annotations,
            spec=spec,
            resolver=resolver,
            rewritten_external_urls=rewritten_external_urls,
            heading_shift=0,
            add_ed_links=False,
        )

        # Validate and rewrite spec-specific <style> blocks.
        updated_styles: list[CustomStyleBlock] = []
        for idx, block in enumerate(spec.custom_styles, start=1):
            rewritten_css = process_css_rules(
                css_text=block.css_text,
                spec_id=spec.meta.spec_id,
                source_name=f"{spec.meta.spec_id} <style #{idx}>",
                rewrite_ids_and_urls=True,
                issues_out=style_issues,
            )
            updated_styles.append(CustomStyleBlock(spec_id=spec.meta.spec_id, css_text=rewritten_css))
        spec.custom_styles = updated_styles

        # Validate external spec-specific stylesheet files (e.g., style.css).
        for link in spec.custom_stylesheets:
            if link.local_path is not None and link.local_path.is_file():
                ext_css = link.local_path.read_text(encoding="utf-8", errors="replace")
                process_css_rules(
                    css_text=ext_css,
                    spec_id=spec.meta.spec_id,
                    source_name=f"{spec.meta.spec_id}/{link.href}",
                    rewrite_ids_and_urls=False,
                    issues_out=style_issues,
                )

    if style_issues:
        specs_with_unscoped = sorted({issue.spec_id for issue in style_issues})
        sys.stderr.write(
            f"ERROR: Found {len(style_issues)} unprefixed CSS selector(s) across "
            + f"{len(specs_with_unscoped)} spec(s): {', '.join(specs_with_unscoped)}\n",
        )

    # First pass over dfnPanelData: register all local dfns so cross-spec external
    # panel references can merge their refSections into the target dfn's panel.
    merged_dfn_panels: DfnPanelMap = {}
    pending_cross_spec_refs: dict[str, list[dict[str, Any]]] = defaultdict(list)

    # Map PanelLookupKey -> ExternalTermMeta so genuinely external index terms get
    # unified deterministic panel IDs.
    ext_item_lookup: dict[PanelLookupKey, ExternalTermMeta] = {}
    for spec in extracted_specs:
        for ext_item in spec.external_index:
            if ext_item.orig_panel_id:
                ext_item_lookup[PanelLookupKey(spec.meta.spec_id, ext_item.orig_panel_id)] = ExternalTermMeta(
                    biblio_upper=ext_item.biblio_label.upper(),
                    term_text=ext_item.term_text,
                    for_qualifier=ext_item.for_qualifier or "",
                )

    for spec in extracted_specs:
        sid = spec.meta.spec_id
        for orig_key, entry in spec.raw_dfn_panels.items():
            is_ext = bool(entry.get("external"))
            raw_url = str(entry.get("url", ""))
            sections = _rewrite_ref_sections(entry.get("refSections"), sid, spec.surviving_ids)

            if not is_ext:
                orig_dfn_id = str(entry.get("dfnID", orig_key))
                if orig_dfn_id not in spec.surviving_ids:
                    continue
                new_dfn_id = f"{sid}:{orig_dfn_id}"
                merged_dfn_panels[new_dfn_id] = {
                    "dfnID": new_dfn_id,
                    "dfnText": entry.get("dfnText", ""),
                    "external": False,
                    "refSections": sections,
                    "url": f"#{new_dfn_id}",
                }
            else:
                res = resolver.rewrite_url(raw_url, sid)
                if res.resolved_to_combined:
                    rewritten_external_urls.add(raw_url.strip())
                    if res.new_url.startswith("#") and sections:
                        pending_cross_spec_refs[res.new_url[1:]].extend(sections)
                elif sections:
                    lookup_key = PanelLookupKey(sid, orig_key)
                    if lookup_key in ext_item_lookup:
                        term_meta = ext_item_lookup[lookup_key]
                        ext_pid = make_external_panel_id(
                            term_meta.biblio_upper,
                            raw_url,
                            term_meta.term_text,
                            term_meta.for_qualifier,
                        )
                        if ext_pid in merged_dfn_panels:
                            merged_dfn_panels[ext_pid]["refSections"].extend(sections)
                        else:
                            merged_dfn_panels[ext_pid] = {
                                "dfnID": ext_pid,
                                "dfnText": entry.get("dfnText", term_meta.term_text),
                                "external": True,
                                "refSections": sections,
                                "url": raw_url,
                            }

    for target_dfn_id, extra_sections in pending_cross_spec_refs.items():
        if target_dfn_id in merged_dfn_panels:
            merged_dfn_panels[target_dfn_id]["refSections"].extend(extra_sections)

    # Rewrite and merge refsData across all specs.
    merged_ref_hints: RefHintMap = {}
    for spec in extracted_specs:
        sid = spec.meta.spec_id
        for raw_key, raw_hint in spec.raw_ref_hints.items():
            m_pref = REFHINT_PREFIX_RE.match(raw_key)
            if m_pref:
                hint_prefix: str | None = m_pref.group(1)
                raw_url = m_pref.group(2) + m_pref.group(3)
            else:
                hint_prefix = None
                raw_url = raw_key

            res = resolver.rewrite_url(raw_url, sid)
            if res.resolved_to_combined and not raw_url.startswith("#"):
                rewritten_external_urls.add(raw_url.strip())

            new_key = f"{hint_prefix}_{res.new_url}" if hint_prefix else res.new_url
            updated_hint = dict(raw_hint)
            updated_hint["url"] = res.new_url
            if res.resolved_to_combined:
                updated_hint["status"] = "local"
            merged_ref_hints.setdefault(new_key, updated_hint)

    return RewriteAllOutcome(
        panels=MergedPanelsResult(
            dfn_panels=merged_dfn_panels,
            ref_hints=merged_ref_hints,
            rewritten_external_urls=rewritten_external_urls,
        ),
        style_issues=style_issues,
    )
