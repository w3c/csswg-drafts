"""Builders for the combined Internal/External Indexes, Property Index, and ToC."""

from __future__ import annotations

import copy
import html
import re
from collections import defaultdict
from typing import NamedTuple

from .models import (
    DfnPanelMap,
    ElementT,
    ExtractedSpec,
    InternalIndexItem,
    PropertyIndexRow,
    TocCollapsibleGroup,
    TocEntry,
    TocItem,
    remove_preserving_tail,
)
from .rewriter import LinkResolver, make_external_panel_id

NON_ALNUM_RE = re.compile(r"[^a-z0-9]")
HEADING_TAGS: frozenset[str] = frozenset({"h2", "h3", "h4", "h5", "h6"})
BASE_PROPERTY_COLUMNS: tuple[str, ...] = (
    "Value",
    "New values",
    "Initial",
    "Applies to",
    "Inh.",
    "%ages",
    "Computed value",
    "Canonical order",
    "Animation type",
)


class TermSortKey(NamedTuple):
    """Bikeshed-compatible sort key for index terms."""

    alnum_lower: str
    lower: str
    exact: str


class InternalSubItemKey(NamedTuple):
    """Sort key for disambiguated sub-entries under an internal index term."""

    disamb_lower: str
    spec_id: str
    section_label: str


class DeduplicatedExtKey(NamedTuple):
    """Uniqueness key for externally-defined terms across specs."""

    biblio_upper: str
    term_text: str
    for_qualifier: str
    direct_url: str


class KeptExternalTerm(NamedTuple):
    """A surviving external term entry after filtering out combined specs."""

    biblio_label: str
    biblio_lt: str
    term_text: str
    for_qualifier: str | None
    direct_url: str | None


class ExtTermSortKey(NamedTuple):
    """Sort key for external terms under a bibliography heading."""

    term_key: TermSortKey
    for_qualifier: str


class PropRowSortKey(NamedTuple):
    """Sort key ordering properties alphabetically while keeping multi-spec rows adjacent."""

    alnum_lower: str
    lower: str
    exact: str
    order_index: int


class IndexBucket(NamedTuple):
    """Display label and HTML ID slug for an alphabetical index chunk."""

    label: str
    slug: str


def _index_letter_bucket(alnum_lower: str) -> IndexBucket:
    """Map a normalized sort string to its alphabetical bucket (# or A-Z)."""
    if alnum_lower and "a" <= alnum_lower[0] <= "z":
        ch = alnum_lower[0]
        return IndexBucket(label=ch.upper(), slug=ch)
    return IndexBucket(label="#", slug="symbols")


def _render_index_jump_nav(buckets: list[IndexBucket], id_prefix: str, aria_label: str) -> str:
    """Render a compact alphabetical jump bar for chunked index sections."""
    links = [f'<a href="#{html.escape(id_prefix, quote=True)}-{b.slug}">{html.escape(b.label)}</a>' for b in buckets]
    return (
        f' <nav class="index-jump-nav" aria-label="{html.escape(aria_label, quote=True)}">' + " ".join(links) + "</nav>"
    )


def _term_sort_key(term: str) -> TermSortKey:
    """Compute Bikeshed's three-part human-friendly alphabetical sort key."""
    lower = term.lower()
    return TermSortKey(
        alnum_lower=NON_ALNUM_RE.sub("", lower),
        lower=lower,
        exact=term,
    )


def _format_disambiguator_with_spec(disambiguator: str, spec_id: str) -> str:
    """Include the spec's versioned shortname in a term's disambiguation label."""
    if spec_id in disambiguator:
        return disambiguator
    return f"{disambiguator}, in {spec_id}"


