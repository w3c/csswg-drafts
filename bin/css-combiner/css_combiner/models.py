"""Data structures and type aliases for the CSS Combiner pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, NamedTuple, TypeAlias

import lxml.html

SpecId: TypeAlias = str
Shortname: TypeAlias = str
ElementT: TypeAlias = lxml.html.HtmlElement
SpecConfigMap: TypeAlias = dict[SpecId, "SpecConfig"]
SkipMap: TypeAlias = dict[SpecId, str]
ReplacedSpecMap: TypeAlias = dict[SpecId, list[SpecId]]
BiblioUrlMap: TypeAlias = dict[str, str]
CurrentWorkMap: TypeAlias = dict[Shortname, int | None]
LegacyRedirectMap: TypeAlias = dict[str, str]
ShortnameLevelsMap: TypeAlias = dict[Shortname, list["LevelSpecEntry"]]
IdRegistry: TypeAlias = dict[SpecId, set[str]]
BoilerplateMap: TypeAlias = dict[str, str]
DfnPanelEntry: TypeAlias = dict[str, Any]
DfnPanelMap: TypeAlias = dict[str, DfnPanelEntry]
RefHintEntry: TypeAlias = dict[str, Any]
RefHintMap: TypeAlias = dict[str, RefHintEntry]
RowCellMap: TypeAlias = dict[str, str]
AttrMap: TypeAlias = dict[str, str]


class SpecConfig(NamedTuple):
    """Configuration entry for an included specification."""

    spec_id: SpecId
    diff_of: SpecId | None
    order_index: int


class LevelSpecEntry(NamedTuple):
    """Associates a numeric level with a combined specification ID."""

    level: int
    spec_id: SpecId


class DiscoveredSpec(NamedTuple):
    """A discovered specification directory and its primary source file."""

    spec_id: SpecId
    source_path: Path
    is_bikeshed: bool
    diff_of: SpecId | None
    order_index: int


class DiscoveryResult(NamedTuple):
    """Result of dynamically scanning the repository against config.toml."""

    specs: list[DiscoveredSpec]
    unconfigured_dirs: list[SpecId]


class BikeshedDiagnostic(NamedTuple):
    """A diagnostic message emitted by Bikeshed while building a spec."""

    spec_id: SpecId
    line_num: str | None
    message_type: str
    text: str


class StyleRuleIssue(NamedTuple):
    """A spec-specific CSS selector that is not scoped with a leading ID."""

    spec_id: SpecId
    source_name: str
    selector: str


class BuiltSpec(NamedTuple):
    """Serialized HTML and metadata produced from building or loading one spec."""

    spec_id: SpecId
    is_bikeshed: bool
    html: str
    title: str
    status: str
    work_status: str | None
    ed_url: str
    tr_url: str | None
    last_edited: str
    diff_of: SpecId | None
    order_index: int
    diagnostics: list[BikeshedDiagnostic]


class CustomStyleBlock(NamedTuple):
    """An inline spec-specific <style> block."""

    spec_id: SpecId
    css_text: str


class CustomStylesheetLink(NamedTuple):
    """A spec-specific external <link rel='stylesheet'> tag."""

    spec_id: SpecId
    href: str
    local_path: Path | None


class CustomScript(NamedTuple):
    """A spec-specific <script> element outside <main>."""

    spec_id: SpecId
    src: str | None
    inline_code: str | None
    attrs: AttrMap


class InternalIndexItem(NamedTuple):
    """A single locally-defined term entry extracted from a spec's index."""

    term_text: str
    orig_target_id: str
    disambiguator: str
    section_label: str
    spec_id: SpecId


class ExternalIndexItem(NamedTuple):
    """A single externally-defined term entry extracted from a spec's index."""

    biblio_label: str
    biblio_lt: str
    term_text: str
    for_qualifier: str | None
    orig_panel_id: str | None
    direct_url: str | None
    spec_id: SpecId


class PropertyIndexRow(NamedTuple):
    """A single property row extracted from a spec's Property Index."""

    prop_name: str
    spec_id: SpecId
    order_index: int
    orig_href: str | None
    cells: RowCellMap


class TocItem(NamedTuple):
    """A heading entry used to construct the Table of Contents."""

    level: int
    heading_id: str
    secno: str
    title_html: str


class TocCollapsibleGroup(NamedTuple):
    """A collapsible <details> top-level Table of Contents entry."""

    heading_id: str
    summary_html: str
    top_link_html: str
    children: list[TocItem]
    unnumbered_children: bool = False


TocEntry: TypeAlias = TocItem | TocCollapsibleGroup


@dataclass
class ExtractedSpec:
    """Extracted DOM components and structured data for a single specification."""

    meta: BuiltSpec
    main_elements: list[ElementT] = field(default_factory=list)
    security_privacy_elements: list[ElementT] = field(default_factory=list)
    mdn_annotations: list[ElementT] = field(default_factory=list)
    surviving_ids: set[str] = field(default_factory=set)
    original_heading_ids: dict[ElementT, str] = field(default_factory=dict)
    internal_index: list[InternalIndexItem] = field(default_factory=list)
    external_index: list[ExternalIndexItem] = field(default_factory=list)
    property_rows: list[PropertyIndexRow] = field(default_factory=list)
    boilerplate_styles: BoilerplateMap = field(default_factory=dict)
    boilerplate_scripts: BoilerplateMap = field(default_factory=dict)
    custom_styles: list[CustomStyleBlock] = field(default_factory=list)
    custom_stylesheets: list[CustomStylesheetLink] = field(default_factory=list)
    custom_scripts: list[CustomScript] = field(default_factory=list)
    raw_dfn_panels: DfnPanelMap = field(default_factory=dict)
    raw_ref_hints: RefHintMap = field(default_factory=dict)
    biblio_urls: BiblioUrlMap = field(default_factory=dict)


def xpath_elements(node: ElementT, expr: str) -> list[ElementT]:
    """Evaluate an XPath expression and return matching HtmlElement instances."""
    raw = node.xpath(expr)
    if not isinstance(raw, list):
        return []
    return [item for item in raw if isinstance(item, lxml.html.HtmlElement)]


def remove_preserving_tail(el: ElementT) -> None:
    """Remove an lxml element from its parent while preserving any trailing tail text."""
    parent = el.getparent()
    if parent is None:
        return
    tail = el.tail
    if tail:
        prev = el.getprevious()
        if prev is not None:
            prev.tail = (prev.tail or "") + tail
        else:
            parent.text = (parent.text or "") + tail
    parent.remove(el)
