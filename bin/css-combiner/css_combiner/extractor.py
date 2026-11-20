"""DOM extraction of meaningful content, indexes, styles, and scripts per spec."""

from __future__ import annotations

import copy
import json
import re
from pathlib import Path
from typing import Literal, NamedTuple

import lxml.html

from .models import (
    AttrMap,
    BiblioUrlMap,
    BoilerplateMap,
    BuiltSpec,
    CustomScript,
    CustomStyleBlock,
    CustomStylesheetLink,
    DfnPanelMap,
    ElementT,
    ExternalIndexItem,
    ExtractedSpec,
    InternalIndexItem,
    PropertyIndexRow,
    RefHintMap,
    RowCellMap,
    remove_preserving_tail,
    xpath_elements,
)

SectionDisposition = Literal["keep", "drop", "sec_priv"]

BOILERPLATE_MARKER_RE = re.compile(r"^\s*/\*\s*Boilerplate:\s*([^\s*]+)\s*\*/")
DFN_PANEL_JSON_RE = re.compile(r"let\s+dfnPanelData\s*=\s*(\{.*?\n\});?", re.DOTALL)
REF_HINTS_JSON_RE = re.compile(r"let\s+refsData\s*=\s*(\{.*?\n\});?", re.DOTALL)
TRAILING_COMMA_RE = re.compile(r",(\s*\n\})")

LEADING_SECNO_RE = re.compile(r"^[A-Z0-9]+(?:\.\d+)*\.?\s+")
APPENDIX_PREFIX_RE = re.compile(r"^appendix\s+[a-z0-9]+\s*[:.\-\u2014\u2013]?\s*", re.IGNORECASE)
CHANGES_HEADING_RE = re.compile(
    r"^(?:(?:recent|earlier|older)\s+)?changes(?:\s+(?:since|from|prior\s+to|for)\b.*)?$",
    re.IGNORECASE,
)
CHANGE_LOG_RE = re.compile(r"^change\s*(?:log|history)$", re.IGNORECASE)
SEC_PRIV_HEADING_RE = re.compile(
    r"^(?:security|privacy)(?:\s+(?:and|&)\s+(?:security|privacy))?(?:\s+considerations)?$",
    re.IGNORECASE,
)
NON_NORMATIVE_BOILERPLATE_RE = re.compile(
    r"^(?:this\s+(?:section|subsection|appendix)\s+is\s+(?:not\s+normative|non-normative)\.?\s*)+",
    re.IGNORECASE,
)
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"'\u201c(\[])")
TRIVIAL_PLACEHOLDER_RE = re.compile(
    r"^(?:to be written|tbd|n/a|not applicable|none)\.?\s*$",
    re.IGNORECASE,
)
SEC_PRIV_DISQUALIFIER_RE = re.compile(
    r"\b(?:besides|however|except|but|see\s+§|see\s+[A-Z])\b",
    re.IGNORECASE,
)
NO_CONSIDERATIONS_RE = re.compile(
    r"(?:"
    + r"\bno\s+(?:new\s+|known\s+|specific\s+|additional\s+|potential\s+)?"
    + r"(?:(?:privacy|security)(?:\s+(?:or|and)\s+(?:privacy|security))?\s+)"
    + r"(?:considerations?|concerns?|issues?|impacts?|implications?|leaks?|risks?)\b"
    + r"|\bno\s+(?:new\s+|known\s+|specific\s+)?(?:concerns?|considerations?|issues?)\s+"
    + r"(?:regarding|for|about)\s+(?:privacy|security)\b"
    + r"|\bno\s+(?:new\s+|known\s+)?issues?\s+have\s+been\s+(?:opened|raised|reported)\b"
    + r"|\bdoes\s+not\s+(?:incur|introduce|have|raise|pose)\s+any\s+(?:new\s+)?(?:privacy|security)\s+"
    + r"(?:considerations?|concerns?|issues?|impacts?|implications?|leaks?|risks?)\b"
    + r"|\bnot\s+known\s+to\s+introduce\s+any\s+(?:new\s+)?(?:privacy|security)\s+"
    + r"(?:considerations?|concerns?|issues?|impacts?|implications?|leaks?|risks?)\b"
    + r"|\bno\s+information\s+about\s+potential\s+(?:privacy|security)\s+"
    + r"(?:considerations?|concerns?|issues?)\b"
    + r")",
    re.IGNORECASE,
)
MAX_TRIVIAL_SENTENCE_LEN = 200
COMPLEX_CONTENT_XPATH = (
    "self::table or self::ul or self::ol or self::dl or self::pre or self::blockquote "
    + "or .//table or .//ul or .//ol or .//dl or .//pre or .//blockquote"
)
HEADING_TAGS: frozenset[str] = frozenset({"h1", "h2", "h3", "h4", "h5", "h6"})
DROPPED_SECTION_TITLES: frozenset[str] = frozenset(
    {
        "acknowledgements",
        "acknowledgments",
        "bibliography",
        "full property table",
        "idl index",
        "index",
        "informative references",
        "issues index",
        "normative references",
        "property index",
        "references",
    },
)
IGNORED_STYLESHEET_SUBSTRINGS: tuple[str, ...] = (
    "w3.org/StyleSheets/",
    "default.css",
    "alternate-spec-style.css",
    "issues.css",
)
IGNORED_SCRIPT_SUBSTRINGS: tuple[str, ...] = (
    "w3.org/scripts/TR/",
    "test.csswg.org/harness/annotate.js",
)