def build_combined_index_html(
    extracted_specs: list[ExtractedSpec],
    resolver: LinkResolver,
    rewritten_external_urls: set[str],
    merged_dfn_panels: DfnPanelMap,
) -> str:
    """Generate the combined #index section containing Internal and External indexes."""
    internal_by_term: dict[str, list[InternalIndexItem]] = defaultdict(list)
    for spec in extracted_specs:
        for item in spec.internal_index:
            internal_by_term[item.term_text].append(item)

    sorted_terms = sorted(internal_by_term.keys(), key=_term_sort_key)
    internal_by_bucket: dict[IndexBucket, list[str]] = {}
    for term in sorted_terms:
        entries = internal_by_term[term]
        esc_term = html.escape(term)
        bucket = _index_letter_bucket(_term_sort_key(term).alnum_lower)
        bucket_lis = internal_by_bucket.setdefault(bucket, [])
        if len(entries) == 1:
            only = entries[0]
            href = html.escape(f"#{only.spec_id}:{only.orig_target_id}", quote=True)
            loc = f"{only.spec_id} {only.section_label}".strip()
            span_html = f"<span>, in {html.escape(loc)}</span>" if loc else ""
            bucket_lis.append(f'   <li><a href="{href}">{esc_term}</a>{span_html}</li>')
        else:
            sorted_sub = sorted(
                entries,
                key=lambda e: InternalSubItemKey(
                    disamb_lower=_format_disambiguator_with_spec(e.disambiguator, e.spec_id).lower(),
                    spec_id=e.spec_id,
                    section_label=e.section_label,
                ),
            )
            sub_lis: list[str] = []
            for sub in sorted_sub:
                href = html.escape(f"#{sub.spec_id}:{sub.orig_target_id}", quote=True)
                disamb = html.escape(_format_disambiguator_with_spec(sub.disambiguator, sub.spec_id))
                span_html = f"<span>, in {html.escape(sub.section_label)}</span>" if sub.section_label else ""
                sub_lis.append(f'     <li><a href="{href}">{disamb}</a>{span_html}</li>')
            sub_block = "\n".join(sub_lis)
            bucket_lis.append(f"   <li>\n    {esc_term}\n    <ul>\n{sub_block}\n    </ul>\n   </li>")

    # Filter and deduplicate external index entries.
    seen_ext: set[DeduplicatedExtKey] = set()
    ext_by_biblio: dict[str, list[KeptExternalTerm]] = defaultdict(list)
    biblio_display: dict[str, str] = {}

    for spec in extracted_specs:
        for ext in spec.external_index:
            if ext.biblio_lt in resolver.combined_ids:
                continue
            if ext.direct_url:
                stripped_url = ext.direct_url.strip()
                if stripped_url in rewritten_external_urls:
                    continue
                res = resolver.rewrite_url(stripped_url, spec.meta.spec_id)
                if res.resolved_to_combined:
                    continue

            bib_key = ext.biblio_label.upper()
            dedup_key = DeduplicatedExtKey(
                biblio_upper=bib_key,
                term_text=ext.term_text,
                for_qualifier=ext.for_qualifier or "",
                direct_url=ext.direct_url or "",
            )
            if dedup_key in seen_ext:
                continue
            seen_ext.add(dedup_key)
            biblio_display.setdefault(bib_key, ext.biblio_label)
            ext_by_biblio[bib_key].append(
                KeptExternalTerm(
                    biblio_label=ext.biblio_label,
                    biblio_lt=ext.biblio_lt,
                    term_text=ext.term_text,
                    for_qualifier=ext.for_qualifier,
                    direct_url=ext.direct_url,
                ),
            )

    external_by_bucket: dict[IndexBucket, list[str]] = {}
    for bib_key in sorted(ext_by_biblio.keys()):
        label = html.escape(biblio_display[bib_key])
        bucket = _index_letter_bucket(NON_ALNUM_RE.sub("", bib_key.lower()))
        terms = sorted(
            ext_by_biblio[bib_key],
            key=lambda t: ExtTermSortKey(_term_sort_key(t.term_text), t.for_qualifier or ""),
        )
        term_lis: list[str] = []
        for t_item in terms:
            esc_text = html.escape(t_item.term_text)
            qual_html = f" <small>{html.escape(t_item.for_qualifier)}</small>" if t_item.for_qualifier else ""
            if t_item.direct_url:
                ext_pid = make_external_panel_id(
                    bib_key,
                    t_item.direct_url,
                    t_item.term_text,
                    t_item.for_qualifier or "",
                )
                if ext_pid in merged_dfn_panels:
                    esc_pid = html.escape(ext_pid, quote=True)
                    term_lis.append(
                        f'     <li><span class="dfn-paneled" id="{esc_pid}">{esc_text}{qual_html}</span></li>',
                    )
                else:
                    esc_url = html.escape(t_item.direct_url, quote=True)
                    term_lis.append(
                        f'     <li><a href="{esc_url}">{esc_text}</a>{qual_html}</li>',
                    )
            else:
                term_lis.append(f"     <li><span>{esc_text}{qual_html}</span></li>")

        terms_block = "\n".join(term_lis)
        external_by_bucket.setdefault(bucket, []).append(
            f'   <li>\n    <span class="biblio-tag">[{label}]</span> defines the following terms:\n'
            + f"    <ul>\n{terms_block}\n    </ul>\n   </li>",
        )

    internal_buckets = list(internal_by_bucket.keys())
    parts: list[str] = [
        '<section id="index-section">',
        (
            ' <h2 class="heading no-num no-ref settled" id="index">'
            + '<span class="content">Index</span><a class="self-link" href="#index"></a></h2>'
        ),
        (
            ' <h3 class="heading no-num no-ref settled" id="index-defined-here">'
            + '<span class="content">Terms defined by CSS specifications</span>'
            + '<a class="self-link" href="#index-defined-here"></a></h3>'
        ),
        _render_index_jump_nav(internal_buckets, "index-here", "Internal index letters"),
    ]
    for bucket in internal_buckets:
        lis_html = "\n".join(internal_by_bucket[bucket])
        parts.extend(
            [
                f' <section class="index-chunk" id="index-here-{bucket.slug}">',
                (
                    '  <h4 class="heading no-num no-toc no-ref settled index-letter-heading" '
                    + f'id="index-here-heading-{bucket.slug}">'
                    + f'<span class="content">{html.escape(bucket.label)}</span>'
                    + f'<a class="self-link" href="#index-here-heading-{bucket.slug}"></a></h4>'
                ),
                '  <ul class="index">',
                lis_html,
                "  </ul>",
                " </section>",
            ],
        )

    if external_by_bucket:
        external_buckets = list(external_by_bucket.keys())
        parts.extend(
            [
                (
                    ' <h3 class="heading no-num no-ref settled" id="index-defined-elsewhere">'
                    + '<span class="content">Terms defined by reference</span>'
                    + '<a class="self-link" href="#index-defined-elsewhere"></a></h3>'
                ),
                _render_index_jump_nav(external_buckets, "index-ext", "External index letters"),
            ],
        )
        for bucket in external_buckets:
            lis_html = "\n".join(external_by_bucket[bucket])
            parts.extend(
                [
                    f' <section class="index-chunk" id="index-ext-{bucket.slug}">',
                    (
                        '  <h4 class="heading no-num no-toc no-ref settled index-letter-heading" '
                        + f'id="index-ext-heading-{bucket.slug}">'
                        + f'<span class="content">{html.escape(bucket.label)}</span>'
                        + f'<a class="self-link" href="#index-ext-heading-{bucket.slug}"></a></h4>'
                    ),
                    '  <ul class="index">',
                    lis_html,
                    "  </ul>",
                    " </section>",
                ],
            )
    parts.append("</section>")
    return "\n".join(parts)


