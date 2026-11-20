"""Direct HTML-to-Markdown serializer tailored for CSSWG/Bikeshed documents."""

from __future__ import annotations

import re

import lxml.html

from .models import ElementT

OMITTED_IDS: frozenset[str] = frozenset(
    {
        "toc",
        "unconfigured-specs-warning",
        "property-index-section",
        "index-section",
        "build-errors-section",
    },
)
OMITTED_TAGS: frozenset[str] = frozenset({"head", "style", "script", "noscript", "button"})
OMITTED_CLASSES: frozenset[str] = frozenset(
    {
        "self-link",
        "source-spec-link",
        "mdn-anno",
        "wpt-tests-block",
        "dfn-panel",
        "ref-hint",
    },
)
HEADING_TAGS: frozenset[str] = frozenset({"h1", "h2", "h3", "h4", "h5", "h6"})
BLOCK_TAGS: frozenset[str] = frozenset(
    {
        "address",
        "article",
        "aside",
        "blockquote",
        "dd",
        "details",
        "div",
        "dl",
        "dt",
        "figcaption",
        "figure",
        "footer",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hr",
        "li",
        "main",
        "nav",
        "ol",
        "p",
        "pre",
        "section",
        "table",
        "ul",
    },
)
MULTI_BLANK_RE = re.compile(r"\n{3,}")
INLINE_WS_RE = re.compile(r"[ \t\r\n]+")


def _is_element(node: object) -> bool:
    """Return True if node is a standard HTML/SVG element."""
    return isinstance(getattr(node, "tag", None), str)


def _classes(el: ElementT) -> set[str]:
    """Return the set of CSS class names on an element."""
    raw = el.get("class")
    return set(raw.split()) if raw else set()


def _should_skip(el: ElementT) -> bool:
    """Return True if el is human-only UI chrome or redundant index markup."""
    if not _is_element(el):
        return True
    if el.tag in OMITTED_TAGS:
        return True
    if (el.get("id") or "") in OMITTED_IDS:
        return True
    return bool(_classes(el) & OMITTED_CLASSES)


def _wrap_inline_code(text: str) -> str:
    """Wrap text in Markdown backticks, choosing a fence width that avoids collisions."""
    cleaned = " ".join(text.split())
    if not cleaned:
        return ""
    if "`" not in cleaned:
        return f"`{cleaned}`"
    fence = "``"
    while fence in cleaned:
        fence += "`"
    pad = " " if cleaned.startswith("`") or cleaned.endswith("`") else ""
    return f"{fence}{pad}{cleaned}{pad}{fence}"


def _collapse_ws(text: str) -> str:
    """Collapse runs of HTML whitespace into single spaces."""
    return INLINE_WS_RE.sub(" ", text)


def _is_autolink(el: ElementT) -> bool:
    """Return True if an <a> is a Bikeshed autolink whose href should be omitted in Markdown."""
    return bool(el.get("data-link-type")) or ":ref-for-" in (el.get("id") or "")


def _serialize_inline(el: ElementT, in_code: bool = False) -> str:
    """Serialize an element and its children as inline Markdown."""
    if _should_skip(el):
        return ""

    tag = el.tag.lower()
    cls = _classes(el)

    if tag == "br":
        return " "
    if tag == "img":
        alt = _collapse_ws(el.get("alt") or "").strip()
        src = (el.get("src") or "").strip()
        return f"![{alt}]({src})" if src else ""
    if tag == "svg":
        titles = el.xpath("./*[local-name()='title' or local-name()='desc']")
        if titles:
            desc = _collapse_ws(titles[0].text_content()).strip()
            if desc:
                return f"*[Diagram: {desc}]*"
        return ""

    is_code_like = not in_code and (
        tag in {"code", "samp", "kbd"}
        or ("css" in cls and tag in {"span", "a"})
        or ("property" in cls and tag in {"span", "a"})
    )
    if is_code_like:
        code_str = _wrap_inline_code(el.text_content())
        if tag == "a" and not _is_autolink(el):
            href = (el.get("href") or "").strip()
            if href and code_str:
                return f"[{code_str}]({href})"
        return code_str

    parts: list[str] = []
    if el.text:
        parts.append(_collapse_ws(el.text))
    for child in el:
        if _is_element(child):
            parts.append(_serialize_inline(child, in_code=in_code))
        if child.tail:
            parts.append(_collapse_ws(child.tail))

    inner = "".join(parts)
    if not inner.strip():
        return inner

    if tag == "dfn":
        stripped = inner.strip()
        lead = " " if inner[0].isspace() else ""
        trail = " " if inner[-1].isspace() else ""
        return f"{lead}**{stripped}**{trail}"

    if tag in {"strong", "b"}:
        stripped = inner.strip()
        lead = " " if inner[0].isspace() else ""
        trail = " " if inner[-1].isspace() else ""
        return f"{lead}**{stripped}**{trail}"

    if tag in {"em", "i", "var"}:
        stripped = inner.strip()
        lead = " " if inner[0].isspace() else ""
        trail = " " if inner[-1].isspace() else ""
        return f"{lead}*{stripped}*{trail}"

    if tag == "a":
        href = (el.get("href") or "").strip()
        # Omit repetitive Bikeshed autolink hrefs to save agent context tokens,
        # while retaining explicit section and external URL links.
        if not href or _is_autolink(el):
            return inner
        stripped = inner.strip()
        lead = " " if inner[0].isspace() else ""
        trail = " " if inner[-1].isspace() else ""
        return f"{lead}[{stripped}]({href}){trail}"

    return inner