DFN_PANEL_PLACEHOLDER = "/*__COMBINED_DFN_PANEL_DATA__*/"
REF_HINTS_PLACEHOLDER = "/*__COMBINED_REFS_DATA__*/"


def _is_element(node: object) -> bool:
    """Return True if node is a real HTML element rather than a comment/PI."""
    return isinstance(getattr(node, "tag", None), str)


def _heading_level(el: ElementT) -> int | None:
    """Return integer heading level 1..6 if el is a heading element, else None."""
    if _is_element(el) and el.tag in HEADING_TAGS:
        return int(el.tag[1])
    return None


def _clean_heading_title(heading: ElementT) -> str:
    """Extract normalized plain-text heading title without section numbers or self-links."""
    cloned = copy.deepcopy(heading)
    for removable in cloned.xpath(".//*[contains(@class, 'secno') or contains(@class, 'self-link')]"):
        remove_preserving_tail(removable)
    text = " ".join(cloned.text_content().split()).strip()
    text = APPENDIX_PREFIX_RE.sub("", text)
    text = LEADING_SECNO_RE.sub("", text)
    return text.strip()


def _classify_heading(heading: ElementT) -> SectionDisposition:
    """Classify whether a section heading should be kept, dropped, or moved to Security/Privacy."""
    norm = _clean_heading_title(heading).lower()
    hid = (heading.get("id") or "").lower()

    if norm in DROPPED_SECTION_TITLES or hid in {
        "acks",
        "ack",
        "acknowledgements",
        "acknowledgments",
    }:
        return "drop"

    if CHANGES_HEADING_RE.match(norm) or CHANGE_LOG_RE.match(norm):
        return "drop"

    if SEC_PRIV_HEADING_RE.match(norm) or norm in {
        "considerations for security",
        "considerations for privacy",
    }:
        return "sec_priv"

    return "keep"


class PartitionedContent(NamedTuple):
    """Kept main elements and extracted Security/Privacy elements."""

    kept: list[ElementT]
    security_privacy: list[ElementT]


class ExtractedPanelData(NamedTuple):
    """Extracted dfn-panel and ref-hint dictionaries for one spec."""

    dfn_panels: DfnPanelMap
    ref_hints: RefHintMap


def _partition_section_elements(
    elements: list[ElementT],
) -> PartitionedContent:
    """Split content elements into kept_main and security_privacy, dropping Ack/Changes."""
    kept: list[ElementT] = []
    sec_priv: list[ElementT] = []

    current_mode: SectionDisposition = "keep"
    mode_level = 7

    for el in elements:
        if not _is_element(el):
            continue

        # Handle explicit <section> or heading-led <div> wrappers (e.g., <div class="non-normative">).
        is_section_wrapper = el.tag == "section"
        if not is_section_wrapper and el.tag == "div":
            el_children = [child for child in el if _is_element(child)]
            if el_children and el_children[0].tag in {"h2", "h3"}:
                is_section_wrapper = True

        if is_section_wrapper:
            first_headings = el.xpath("./*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]")
            if first_headings:
                sec_disp = _classify_heading(first_headings[0])
                if sec_disp == "drop":
                    continue
                if sec_disp == "sec_priv":
                    sec_priv.append(el)
                    continue
            inner_children = [child for child in el if _is_element(child)]
            inner_part = _partition_section_elements(inner_children)
            for child in list(el):
                el.remove(child)
            for child in inner_part.kept:
                el.append(child)
            if len(el) > 0 or (el.text and el.text.strip()):
                kept.append(el)
            sec_priv.extend(inner_part.security_privacy)
            continue

        lvl = _heading_level(el)
        if lvl is not None:
            if lvl <= mode_level:
                current_mode = "keep"
                mode_level = 7
            if current_mode == "keep":
                disp = _classify_heading(el)
                if disp != "keep":
                    current_mode = disp
                    mode_level = lvl

        if current_mode == "keep":
            kept.append(el)
        elif current_mode == "sec_priv":
            sec_priv.append(el)

    return PartitionedContent(kept=kept, security_privacy=sec_priv)