def _format_prop_header(col_name: str) -> str:
    """Add Bikeshed's soft-hyphenation to narrow property-index column headers."""
    hyphenated = {
        "Animatable": "Ani\xadmat\xadable",
        "Animation type": "Anim\xadation type",
        "Computed value": "Com\xadputed value",
    }
    return html.escape(hyphenated.get(col_name, col_name))


def build_property_index_html(extracted_specs: list[ExtractedSpec]) -> str:
    """Generate the combined #property-index table sorted alphabetically with a Spec column."""
    all_rows: list[PropertyIndexRow] = []
    used_cols: set[str] = set()
    for spec in extracted_specs:
        for row in spec.property_rows:
            all_rows.append(row)
            for col_key, val in row.cells.items():
                if val:
                    used_cols.add(col_key)

    all_rows.sort(
        key=lambda r: PropRowSortKey(
            alnum_lower=NON_ALNUM_RE.sub("", r.prop_name.lower()),
            lower=r.prop_name.lower(),
            exact=r.prop_name,
            order_index=r.order_index,
        ),
    )

    ordered_data_cols: list[str] = [c for c in BASE_PROPERTY_COLUMNS if c in used_cols]
    extra_cols = sorted(used_cols - set(ordered_data_cols))
    ordered_data_cols.extend(extra_cols)

    header_ths = [
        '     <th scope="col">Name</th>',
        '     <th scope="col">Spec</th>',
    ]
    for col in ordered_data_cols:
        header_ths.append(f'     <th scope="col">{_format_prop_header(col)}</th>')

    rows_by_bucket: dict[IndexBucket, list[str]] = {}
    for row in all_rows:
        bucket = _index_letter_bucket(NON_ALNUM_RE.sub("", row.prop_name.lower()))
        esc_name = html.escape(row.prop_name)
        esc_spec = html.escape(row.spec_id)
        if row.orig_href and row.orig_href.startswith("#"):
            href = html.escape(f"#{row.spec_id}:{row.orig_href[1:]}", quote=True)
            name_html = f'<a class="css" data-link-type="property" href="{href}">{esc_name}</a>'
        else:
            name_html = f"<code>{esc_name}</code>"

        spec_html = f'<a href="#{esc_spec}"><code>{esc_spec}</code></a>'
        tds = [f"     <td>{html.escape(row.cells.get(col, ''))}</td>" for col in ordered_data_cols]
        row_html = "\n".join(
            [
                "    <tr>",
                f'     <th scope="row">{name_html}</th>',
                f"     <td>{spec_html}</td>",
                *tds,
                "    </tr>",
            ],
        )
        rows_by_bucket.setdefault(bucket, []).append(row_html)

    prop_buckets = list(rows_by_bucket.keys())
    header_html = "\n".join(header_ths)
    parts: list[str] = [
        '<section id="property-index-section">',
        (
            ' <h2 class="heading no-num no-ref settled" id="property-index">'
            + '<span class="content">Property Index</span>'
            + '<a class="self-link" href="#property-index"></a></h2>'
        ),
        _render_index_jump_nav(prop_buckets, "prop-index", "Property index letters"),
    ]
    for bucket in prop_buckets:
        body_html = "\n".join(rows_by_bucket[bucket])
        parts.extend(
            [
                f' <section class="index-chunk" id="prop-index-{bucket.slug}">',
                (
                    '  <h3 class="heading no-num no-toc no-ref settled index-letter-heading" '
                    + f'id="prop-index-heading-{bucket.slug}">'
                    + f'<span class="content">{html.escape(bucket.label)}</span>'
                    + f'<a class="self-link" href="#prop-index-heading-{bucket.slug}"></a></h3>'
                ),
                '  <div class="big-element-wrapper">',
                '   <table class="index">',
                "    <thead>",
                "     <tr>",
                header_html,
                "     </tr>",
                "    </thead>",
                "    <tbody>",
                body_html,
                "    </tbody>",
                "   </table>",
                "  </div>",
                " </section>",
            ],
        )
    parts.append("</section>")
    return "\n".join(parts)