def _detect_fence_lang(pre_el: ElementT) -> str:
    """Infer a syntax-highlighting language tag for a <pre> block."""
    cls = _classes(pre_el)
    for token in cls:
        if token.startswith("lang-"):
            return token[5:]
        if token.startswith("language-"):
            return token[9:]
    if "idl" in cls:
        return "webidl"
    if cls & {"propdef", "descdef", "prod", "css"}:
        return "css"
    return ""


def _serialize_pre(pre_el: ElementT) -> str:
    """Serialize a <pre> element as a fenced Markdown code block."""
    raw = pre_el.text_content().strip("\n")
    if not raw.strip():
        return ""
    lang = _detect_fence_lang(pre_el)
    fence = "```"
    while fence in raw:
        fence += "`"
    return f"{fence}{lang}\n{raw}\n{fence}"


def _clean_table_cell(cell_el: ElementT) -> str:
    """Serialize a <th> or <td> into single-line pipe-escaped GFM cell content."""
    text = _serialize_inline(cell_el).strip()
    text = re.sub(r"\s+", " ", text)
    return text.replace("|", "\\|")


def _serialize_table(table_el: ElementT) -> str:
    """Serialize an HTML <table> into a GitHub-Flavored Markdown pipe table."""
    header_rows: list[list[str]] = []
    body_rows: list[list[str]] = []

    for tr in table_el.xpath("./thead/tr"):
        if _is_element(tr):
            cells = [_clean_table_cell(c) for c in tr if _is_element(c) and c.tag in {"th", "td"}]
            if cells:
                header_rows.append(cells)

    raw_body_trs = table_el.xpath("./tbody/tr | ./tr")
    for tr in raw_body_trs:
        if _is_element(tr):
            cells = [_clean_table_cell(c) for c in tr if _is_element(c) and c.tag in {"th", "td"}]
            if cells:
                body_rows.append(cells)

    for tr in table_el.xpath("./tfoot/tr"):
        if _is_element(tr):
            cells = [_clean_table_cell(c) for c in tr if _is_element(c) and c.tag in {"th", "td"}]
            if cells:
                body_rows.append(cells)

    all_rows = header_rows + body_rows
    if not all_rows:
        return ""

    col_count = max(len(r) for r in all_rows)
    if col_count == 0:
        return ""

    def _pad(row: list[str]) -> list[str]:
        return row + [""] * (col_count - len(row))

    cls = _classes(table_el)
    if header_rows:
        hdr = _pad(header_rows[0])
        data_rows = [_pad(r) for r in header_rows[1:] + body_rows]
    elif "def" in cls or "propdef" in cls or "descdef" in cls:
        hdr = ["Field", "Value"] + ([""] * max(0, col_count - 2))
        data_rows = [_pad(r) for r in body_rows]
    else:
        hdr = _pad(body_rows[0])
        data_rows = [_pad(r) for r in body_rows[1:]]

    lines: list[str] = [
        "| " + " | ".join(hdr) + " |",
        "| " + " | ".join("---" for _ in range(col_count)) + " |",
    ]
    for r in data_rows:
        lines.append("| " + " | ".join(r) + " |")
    return "\n".join(lines)


def _prefix_blockquote(text: str, label: str | None = None) -> str:
    """Format a multi-line Markdown string as a blockquote with an optional bold label."""
    stripped = text.strip()
    if not stripped:
        return ""
    if label:
        # Remove redundant leading "Note:" / "Issue:" if already present in prose.
        stripped = re.sub(rf"^{re.escape(label)}\s*[,:]?\s*", "", stripped, flags=re.IGNORECASE)
        stripped = f"**{label}:** {stripped}"
    quoted_lines = [f"> {line}" if line.strip() else ">" for line in stripped.splitlines()]
    return "\n".join(quoted_lines)


def _serialize_list(list_el: ElementT, indent_level: int = 0) -> str:
    """Serialize a <ul> or <ol> element with nested indentation."""
    ordered = list_el.tag.lower() == "ol"
    items_out: list[str] = []
    indent = "  " * indent_level
    counter = 1

    for child in list_el:
        if not _is_element(child) or child.tag.lower() != "li" or _should_skip(child):
            continue
        marker = f"{counter}. " if ordered else "- "
        counter += 1
        li_body = _serialize_container_children(child, list_indent=indent_level + 1).strip()
        if not li_body:
            continue
        li_lines = li_body.splitlines()
        first_line = f"{indent}{marker}{li_lines[0]}"
        cont_indent = indent + ("   " if ordered else "  ")
        rest_lines = [
            (line if line.startswith("  ") else f"{cont_indent}{line}") if line.strip() else "" for line in li_lines[1:]
        ]
        items_out.append("\n".join([first_line, *rest_lines]))

    return "\n".join(items_out)