def _extract_legacy_html_body_elements(doc: ElementT) -> list[ElementT]:
    """Extract content elements between the ToC and backmatter in pre-Bikeshed HTML specs."""
    body = doc.find("body")
    if body is None:
        return []

    body_children = [child for child in body if _is_element(child)]
    toc_nodes = doc.xpath("//*[@id='toc' or @id='contents'] | //ul[contains(@class, 'toc')]")
    start_idx = 0
    if toc_nodes:
        toc_ancestors = set(toc_nodes[0].iterancestors()) | {toc_nodes[0]}
        for idx, child in enumerate(body_children):
            if child in toc_ancestors:
                start_idx = idx + 1
                break

    backmatter_re = re.compile(
        r"^(?:references|normative\s+references|informative\s+references|index|property\s+index)$",
        re.IGNORECASE,
    )
    collected: list[ElementT] = []
    in_backmatter = False
    for child in body_children[start_idx:]:
        lvl = _heading_level(child)
        if lvl is not None and lvl <= 2:
            title_norm = _clean_heading_title(child)
            if backmatter_re.match(title_norm):
                in_backmatter = True
                continue
            if _classify_heading(child) == "sec_priv":
                # Legacy specs sometimes place Security/Privacy after References.
                in_backmatter = False

        if not in_backmatter:
            collected.append(child)

    return collected


def _parse_trailing_comma_json(raw_json: str) -> dict[str, object]:
    """Parse a Bikeshed JS object literal that may contain a trailing comma."""
    fixed = TRAILING_COMMA_RE.sub(r"\1", raw_json)
    try:
        parsed = json.loads(fixed)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _extract_styles_and_scripts(
    *,
    doc: ElementT,
    spec_id: str,
    repo_root: Path,
    boilerplate_styles: BoilerplateMap,
    boilerplate_scripts: BoilerplateMap,
    custom_styles: list[CustomStyleBlock],
    custom_stylesheets: list[CustomStylesheetLink],
    custom_scripts: list[CustomScript],
) -> ExtractedPanelData:
    """Extract boilerplate/custom styles and scripts outside <main>."""
    dfn_panels: DfnPanelMap = {}
    ref_hints: RefHintMap = {}

    main_el = doc.find(".//main")
    main_ancestors: set[ElementT] = set()
    if main_el is not None:
        main_ancestors = set(main_el.iter())

    for link_el in doc.xpath("//head/link[@rel='stylesheet']"):
        if not _is_element(link_el):
            continue
        href = (link_el.get("href") or "").strip()
        if not href or any(ign in href for ign in IGNORED_STYLESHEET_SUBSTRINGS):
            continue
        local_path: Path | None = None
        if not href.startswith(("http://", "https://", "//", "/")):
            candidate = (repo_root / spec_id / href).resolve()
            if candidate.is_file():
                local_path = candidate
        custom_stylesheets.append(
            CustomStylesheetLink(spec_id=spec_id, href=href, local_path=local_path),
        )

    for style_el in doc.xpath("//style"):
        if not _is_element(style_el) or style_el in main_ancestors:
            continue
        css_text = (style_el.text or "").strip()
        if not css_text:
            continue
        m_bp = BOILERPLATE_MARKER_RE.match(css_text)
        if m_bp:
            bp_name = m_bp.group(1)
            boilerplate_styles.setdefault(bp_name, css_text)
        else:
            custom_styles.append(CustomStyleBlock(spec_id=spec_id, css_text=css_text))

    for script_el in doc.xpath("//script"):
        if not _is_element(script_el) or script_el in main_ancestors:
            continue
        src = (script_el.get("src") or "").strip() or None
        if src and any(ign in src for ign in IGNORED_SCRIPT_SUBSTRINGS):
            continue
        code = (script_el.text or "").strip()
        m_bp = BOILERPLATE_MARKER_RE.match(code) if code else None
        if m_bp:
            bp_name = m_bp.group(1)
            if bp_name == "script-dfn-panel":
                m_data = DFN_PANEL_JSON_RE.search(code)
                if m_data:
                    raw_map = _parse_trailing_comma_json(m_data.group(1))
                    for k, v in raw_map.items():
                        if isinstance(v, dict):
                            dfn_panels[k] = v
                    template = code[: m_data.start(1)] + DFN_PANEL_PLACEHOLDER + code[m_data.end(1) :]
                    boilerplate_scripts.setdefault(bp_name, template)
            elif bp_name == "script-ref-hints":
                m_refs = REF_HINTS_JSON_RE.search(code)
                if m_refs:
                    raw_map = _parse_trailing_comma_json(m_refs.group(1))
                    for k, v in raw_map.items():
                        if isinstance(v, dict):
                            ref_hints[k] = v
                    template = code[: m_refs.start(1)] + REF_HINTS_PLACEHOLDER + code[m_refs.end(1) :]
                    boilerplate_scripts.setdefault(bp_name, template)
            else:
                boilerplate_scripts.setdefault(bp_name, code)
        elif src or code:
            if _is_runaway_script(script_el):
                continue
            attrs: AttrMap = {str(k): str(v) for k, v in script_el.attrib.items() if str(k) != "src"}
            custom_scripts.append(
                CustomScript(
                    spec_id=spec_id,
                    src=src,
                    inline_code=code or None,
                    attrs=attrs,
                ),
            )

    return ExtractedPanelData(dfn_panels=dfn_panels, ref_hints=ref_hints)