def collect_toc_items_from_elements(roots: list[ElementT]) -> list[TocItem]:
    """Extract ToC entries from heading elements within a list of DOM subtrees."""
    toc_items: list[TocItem] = []
    for root in roots:
        for el in root.iter():
            if not isinstance(getattr(el, "tag", None), str) or el.tag not in HEADING_TAGS:
                continue
            classes = set((el.get("class") or "").split())
            if "no-toc" in classes:
                continue
            hid = el.get("id")
            if not hid:
                continue
            level = int(el.tag[1])

            cloned = copy.deepcopy(el)
            secno_text = ""
            for sec_el in cloned.xpath(".//*[contains(@class, 'secno')]"):
                secno_text = " ".join(sec_el.text_content().split())
                remove_preserving_tail(sec_el)
            for drop_el in cloned.xpath(
                ".//*[contains(@class, 'self-link') or contains(@class, 'source-spec-link')]",
            ):
                remove_preserving_tail(drop_el)

            title_text = " ".join(cloned.text_content().split())
            if not title_text:
                continue
            toc_items.append(
                TocItem(
                    level=level,
                    heading_id=hid,
                    secno=secno_text,
                    title_html=html.escape(title_text),
                ),
            )
    return toc_items


def _render_toc_item_link(item: TocItem) -> str:
    """Render the <a> inner markup for a single TocItem."""
    href = html.escape(f"#{item.heading_id}", quote=True)
    secno_span = (
        f'<span class="secno">{html.escape(item.secno)} </span>' if item.secno else '<span class="secno"></span>'
    )
    return f'<a href="{href}">{secno_span}<span class="content">{item.title_html}</span></a>'