def _serialize_dl(dl_el: ElementT) -> str:
    """Serialize a <dl> definition list into clean Markdown."""
    cls = _classes(dl_el)
    if "spec-metadata" in cls:
        lines: list[str] = []
        current_dt = ""
        for child in dl_el:
            if not _is_element(child):
                continue
            if child.tag == "dt":
                current_dt = _serialize_inline(child).strip()
            elif child.tag == "dd" and current_dt:
                dd_val = _serialize_inline(child).strip()
                lines.append(f"- **{current_dt}:** {dd_val}")
        return "\n".join(lines)

    blocks: list[str] = []
    for child in dl_el:
        if not _is_element(child) or _should_skip(child):
            continue
        if child.tag == "dt":
            dt_md = _serialize_inline(child).strip()
            if dt_md:
                blocks.append(f"**{dt_md}**")
        elif child.tag == "dd":
            dd_md = _serialize_container_children(child).strip()
            if dd_md:
                indented = "\n".join(
                    f": {line}" if idx == 0 else (f"  {line}" if line.strip() else "")
                    for idx, line in enumerate(dd_md.splitlines())
                )
                blocks.append(indented)
    return "\n\n".join(blocks)


def _serialize_container_children(parent: ElementT, list_indent: int = 0) -> str:
    """Serialize mixed inline and block children of a container element."""
    chunks: list[str] = []
    inline_buf: list[str] = []

    def _flush_inline() -> None:
        if not inline_buf:
            return
        combined = "".join(inline_buf).strip()
        inline_buf.clear()
        if combined:
            chunks.append(combined)

    if parent.text:
        inline_buf.append(_collapse_ws(parent.text))

    for child in parent:
        if _is_element(child):
            if _should_skip(child):
                pass
            elif child.tag.lower() in BLOCK_TAGS:
                _flush_inline()
                block_md = _serialize_block(child, list_indent=list_indent)
                if block_md:
                    chunks.append(block_md)
            else:
                inline_buf.append(_serialize_inline(child))
        if child.tail:
            inline_buf.append(_collapse_ws(child.tail))

    _flush_inline()
    return "\n\n".join(chunks)


def _serialize_block(el: ElementT, list_indent: int = 0) -> str:
    """Serialize a single block-level HTML element into Markdown."""
    if _should_skip(el):
        return ""

    tag = el.tag.lower()
    cls = _classes(el)

    if tag in HEADING_TAGS:
        lvl = int(tag[1])
        hashes = "#" * lvl
        title = _serialize_inline(el).strip()
        if not title:
            return ""
        hid = (el.get("id") or "").strip()
        anchor_suffix = f" {{#{hid}}}" if hid else ""
        prefix = "---\n\n" if lvl == 2 and ":" not in hid and hid not in {"abstract", "combiner-intro"} else ""
        return f"{prefix}{hashes} {title}{anchor_suffix}"

    if tag == "hr":
        return "---"

    if tag == "pre":
        return _serialize_pre(el)

    if tag == "table":
        return _serialize_table(el)

    if tag in {"ul", "ol"}:
        return _serialize_list(el, indent_level=list_indent)

    if tag == "dl":
        return _serialize_dl(el)

    if tag == "blockquote":
        inner = _serialize_container_children(el)
        return _prefix_blockquote(inner)

    if "note" in cls:
        inner = _serialize_container_children(el)
        return _prefix_blockquote(inner, label="Note")
    if "example" in cls:
        inner = _serialize_container_children(el)
        return _prefix_blockquote(inner, label="Example")
    if "issue" in cls:
        inner = _serialize_container_children(el)
        return _prefix_blockquote(inner, label="Issue")
    if "advisement" in cls:
        inner = _serialize_container_children(el)
        return _prefix_blockquote(inner, label="Advisement")

    if tag == "p":
        return _serialize_inline(el).strip()

    return _serialize_container_children(el, list_indent=list_indent)


def serialize_html_to_markdown(combined_html: str) -> str:
    """Convert the combined `all-css/index.html` document into clean Markdown."""
    # Enable huge_tree so libxml2 does not truncate >10MB merged script text nodes.
    parser = lxml.html.HTMLParser(huge_tree=True, encoding="utf-8")
    doc = lxml.html.fromstring(combined_html.encode("utf-8"), parser=parser)
    body = doc.find("body")
    if body is None:
        return ""

    sections: list[str] = []
    for child in body:
        if not _is_element(child) or _should_skip(child):
            continue
        md = _serialize_block(child)
        if md.strip():
            sections.append(md.strip())

    joined = "\n\n".join(sections)
    normalized = MULTI_BLANK_RE.sub("\n\n", joined).strip()
    return normalized + "\n"