def _compute_dfn_disambiguator(dfn_el: ElementT | None) -> str:
    """Compute Bikeshed's disambiguator phrase for a <dfn> element."""
    if dfn_el is None:
        return "definition of"
    dfn_type = dfn_el.get("data-dfn-type") or "dfn"
    dfn_for = dfn_el.get("data-dfn-for")
    if dfn_for:
        for_parts = [part.strip() for part in dfn_for.split(",") if part.strip()]
        if for_parts:
            return f"{dfn_type} for {', '.join(for_parts)}"
    if dfn_type == "dfn":
        return "definition of"
    return f"({dfn_type})"


def _extract_internal_index(
    doc: ElementT,
    spec_id: str,
    surviving_ids: set[str],
    kept_roots: list[ElementT],
) -> list[InternalIndexItem]:
    """Extract locally-defined index terms whose targets survive in the combined spec."""
    dfn_by_id: dict[str, ElementT] = {}
    for root in kept_roots:
        for dfn in root.xpath(".//dfn[@id]"):
            if _is_element(dfn):
                did = dfn.get("id")
                if did:
                    dfn_by_id[did] = dfn

    items: list[InternalIndexItem] = []
    uls = doc.xpath("//*[@id='index-defined-here']/following-sibling::ul[contains(@class, 'index')][1]")
    if uls:
        for li in uls[0].xpath("./li"):
            if not _is_element(li):
                continue
            sub_uls = li.xpath("./ul")
            if sub_uls:
                term_text = (li.text or "").strip()
                if not term_text:
                    # Reconstruct text before <ul> if inline child elements were used.
                    parts: list[str] = [li.text or ""]
                    for child in li:
                        if _is_element(child) and child.tag == "ul":
                            break
                        if _is_element(child):
                            parts.append(child.text_content())
                        parts.append(child.tail or "")
                    term_text = " ".join("".join(parts).split())
                for sub_li in sub_uls[0].xpath("./li"):
                    links = sub_li.xpath("./a[@href]")
                    if not links:
                        continue
                    href = (links[0].get("href") or "").strip()
                    if not href.startswith("#"):
                        continue
                    target_id = href[1:]
                    if target_id not in surviving_ids:
                        continue
                    disamb = " ".join(links[0].text_content().split())
                    spans = sub_li.xpath("./span")
                    sec_label = " ".join(spans[0].text_content().split()) if spans else ""
                    sec_label = re.sub(r"^,\s*in\s*", "", sec_label).strip()
                    items.append(
                        InternalIndexItem(
                            term_text=term_text,
                            orig_target_id=target_id,
                            disambiguator=disamb,
                            section_label=sec_label,
                            spec_id=spec_id,
                        ),
                    )
            else:
                links = li.xpath("./a[@href]")
                if not links:
                    continue
                href = (links[0].get("href") or "").strip()
                if not href.startswith("#"):
                    continue
                target_id = href[1:]
                if target_id not in surviving_ids:
                    continue
                term_text = " ".join(links[0].text_content().split())
                spans = li.xpath("./span")
                sec_label = " ".join(spans[0].text_content().split()) if spans else ""
                sec_label = re.sub(r"^,\s*in\s*", "", sec_label).strip()
                disamb = _compute_dfn_disambiguator(dfn_by_id.get(target_id))
                items.append(
                    InternalIndexItem(
                        term_text=term_text,
                        orig_target_id=target_id,
                        disambiguator=disamb,
                        section_label=sec_label,
                        spec_id=spec_id,
                    ),
                )
    elif dfn_by_id:
        # Fallback for pre-Bikeshed HTML specs without #index-defined-here.
        for target_id, dfn in dfn_by_id.items():
            term_text = " ".join(dfn.text_content().split())
            if term_text:
                items.append(
                    InternalIndexItem(
                        term_text=term_text,
                        orig_target_id=target_id,
                        disambiguator="definition of",
                        section_label="",
                        spec_id=spec_id,
                    ),
                )

    return items