def _render_flat_toc_items(items: list[TocItem], indent: str = " ") -> list[str]:
    """Render TocItems as flat <li> elements with heading-level classes (no nested <ol>s)."""
    out: list[str] = []
    for item in items:
        level = max(2, min(6, item.level))
        out.append(f'{indent}<li class="toc-level-{level}">{_render_toc_item_link(item)}</li>')
    return out


def _render_collapsible_toc_group(group: TocCollapsibleGroup) -> str:
    """Render a closed <details> ToC entry with its heading link and a single flat <ol>."""
    esc_href = html.escape(f"#{group.heading_id}", quote=True)
    lines: list[str] = [
        "  <li>",
        '   <details class="toc-spec-details">',
        f"    <summary>{group.summary_html}</summary>",
        f'    <a class="toc-group-link" href="{esc_href}">{group.top_link_html}</a>',
    ]
    if group.children:
        ol_class = "toc toc-unnumbered" if group.unnumbered_children else "toc"
        sub_lines = _render_flat_toc_items(group.children, indent="     ")
        lines.extend(
            [
                f'    <ol class="{ol_class}">',
                *sub_lines,
                "    </ol>",
            ],
        )
    lines.extend(
        [
            "   </details>",
            "  </li>",
        ],
    )
    return "\n".join(lines)


def render_toc_nav_html(entries: list[TocEntry]) -> str:
    """Render a Bikeshed-compatible <nav id='toc'> with collapsible groups and flat <ol>s."""
    if not entries:
        return ""

    out: list[str] = [
        '<nav data-fill-with="table-of-contents" id="toc">',
        ' <h2 class="no-num no-toc no-ref" id="contents">Table of Contents</h2>',
        ' <ol class="toc">',
    ]

    pending_flat: list[TocItem] = []

    def _flush_flat() -> None:
        if not pending_flat:
            return
        out.extend(_render_flat_toc_items(pending_flat, indent="  "))
        pending_flat.clear()

    for entry in entries:
        if isinstance(entry, TocCollapsibleGroup):
            _flush_flat()
            out.append(_render_collapsible_toc_group(entry))
        else:
            pending_flat.append(entry)

    _flush_flat()
    out.append(" </ol>")
    out.append("</nav>")
    return "\n".join(out)