def _extract_external_index(
    doc: ElementT,
    spec_id: str,
    raw_dfn_panels: DfnPanelMap,
) -> list[ExternalIndexItem]:
    """Extract externally-defined term entries from #index-defined-elsewhere."""
    items: list[ExternalIndexItem] = []
    uls = doc.xpath("//*[@id='index-defined-elsewhere']/following-sibling::ul[contains(@class, 'index')][1]")
    if not uls:
        return items

    for spec_li in uls[0].xpath("./li"):
        if not _is_element(spec_li):
            continue
        biblio_links = spec_li.xpath("./a[@data-link-type='biblio']")
        if not biblio_links:
            continue
        biblio_el = biblio_links[0]
        raw_bib_label = " ".join(biblio_el.text_content().split()).strip("[] ")
        biblio_lt = (biblio_el.get("data-lt") or raw_bib_label or "unknown").lower()
        biblio_label = raw_bib_label or biblio_lt.upper()

        for term_li in spec_li.xpath("./ul/li"):
            if not _is_element(term_li):
                continue
            spans = term_li.xpath("./span")
            links = term_li.xpath("./a[@href]")
            if spans:
                span = spans[0]
                panel_id = span.get("id")
                cloned = copy.deepcopy(span)
                for_qual: str | None = None
                smalls = cloned.xpath("./small")
                if smalls:
                    for_qual = " ".join(smalls[0].text_content().split())
                    remove_preserving_tail(smalls[0])
                term_text = " ".join(cloned.text_content().split())
                panel_entry = raw_dfn_panels.get(panel_id or "")
                direct_url = str(panel_entry["url"]) if panel_entry and "url" in panel_entry else None
                items.append(
                    ExternalIndexItem(
                        biblio_label=biblio_label,
                        biblio_lt=biblio_lt,
                        term_text=term_text,
                        for_qualifier=for_qual,
                        orig_panel_id=panel_id,
                        direct_url=direct_url,
                        spec_id=spec_id,
                    ),
                )
            elif links:
                link = links[0]
                term_text = " ".join(link.text_content().split())
                direct_url = (link.get("href") or "").strip() or None
                items.append(
                    ExternalIndexItem(
                        biblio_label=biblio_label,
                        biblio_lt=biblio_lt,
                        term_text=term_text,
                        for_qualifier=None,
                        orig_panel_id=None,
                        direct_url=direct_url,
                        spec_id=spec_id,
                    ),
                )
    return items


def _normalize_prop_col(col_header: str) -> str:
    """Normalize Bikeshed property-index column headers (removing soft hyphens)."""
    cleaned = " ".join(col_header.replace("\xad", "").split())
    mapping = {
        "Inh.": "Inh.",
        "Inherited": "Inh.",
        "%ages": "%ages",
        "Percentages": "%ages",
    }
    return mapping.get(cleaned, cleaned)


def _extract_property_index(
    doc: ElementT,
    spec_id: str,
    order_index: int,
    surviving_ids: set[str],
) -> list[PropertyIndexRow]:
    """Extract property rows from a spec's #property-index table."""
    rows: list[PropertyIndexRow] = []
    prop_headings = doc.xpath("//*[@id='property-index']")
    if not prop_headings:
        return rows

    # Find the main property index table before any <h3> descriptor tables or next <h2>.
    prop_table: ElementT | None = None
    sibling = prop_headings[0].getnext()
    while sibling is not None:
        if _is_element(sibling):
            if sibling.tag in {"h2", "h3"}:
                break
            if sibling.tag == "table" and "index" in (sibling.get("class") or ""):
                prop_table = sibling
                break
            tables = sibling.xpath(".//table[contains(@class, 'index')]")
            if tables:
                prop_table = tables[0]
                break
        sibling = sibling.getnext()

    if prop_table is None:
        return rows

    headers = [_normalize_prop_col(th.text_content()) for th in prop_table.xpath("./thead/tr/th") if _is_element(th)]
    if not headers:
        return rows

    for tr in prop_table.xpath("./tbody/tr"):
        if not _is_element(tr):
            continue
        row_cells = [c for c in tr if _is_element(c) and c.tag in {"th", "td"}]
        if not row_cells:
            continue
        name_cell = row_cells[0]
        prop_name = " ".join(name_cell.text_content().split())
        if not prop_name:
            continue
        links = name_cell.xpath(".//a[@href]")
        orig_href = (links[0].get("href") or "").strip() if links else None
        if orig_href and orig_href.startswith("#") and orig_href[1:] not in surviving_ids:
            continue

        cells_map: RowCellMap = {}
        for col_idx, cell_el in enumerate(row_cells[1:], start=1):
            if col_idx >= len(headers):
                break
            col_name = headers[col_idx]
            cells_map[col_name] = " ".join(cell_el.text_content().split())

        rows.append(
            PropertyIndexRow(
                prop_name=prop_name,
                spec_id=spec_id,
                order_index=order_index,
                orig_href=orig_href,
                cells=cells_map,
            ),
        )

    return rows


def _extract_biblio_urls(doc: ElementT) -> BiblioUrlMap:
    """Extract #biblio-* target URLs from References before backmatter is dropped."""
    biblio_urls: BiblioUrlMap = {}
    for dt in xpath_elements(doc, "//dt[@id]"):
        dt_id = (dt.get("id") or "").strip()
        if not dt_id.startswith(("biblio-", "ref-")):
            continue
        dd = dt.getnext()
        if dd is not None and isinstance(dd, lxml.html.HtmlElement) and dd.tag == "dd":
            links = xpath_elements(dd, ".//a[@href]")
            if links:
                href = (links[0].get("href") or "").strip()
                if href.startswith(("http://", "https://")):
                    biblio_urls[dt_id] = href
    return biblio_urls


class SectionBlock(NamedTuple):
    """A heading element paired with its following sibling body elements."""

    heading: ElementT
    level: int
    body: list[ElementT]


def _is_trivial_no_considerations_body(body_elements: list[ElementT]) -> bool:
    """Return True if a Privacy/Security body is empty or a single 'no considerations' sentence."""
    cleaned_nodes: list[ElementT] = []
    for node in body_elements:
        if not _is_element(node):
            continue
        if "wpt-tests-block" in (node.get("class") or "").split():
            continue
        cloned = copy.deepcopy(node)
        for wpt in xpath_elements(cloned, ".//*[contains(@class, 'wpt-tests-block')]"):
            remove_preserving_tail(wpt)
        cleaned_nodes.append(cloned)

    for node in cleaned_nodes:
        if node.xpath(COMPLEX_CONTENT_XPATH):
            return False

    raw_text = " ".join(" ".join(node.text_content().split()) for node in cleaned_nodes).strip()
    text = NON_NORMATIVE_BOILERPLATE_RE.sub("", raw_text).strip()
    if not text:
        return True
    if len(text) > MAX_TRIVIAL_SENTENCE_LEN:
        return False

    sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(text) if s.strip()]
    if len(sentences) != 1:
        return False

    sent = sentences[0]
    if SEC_PRIV_DISQUALIFIER_RE.search(sent):
        return False
    if TRIVIAL_PLACEHOLDER_RE.match(sent):
        return True
    return bool(NO_CONSIDERATIONS_RE.search(sent))


def _filter_trivial_security_privacy(elements: list[ElementT]) -> list[ElementT]:
    """Remove Privacy/Security sections that only contain a single 'no considerations' sentence."""
    # Unwrap any outer <section>/<div> wrappers into flat elements so each Privacy/Security
    # heading and its prose can be evaluated uniformly.
    flat: list[ElementT] = []
    for el in elements:
        if not _is_element(el):
            continue
        if el.tag in {"section", "div"} and xpath_elements(
            el,
            "./*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]",
        ):
            flat.extend(child for child in el if _is_element(child))
        else:
            flat.append(el)

    if not flat:
        return []

    heading_levels = [lvl for el in flat if (lvl := _heading_level(el)) is not None]
    if not heading_levels:
        return []
    top_level = min(heading_levels)

    # Split flat elements into top-level blocks delimited by headings at top_level.
    blocks: list[SectionBlock] = []
    preamble: list[ElementT] = []
    cur_heading: ElementT | None = None
    cur_body: list[ElementT] = []

    for el in flat:
        lvl = _heading_level(el)
        if lvl is not None and lvl <= top_level:
            if cur_heading is not None:
                blocks.append(SectionBlock(heading=cur_heading, level=top_level, body=cur_body))
            cur_heading = el
            cur_body = []
        elif cur_heading is None:
            preamble.append(el)
        else:
            cur_body.append(el)

    if cur_heading is not None:
        blocks.append(SectionBlock(heading=cur_heading, level=top_level, body=cur_body))

    kept_elements: list[ElementT] = list(preamble)
    for block in blocks:
        sub_headings = [el for el in block.body if _heading_level(el) is not None]
        if sub_headings:
            if any(_classify_heading(sh) == "sec_priv" for sh in sub_headings):
                # Split intro before first sub-heading and recursively filter child sec_priv blocks.
                first_sub_idx = next(i for i, el in enumerate(block.body) if _heading_level(el) is not None)
                intro_nodes = block.body[:first_sub_idx]
                filtered_subs = _filter_trivial_security_privacy(block.body[first_sub_idx:])
                if filtered_subs or not _is_trivial_no_considerations_body(intro_nodes):
                    kept_elements.append(block.heading)
                    kept_elements.extend(intro_nodes)
                    kept_elements.extend(filtered_subs)
            else:
                # Non-sec-priv topical subsections (e.g., questionnaire items or specific threats).
                kept_elements.append(block.heading)
                kept_elements.extend(block.body)
        elif not _is_trivial_no_considerations_body(block.body):
            kept_elements.append(block.heading)
            kept_elements.extend(block.body)

    return kept_elements


def _is_runaway_script(el: ElementT) -> bool:
    """Return True if a <script> does expensive full-DOM work unsafe for the combined spec."""
    if el.tag != "script":
        return False
    src = (el.get("src") or "").lower()
    script_type = (el.get("type") or "").lower()
    code = el.text or ""
    if "mathjax" in src or script_type == "text/x-mathjax-config":
        return True
    if "window.MathJax" in code or "MathJax.Hub" in code:
        return True
    if "file-issue.js" in src:
        return True
    return ".swatch" in code and "getComputedStyle" in code


def _is_wpt_tests_block(el: ElementT) -> bool:
    """Return True if el is a collapsed WPT test listing block."""
    return el.tag == "details" and "wpt-tests-block" in (el.get("class") or "").split()


def _strip_heavy_and_runaway_nodes(elements: list[ElementT]) -> list[ElementT]:
    """Strip WPT test blocks and full-DOM runaway scripts from extracted element trees."""
    kept: list[ElementT] = []
    for root in elements:
        if not _is_element(root):
            continue
        if _is_wpt_tests_block(root) or _is_runaway_script(root):
            continue
        to_remove: list[ElementT] = [
            node
            for node in root.iter()
            if node is not root and _is_element(node) and (_is_wpt_tests_block(node) or _is_runaway_script(node))
        ]
        for node in to_remove:
            remove_preserving_tail(node)
        kept.append(root)
    return kept


def _starts_top_level_chapter(el: ElementT) -> bool:
    """Return True if el begins a component spec's top-level <h2> section."""
    if el.tag == "h2":
        return True
    # Some specs wrap a top-level chapter in a <section> or non-example <div>
    # whose first element child is <h2> (e.g., css2 appendices, css-highlight-api-1,
    # css-spatial-nav-1). Ignore <div class="example"> containing mock headings.
    if el.tag in {"section", "div"} and "example" not in (el.get("class") or "").split():
        first_child = next((child for child in el if _is_element(child)), None)
        if first_child is not None and first_child.tag == "h2":
            return True
    return False


def _wrap_top_level_sections(elements: list[ElementT]) -> list[ElementT]:
    """Wrap each top-level <h2> section (from one <h2> to the next) in a <section>."""
    wrapped: list[ElementT] = []
    current_section: ElementT | None = None

    for el in elements:
        if not _is_element(el):
            continue

        if _starts_top_level_chapter(el):
            if el.tag == "section":
                existing_cls = (el.get("class") or "").strip()
                el.set("class", f"{existing_cls} spec-chapter".strip())
                wrapped.append(el)
                current_section = el
            else:
                sec = lxml.html.Element("section")
                sec.set("class", "spec-chapter")
                sec.append(el)
                wrapped.append(sec)
                current_section = sec
        elif current_section is not None:
            current_section.append(el)
        else:
            # Preamble element before the first <h2> (e.g., MathJax <script> or top note).
            wrapped.append(el)

    return wrapped


def extract_spec(built: BuiltSpec, repo_root: Path) -> ExtractedSpec:
    """Parse a BuiltSpec's HTML and extract its meaningful content, metadata, and indexes."""
    doc = lxml.html.fromstring(built.html)
    extracted = ExtractedSpec(meta=built)
    extracted.biblio_urls = _extract_biblio_urls(doc)

    panel_data = _extract_styles_and_scripts(
        doc=doc,
        spec_id=built.spec_id,
        repo_root=repo_root,
        boilerplate_styles=extracted.boilerplate_styles,
        boilerplate_scripts=extracted.boilerplate_scripts,
        custom_styles=extracted.custom_styles,
        custom_stylesheets=extracted.custom_stylesheets,
        custom_scripts=extracted.custom_scripts,
    )
    extracted.raw_dfn_panels = panel_data.dfn_panels
    extracted.raw_ref_hints = panel_data.ref_hints

    main_el = doc.find(".//main")
    if main_el is not None:
        raw_children = [child for child in main_el if _is_element(child)]
    else:
        raw_children = _extract_legacy_html_body_elements(doc)

    partitioned = _partition_section_elements(raw_children)
    cleaned_kept = _strip_heavy_and_runaway_nodes(partitioned.kept)
    wrapped_main = _wrap_top_level_sections(cleaned_kept)
    filtered_sec_priv = _strip_heavy_and_runaway_nodes(
        _filter_trivial_security_privacy(partitioned.security_privacy),
    )
    extracted.main_elements = wrapped_main
    extracted.security_privacy_elements = filtered_sec_priv

    all_kept_roots = wrapped_main + filtered_sec_priv
    for root in all_kept_roots:
        for el in root.iter():
            if not _is_element(el):
                continue
            el_id = el.get("id")
            if el_id:
                extracted.surviving_ids.add(el_id)
                if el.tag in HEADING_TAGS:
                    extracted.original_heading_ids[el] = el_id

    for details_el in xpath_elements(doc, "//body/details[contains(@class, 'mdn-anno')]"):
        anno_for = (details_el.get("data-anno-for") or "").strip()
        if anno_for and anno_for in extracted.surviving_ids:
            cloned_anno = copy.deepcopy(details_el)
            for sub in cloned_anno.iter():
                if _is_element(sub):
                    sid = sub.get("id")
                    if sid:
                        extracted.surviving_ids.add(sid)
            extracted.mdn_annotations.append(cloned_anno)

    extracted.internal_index = _extract_internal_index(
        doc=doc,
        spec_id=built.spec_id,
        surviving_ids=extracted.surviving_ids,
        kept_roots=all_kept_roots,
    )
    extracted.external_index = _extract_external_index(
        doc=doc,
        spec_id=built.spec_id,
        raw_dfn_panels=panel_data.dfn_panels,
    )
    extracted.property_rows = _extract_property_index(
        doc=doc,
        spec_id=built.spec_id,
        order_index=built.order_index,
        surviving_ids=extracted.surviving_ids,
    )

    return extracted
