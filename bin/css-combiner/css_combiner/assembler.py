"""HTML document assembly for `all-css/index.html`."""

from __future__ import annotations

import html
import re
from collections import defaultdict
from datetime import UTC, datetime
from typing import NamedTuple

import lxml.html

from .extractor import REF_HINTS_PLACEHOLDER
from .indexes import (
    build_combined_index_html,
    build_property_index_html,
    collect_toc_items_from_elements,
    render_toc_nav_html,
)
from .models import (
    BikeshedDiagnostic,
    BoilerplateMap,
    ExtractedSpec,
    SpecId,
    StyleRuleIssue,
    TocCollapsibleGroup,
    TocEntry,
    TocItem,
)
from .rewriter import LinkResolver, MergedPanelsResult, rewrite_relative_asset_path

COMBINER_EXTRA_CSS = """\
/* CSS Combiner layout, metadata, and banner styles */
.unconfigured-specs-banner {
    position: relative;
    margin: 1.5em 0;
    padding: 1em 2.5em 1em 1.25em;
    border: 2px solid #cf222e;
    border-left-width: 6px;
    border-radius: 6px;
    background: var(--issue-bg, #fff5f5);
    color: var(--text, #1f2328);
}
.unconfigured-specs-banner h2 {
    margin: 0 0 0.5em;
    font-size: 1.15em;
    color: #cf222e;
}
.unconfigured-specs-banner .dismiss-btn {
    position: absolute;
    top: 0.75em;
    right: 0.75em;
    padding: 0.25em 0.6em;
    border: 1px solid currentColor;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 0.85em;
}
.spec-section {
    margin-top: 3.5em;
    padding-top: 1.5em;
    border-top: 3px solid var(--hr-border, #888);
    counter-reset: example figure issue table;
}
.spec-chapter,
.sec-priv-spec,
.index-chunk,
#build-errors-section {
    content-visibility: auto;
    contain-intrinsic-size: auto 1000px;
    /* Expand paint-containment padding box into the left margin so Bikeshed's
       margin-positioned .self-link anchors (§ / ¶) are not clipped. */
    margin-inline-start: -3.5rem;
    padding-inline-start: 3.5rem;
}
.index-chunk {
    contain-intrinsic-size: auto 500px;
}
@media (max-width: 30em) {
    .spec-chapter,
    .sec-priv-spec,
    .index-chunk,
    #build-errors-section {
        margin-inline-start: 0;
        padding-inline-start: 0;
    }
}
.index-jump-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35em 0.55em;
    margin: 0.75em 0 1.25em;
    font-size: 0.92em;
}
.index-jump-nav a {
    font-weight: 600;
    text-decoration: none;
    padding: 0.1em 0.35em;
    border-radius: 3px;
}
.index-letter-heading {
    margin-top: 1.5em;
    border-bottom: 1px solid var(--hr-border, #ccc);
    padding-bottom: 0.15em;
}
.property-index-table thead th {
    text-align: left;
}
.property-index-table thead tr:first-child th[rowspan="2"] {
    vertical-align: bottom;
}
.property-index-table thead tr + tr th {
    border-top: 1px dotted var(--hr-border, silver);
}
.property-index-table tbody.prop-entry {
    border-top: 2px solid var(--hr-border, silver);
    border-bottom: none;
}
.property-index-table tbody.prop-entry:last-child {
    border-bottom: 2px solid var(--hr-border, silver);
}
.property-index-table tbody.prop-entry > tr.prop-grammar-row > th {
    vertical-align: top;
    text-align: left;
}
.property-index-table tbody.prop-entry > tr.prop-grammar-row > td.prop-grammar {
    text-align: left;
    border-bottom: none;
}
.property-index-table tbody.prop-entry > tr.prop-meta-row > td {
    border-top: 1px dotted var(--hr-border, silver);
}
.property-index-table tbody.prop-entry:hover {
    background: var(--indextable-hover-bg, #f7f8f9);
    color: var(--indextable-hover-text, inherit);
}
.property-index-table tbody.prop-entry > tr:hover,
.property-index-table tbody.prop-entry > tr:hover > :is(th, td) {
    background: transparent;
}
.diagnostics-wrapper {
    margin: 0.75em 0;
}
.diagnostics-wrapper > summary {
    cursor: pointer;
    font-weight: 600;
    padding: 0.4em 0.6em;
    border: 1px solid var(--hr-border, #ccc);
    border-radius: 4px;
    background: var(--note-bg, rgba(127, 127, 127, 0.08));
}
.spec-metadata {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.25em 1em;
    margin: 0.75em 0 1.75em;
    padding: 0.75em 1em;
    border-left: 4px solid var(--toclink-underline, #707070);
    background: var(--note-bg, rgba(127, 127, 127, 0.08));
    border-radius: 0 4px 4px 0;
    font-size: 0.92em;
}
.spec-metadata dt {
    font-weight: 600;
    margin: 0;
}
.spec-metadata dd {
    margin: 0;
}
a.source-spec-link {
    display: inline-block;
    margin-right: 0.35em;
    padding: 0 0.25em;
    font-size: 0.75em;
    font-weight: normal;
    text-decoration: none;
    border: 1px solid currentColor;
    border-radius: 3px;
    opacity: 0.55;
    vertical-align: middle;
}
a.source-spec-link:hover {
    opacity: 1;
}
.diagnostics-spec-block {
    margin: 0.5em 0;
}
.diagnostics-spec-block summary {
    cursor: pointer;
    font-weight: 600;
}
.diagnostics-list {
    font-family: monospace;
    font-size: 0.9em;
    white-space: pre-wrap;
}
#toc details.toc-spec-details {
    grid-column: 1 / -1;
    margin-top: 0.25rem;
}
#toc details.toc-spec-details > summary {
    cursor: pointer;
    font-weight: bold;
    padding: 0.15rem 2px;
    color: var(--toclink-text, inherit);
}
#toc details.toc-spec-details > summary:hover,
#toc details.toc-spec-details > summary:focus {
    background: var(--a-hover-bg, rgba(75%, 75%, 75%, 0.25));
}
#toc#toc details.toc-spec-details > a.toc-group-link {
    display: block;
    margin: 0.35rem 0 0.25rem 1rem;
    padding: 0.1rem 1px;
    font-weight: 600;
}
#toc#toc details.toc-spec-details > ol.toc {
    margin-left: 0;
    padding-left: 1rem;
}
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-4,
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-5,
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-6,
#toc#toc details.toc-spec-details > ol.toc.toc-unnumbered > li {
    font-weight: normal;
}
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-5 {
    font-size: 95%;
}
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-6 {
    font-size: 90%;
}
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-5 .content {
    margin-left: 0.75rem;
}
#toc#toc details.toc-spec-details > ol.toc > li.toc-level-6 .content {
    margin-left: 1.5rem;
}
#toc#toc > ol.toc > li.toc-level-3 > a > span {
    margin-top: 0;
    font-weight: normal;
}
#toc#toc > ol.toc > li.toc-level-3 .content {
    margin-left: 1rem;
}
@supports (display: grid) and (display: contents) {
    #toc#toc details.toc-spec-details > ol.toc {
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 1rem;
        row-gap: 0.5rem;
        margin-top: 0.35rem;
        margin-bottom: 0.4rem;
    }
    #toc .toc li li,
    #toc .toc li li a {
        display: contents;
    }
    #toc#toc details.toc-spec-details > ol.toc.toc-unnumbered {
        grid-template-columns: 1fr;
        column-gap: 0;
    }
    #toc#toc details.toc-spec-details > ol.toc.toc-unnumbered .secno {
        display: none;
    }
    #toc#toc details.toc-spec-details > ol.toc.toc-unnumbered .content {
        grid-column: 1;
    }
}
@media screen {
    body.toc-sidebar #toc#toc {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        height: 100%;
        padding-block: 0;
        overflow: auto;
        overscroll-behavior: contain;
    }
}
@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc#toc {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        height: 100%;
        padding-block: 0;
        overflow: auto;
        overscroll-behavior: contain;
    }
}
#toc#toc a.toc-current > .secno,
#toc#toc a.toc-current > .content,
#toc#toc a.toc-group-link.toc-current {
    background: var(--a-hover-bg, rgba(0, 90, 156, 0.14));
    color: var(--heading-text, #005a9c);
    font-weight: 700;
}
#toc#toc a.toc-current > .content,
#toc#toc a.toc-group-link.toc-current {
    border-bottom: 2px solid var(--heading-text, #005a9c);
    border-radius: 2px;
}
#toc#toc details.toc-spec-details.toc-current-group > summary {
    color: var(--heading-text, #005a9c);
}
"""

SCRIPT_ORDER_PRIORITY: tuple[str, ...] = (
    "script-dom-helper",
    "script-dfn-panel",
    "script-ref-hints",
    "script-mdn-anno",
    "script-position-annos",
)
OMITTED_BOILERPLATE_STYLES: frozenset[str] = frozenset({"style-wpt"})
OMITTED_BOILERPLATE_SCRIPTS: frozenset[str] = frozenset({"script-link-titles", "script-wpt"})

REF_HINT_SHOW_RE = re.compile(
    r"function showRefHint\(link\)\s*\{.*?\n\}\n",
    re.DOTALL,
)

LAZY_DFN_PANEL_PREFIX = """\
/* Boilerplate: script-dfn-panel (lazy combined-spec override) */
"use strict";
{
let dfnPanelDataPromise = null;

function loadDfnPanelData() {
    if (!dfnPanelDataPromise) {
        dfnPanelDataPromise = fetch("./dfn-panels.json")
            .then((resp) => {
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                return resp.json();
            })
            .catch((err) => {
                console.warn("Unable to load ./dfn-panels.json for lazy dfn panels:", err);
                return null;
            });
    }
    return dfnPanelDataPromise;
}

document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a.self-link")) return;
    const dfn = target.closest(".dfn-paneled[id]");
    if (!dfn || dfn.dfnPanel) return;

    const dfnPanelData = await loadDfnPanelData();
    if (!dfnPanelData || dfn.dfnPanel) return;
    const panelData = dfnPanelData[dfn.id];
    if (!panelData) return;

    dfn.panelData = panelData;
    const dfnPanel = genDfnPanel(dfn, panelData);
    const button = dfn.querySelector(":scope > .dfn-panelbutton");
    try {
        if (button) {
            dfnPanel.showPopover({ source: button });
        } else {
            dfnPanel.showPopover();
        }
    } catch {
        dfnPanel.showPopover();
    }
});

"""

LAZY_REF_HINTS_LOADER = """\
let refsDataPromise = null;
let latestHintRequest = 0;

function loadRefsData() {
    if (!refsDataPromise) {
        refsDataPromise = fetch("./ref-hints.json")
            .then((resp) => {
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                return resp.json();
            })
            .catch((err) => {
                console.warn("Unable to load ./ref-hints.json for lazy ref hints:", err);
                return null;
            });
    }
    return refsDataPromise;
}"""

LAZY_SHOW_REF_HINT = """\
async function showRefHint(link) {
    if (link.classList.contains("dfn-link")) return;
    const url = link.getAttribute("href");
    if (!url) return;
    const refHintKey = link.getAttribute("data-refhint-key");
    const key = refHintKey ? refHintKey + "_" + url : url;
    const reqId = ++latestHintRequest;
    const refsData = await loadRefsData();
    if (!refsData || reqId !== latestHintRequest || !link.isConnected) return;
    const ref = refsData[key];
    if (!ref) return;

    hideAllRefHints(); // Only display one at this time.

    const refHint = mkRefHint(link, ref);
    append(document.body, refHint);
    link.setAttribute("aria-expanded", "true");
    positionRefHint(refHint);
}
"""

LAZY_SWATCH_SCRIPT = """\
/* Combined-spec deduplicated color-swatch fallback (no getComputedStyle) */
"use strict";
{
function initColorSwatches() {
    if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return;
    for (const el of document.querySelectorAll(".swatch")) {
        el.tabIndex = 0;
        const swatchColor = el.style.getPropertyValue("--color").trim();
        if (swatchColor && !CSS.supports("color", swatchColor)) {
            el.style.background = "repeating-linear-gradient(135deg, red 0, red 4px, white 4px, white 8px)";
            el.setAttribute("title", "Your browser does not recognize this color value, so we can't preview it.");
        }
    }
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initColorSwatches);
} else {
    initColorSwatches();
}
}"""

TOC_SCROLLSPY_SCRIPT = """\
/* Combined-spec ToC scrollspy (content-visibility:auto friendly via 2-stage binary search) */
"use strict";
{
const CV_REGION_SELECTOR = ".spec-chapter, .sec-priv-spec, #build-errors-section";

function initTocScrollspy() {
    const toc = document.getElementById("toc");
    if (!toc) return;

    const allDetails = [...toc.querySelectorAll("details.toc-spec-details")];
    const regions = [];
    const regionMap = new Map();

    for (const link of toc.querySelectorAll('a[href^="#"]')) {
        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref.length < 2) continue;
        const targetId = rawHref.slice(1);
        const heading = document.getElementById(targetId);
        if (!heading) continue;

        const details = link.closest("details.toc-spec-details");
        const regionEl = heading.closest(CV_REGION_SELECTOR) || heading;
        let region = regionMap.get(regionEl);
        if (!region) {
            region = { el: regionEl, headings: [] };
            regionMap.set(regionEl, region);
            regions.push(region);
        }
        region.headings.push({ heading, link, details });
    }

    if (regions.length === 0) return;

    let activeEntry = null;
    let activeDetails = null;
    let rafId = 0;

    function findActiveEntry() {
        const activationOffset = Math.min(120, Math.max(48, window.innerHeight * 0.15));

        // If scrolled to the very bottom of the document, activate the final ToC entry.
        const docEl = document.documentElement;
        if (window.scrollY > 0 && window.innerHeight + window.scrollY >= docEl.scrollHeight - 2) {
            const lastRegion = regions[regions.length - 1];
            return lastRegion.headings[lastRegion.headings.length - 1];
        }

        // Stage 1: Binary search over outer region boxes only (never touches skipped subtrees).
        let lo = 0;
        let hi = regions.length - 1;
        let bestIdx = -1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const top = regions[mid].el.getBoundingClientRect().top;
            if (top <= activationOffset) {
                bestIdx = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }

        if (bestIdx === -1) return null;

        // Stage 2: Inspect headings only within the active visible region (or fall back
        // to the preceding region's last heading without laying out offscreen regions).
        for (let idx = bestIdx; idx >= 0; idx--) {
            const region = regions[idx];
            const rect = region.el.getBoundingClientRect();
            const hs = region.headings;
            if (rect.bottom <= 0) {
                return hs[hs.length - 1];
            }
            for (let j = hs.length - 1; j >= 0; j--) {
                if (hs[j].heading.getBoundingClientRect().top <= activationOffset) {
                    return hs[j];
                }
            }
        }

        return null;
    }

    function isScrollableSidebar() {
        return (
            toc.scrollHeight > toc.clientHeight &&
            getComputedStyle(toc).position === "fixed" &&
            !toc.matches(":hover")
        );
    }

    function scrollTocToLink(link, detailsChanged) {
        if (!isScrollableSidebar()) return;

        // Standard #toc links use display:contents, so measure .content when present.
        const targetEl = link.querySelector(".content") || link;
        const tocRect = toc.getBoundingClientRect();
        const elRect = targetEl.getBoundingClientRect();
        if (elRect.height === 0 && elRect.width === 0) return;

        const pad = Math.min(72, tocRect.height * 0.2);
        if (detailsChanged) {
            const desiredOffset = Math.min(120, tocRect.height * 0.25);
            const nextTop = toc.scrollTop + (elRect.top - tocRect.top) - desiredOffset;
            toc.scrollTop = Math.max(0, nextTop);
        } else if (elRect.top < tocRect.top + pad || elRect.bottom > tocRect.bottom - pad) {
            const centerDelta = (elRect.top + elRect.bottom) / 2 - (tocRect.top + tocRect.bottom) / 2;
            toc.scrollTop = Math.max(0, toc.scrollTop + centerDelta);
        }
    }

    function updateScrollspy() {
        const nextEntry = findActiveEntry();
        if (nextEntry === activeEntry) return;

        if (activeEntry) {
            activeEntry.link.classList.remove("toc-current");
            activeEntry.link.removeAttribute("aria-current");
        }

        const nextDetails = nextEntry ? nextEntry.details : null;
        const detailsChanged = nextDetails !== activeDetails;

        if (detailsChanged) {
            if (activeDetails) {
                activeDetails.classList.remove("toc-current-group");
            }
            for (const d of allDetails) {
                if (d !== nextDetails && d.open) {
                    d.open = false;
                }
            }
            if (nextDetails) {
                nextDetails.open = true;
                nextDetails.classList.add("toc-current-group");
            }
            activeDetails = nextDetails;
        }

        activeEntry = nextEntry;
        if (activeEntry) {
            activeEntry.link.classList.add("toc-current");
            activeEntry.link.setAttribute("aria-current", "location");
            scrollTocToLink(activeEntry.link, detailsChanged);
        } else if (detailsChanged && isScrollableSidebar()) {
            toc.scrollTop = 0;
        }
    }

    function scheduleUpdate() {
        if (rafId !== 0) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            updateScrollspy();
        });
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);
    scheduleUpdate();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTocScrollspy);
} else {
    initTocScrollspy();
}
}"""

LAZY_POSITION_ANNOS_SCRIPT = """\
/* Boilerplate: script-position-annos (lazy combined-spec override) */
"use strict";
{
const CV_CONTAINER_SELECTOR = ".spec-chapter, .sec-priv-spec, .index-chunk, #build-errors-section";

const panelsByContainer = new Map();
const loosePanels = [];
const activeContainers = new Set();

let rafId = 0;

function scheduleReposition() {
    if (rafId !== 0) return;
    rafId = requestAnimationFrame(() => {
        rafId = 0;
        repositionActivePanels();
    });
}

function repositionActivePanels() {
    const entries = [...loosePanels];
    for (const container of activeContainers) {
        const list = panelsByContainer.get(container);
        if (list) entries.push(...list);
    }
    if (entries.length === 0) return;

    const main = document.querySelector("main");
    const mainRight = main ? main.getBoundingClientRect().right : null;
    const scrollY = window.scrollY;

    // Reveal active panels before measuring so their rendered dimensions are valid.
    for (const entry of entries) {
        entry.panel.classList.remove("unpositioned");
    }

    // Batch all DOM reads before writes to avoid layout thrashing.
    const measured = [];
    for (const entry of entries) {
        const dfnRect = entry.dfn.getBoundingClientRect();
        const panelRect = entry.panel.getBoundingClientRect();
        // When an annotation panel is open, measure its summary height so adjacent
        // panels do not jump while the open popup overlays them at z-index: 9.
        const collapsedHeight =
            entry.panel.open && entry.panel.firstElementChild
                ? entry.panel.firstElementChild.getBoundingClientRect().height + 6
                : panelRect.height;
        measured.push({
            panel: entry.panel,
            top: scrollY + dfnRect.top,
            height: collapsedHeight,
            overlappingMain: mainRight !== null && panelRect.left < mainRight,
        });
    }

    measured.sort((a, b) => a.top - b.top);

    let vSoFar = 0;
    for (const item of measured) {
        let top = item.top;
        if (top < vSoFar) {
            top = vSoFar;
        }
        vSoFar = top + item.height + 15;
        item.panel.style.top = top + "px";
        item.panel.classList.toggle("overlapping-main", item.overlappingMain);
    }
}

function initLazyAnnoPositioning() {
    const panels = document.querySelectorAll("[data-anno-for]");
    if (panels.length === 0) return;

    for (const panel of panels) {
        const targetId = panel.getAttribute("data-anno-for");
        const dfn = targetId ? document.getElementById(targetId) : null;
        if (!dfn) {
            console.log("Can't find the annotation panel target:", panel);
            continue;
        }
        const entry = { panel, dfn };
        const container = dfn.closest(CV_CONTAINER_SELECTOR);
        if (container) {
            let list = panelsByContainer.get(container);
            if (!list) {
                list = [];
                panelsByContainer.set(container, list);
            }
            list.push(entry);
        } else {
            loosePanels.push(entry);
        }
    }

    if (typeof IntersectionObserver !== "undefined") {
        // Observe only outer content-visibility containers (never their descendants)
        // so skipped subtrees are never forced to lay out. Keep rootMargin inside
        // the browser's content-visibility:auto proximity zone.
        const io = new IntersectionObserver(
            (ioEntries) => {
                let changed = false;
                for (const ioEntry of ioEntries) {
                    const container = ioEntry.target;
                    if (ioEntry.isIntersecting) {
                        if (!activeContainers.has(container)) {
                            activeContainers.add(container);
                            changed = true;
                        }
                    } else if (activeContainers.delete(container)) {
                        const list = panelsByContainer.get(container);
                        if (list) {
                            for (const item of list) {
                                item.panel.classList.add("unpositioned");
                            }
                        }
                        changed = true;
                    }
                }
                if (changed) {
                    scheduleReposition();
                }
            },
            { rootMargin: "10% 0px" },
        );
        for (const container of panelsByContainer.keys()) {
            io.observe(container);
        }
    } else {
        for (const container of panelsByContainer.keys()) {
            activeContainers.add(container);
        }
        scheduleReposition();
    }

    if (loosePanels.length > 0) {
        scheduleReposition();
    }

    // Reposition active panels when any chapter unskips/re-skips (shifting y-offsets)
    // or when <main> / #toc changes height (e.g., toggling <details> or font/image load).
    document.addEventListener(
        "contentvisibilityautostatechange",
        () => {
            if (activeContainers.size > 0 || loosePanels.length > 0) {
                scheduleReposition();
            }
        },
        true,
    );

    if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => {
            if (activeContainers.size > 0 || loosePanels.length > 0) {
                scheduleReposition();
            }
        });
        const main = document.querySelector("main");
        if (main) ro.observe(main);
        const toc = document.getElementById("toc");
        if (toc) ro.observe(toc);
    }

    window.addEventListener("resize", scheduleReposition);
    window.addEventListener("load", scheduleReposition);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLazyAnnoPositioning);
} else {
    initLazyAnnoPositioning();
}
}"""


def _render_unconfigured_banner(unconfigured_dirs: list[SpecId]) -> str:
    """Render a dismissable warning banner listing unconfigured spec directories."""
    if not unconfigured_dirs:
        return ""
    items_html = "\n".join(f"  <li><code>{html.escape(d)}</code></li>" for d in unconfigured_dirs)
    return "\n".join(
        [
            '<div class="unconfigured-specs-banner" id="unconfigured-specs-warning" role="alert">',
            (
                ' <button type="button" class="dismiss-btn" '
                + 'onclick="this.parentElement.remove()" aria-label="Dismiss warning">Dismiss ✕</button>'
            ),
            " <h2>Action Required: Unconfigured Specification Directories</h2>",
            (
                " <p>The following specification directories were found in <code>csswg-drafts</code> "
                + "but are missing from <code>bin/css-combiner/config.toml</code> and were skipped:</p>"
            ),
            " <ul>",
            items_html,
            " </ul>",
            (
                " <p>Please update <code>bin/css-combiner/config.toml</code> by adding each directory "
                + "either to <code>[specs.&lt;folder&gt;]</code> (with optional <code>diff_of</code> "
                + "metadata, and moving any replaced earlier level to <code>[skip]</code>) or to "
                + "<code>[skip]</code> with a reason.</p>"
            ),
            "</div>",
        ],
    )


def _render_spec_metadata_dl(spec: ExtractedSpec, title_by_id: dict[SpecId, str]) -> str:
    """Render the metadata <dl> placed immediately under a spec's top-level <h2>."""
    m = spec.meta
    esc_ed = html.escape(m.ed_url, quote=True)
    status_label = html.escape(m.status)
    if m.work_status:
        status_label += f" ({html.escape(m.work_status)})"

    rows: list[str] = [
        f"  <dt>Shortname</dt><dd><code>{html.escape(m.spec_id)}</code></dd>",
        f'  <dt>Editor\'s Draft</dt><dd><a href="{esc_ed}">{html.escape(m.ed_url)}</a></dd>',
    ]
    if m.tr_url:
        esc_tr = html.escape(m.tr_url, quote=True)
        rows.append(
            f'  <dt>Published TR</dt><dd><a href="{esc_tr}">{html.escape(m.tr_url)}</a></dd>',
        )
    rows.append(f"  <dt>W3C Status</dt><dd>{status_label}</dd>")
    rows.append(
        f'  <dt>Last Edited</dt><dd><time datetime="{html.escape(m.last_edited)}">'
        + f"{html.escape(m.last_edited)}</time></dd>",
    )
    if m.diff_of:
        esc_diff = html.escape(m.diff_of, quote=True)
        base_title = title_by_id.get(m.diff_of, m.diff_of)
        rows.append(
            f'  <dt>Diff Specification Over</dt><dd><a href="#{esc_diff}">'
            + f"{html.escape(base_title)} (<code>{html.escape(m.diff_of)}</code>)</a></dd>",
        )

    return '<dl class="spec-metadata">\n' + "\n".join(rows) + "\n </dl>"


def _render_intro_section(spec_count: int) -> str:
    """Render the concise Introduction section explaining how to use the combined document."""
    return "\n".join(
        [
            '<section id="combiner-intro-section">',
            (
                ' <h2 class="heading no-num no-ref settled" id="combiner-intro">'
                + '<span class="content">Introduction</span>'
                + '<a class="self-link" href="#combiner-intro"></a></h2>'
            ),
            (
                " <p>This document combines the meaningful normative and informative content of "
                + f"<strong>{spec_count}</strong> active CSS Working Group specifications into a single "
                + "reference page for full-text search (<code>Ctrl+F</code> / <code>Cmd+F</code>) and "
                + "automated agent ingestion. Snapshot profiles, Working Group Notes, redirect stubs, "
                + "abandoned drafts, and superseded module levels are omitted; delta/diff specifications "
                + "are included immediately after the base specification they extend.</p>"
            ),
            " <ul>",
            (
                "  <li><strong>Ordering:</strong> Foundational modules (Syntax, Values, Cascade, "
                + "Selectors, Box Model, Display, Layout) appear first, followed by typography, visual "
                + "effects, animations, scrolling/UI, fragmentation, CSSOM APIs, and the CSS Level 2 "
                + "baseline (<code>css2</code>).</li>"
            ),
            (
                "  <li><strong>Navigation &amp; Source Links:</strong> Every element ID is prefixed "
                + "with its specification's versioned shortname (for example, "
                + "<code>#css-cascade-5:cascading</code>). Original section numbers from each source "
                + "specification are preserved, and the <code>↗</code> badge at the start of each "
                + "heading jumps directly to that section in the standalone Editor's Draft.</li>"
            ),
            (
                "  <li><strong>Agent-Friendly Markdown:</strong> A token-efficient Markdown edition "
                + "of this document (omitting interactive popup panels and redundant lookup tables) is "
                + 'available at <a href="./index.md"><code>index.md</code></a>.</li>'
            ),
            " </ul>",
            "</section>",
        ],
    )


class SecurityPrivacyRendered(NamedTuple):
    """Rendered HTML and collapsible ToC group for the combined Security & Privacy section."""

    html: str
    toc_group: TocCollapsibleGroup | None


def _render_security_privacy_section(
    extracted_specs: list[ExtractedSpec],
) -> SecurityPrivacyRendered:
    """Render the combined Security and Privacy Considerations section and its ToC group."""
    spec_blocks: list[str] = []
    spec_toc_children: list[TocItem] = []

    for spec in extracted_specs:
        if not spec.security_privacy_elements:
            continue
        sid = spec.meta.spec_id
        sub_id = f"security-privacy:{sid}"
        esc_sub_id = html.escape(sub_id, quote=True)
        esc_title = html.escape(spec.meta.title)
        esc_sid = html.escape(sid)
        spec_toc_children.append(
            TocItem(
                level=3,
                heading_id=sub_id,
                secno="",
                title_html=f"{esc_title} (<code>{esc_sid}</code>)",
            ),
        )

        serialized_children = "\n".join(
            lxml.html.tostring(el, encoding="unicode") for el in spec.security_privacy_elements
        )
        spec_blocks.append(
            "\n".join(
                [
                    f' <section class="sec-priv-spec" id="sec-priv-wrap:{esc_sub_id}">',
                    (
                        f'  <h3 class="heading no-num no-ref settled" id="{esc_sub_id}">'
                        + f'<span class="content">{esc_title} '
                        + f"(<code>{esc_sid}</code>)</span>"
                        + f'<a class="self-link" href="#{esc_sub_id}"></a></h3>'
                    ),
                    serialized_children,
                    " </section>",
                ],
            ),
        )

    if not spec_blocks:
        return SecurityPrivacyRendered(html="", toc_group=None)

    section_html = "\n".join(
        [
            '<section id="security-and-privacy-section">',
            (
                ' <h2 class="heading no-num no-ref settled" id="security-and-privacy">'
                + '<span class="content">Security and Privacy Considerations</span>'
                + '<a class="self-link" href="#security-and-privacy"></a></h2>'
            ),
            "\n".join(spec_blocks),
            "</section>",
        ],
    )
    toc_group = TocCollapsibleGroup(
        heading_id="security-and-privacy",
        summary_html="Security and Privacy Considerations",
        top_link_html="Security and Privacy Considerations",
        children=spec_toc_children,
        unnumbered_children=True,
    )
    return SecurityPrivacyRendered(html=section_html, toc_group=toc_group)


def _render_diagnostics_appendix(
    extracted_specs: list[ExtractedSpec],
    style_issues: list[StyleRuleIssue],
) -> str:
    """Render Appendix of Bikeshed build diagnostics and unprefixed CSS style rules."""
    bs_by_spec: dict[SpecId, list[BikeshedDiagnostic]] = defaultdict(list)
    for spec in extracted_specs:
        if spec.meta.diagnostics:
            bs_by_spec[spec.meta.spec_id].extend(spec.meta.diagnostics)

    style_by_spec: dict[SpecId, list[StyleRuleIssue]] = defaultdict(list)
    for issue in style_issues:
        style_by_spec[issue.spec_id].append(issue)

    all_flagged = sorted(set(bs_by_spec.keys()) | set(style_by_spec.keys()))
    if not all_flagged:
        return "\n".join(
            [
                '<section id="build-errors-section">',
                (
                    ' <h2 class="heading no-num no-ref settled" id="build-errors">'
                    + '<span class="content">Appendix: Bikeshed &amp; Style Diagnostics</span>'
                    + '<a class="self-link" href="#build-errors"></a></h2>'
                ),
                " <p>No Bikeshed errors or unscoped style rules were reported.</p>",
                "</section>",
            ],
        )

    blocks: list[str] = []
    for sid in all_flagged:
        diags = bs_by_spec.get(sid, [])
        s_issues = style_by_spec.get(sid, [])
        counts_parts: list[str] = []
        if diags:
            counts_parts.append(f"{len(diags)} Bikeshed message(s)")
        if s_issues:
            counts_parts.append(f"{len(s_issues)} unscoped CSS selector(s)")
        summary_label = f"{html.escape(sid)} — {', '.join(counts_parts)}"

        li_rows: list[str] = []
        for diag in diags:
            loc = f"Line {diag.line_num}: " if diag.line_num else ""
            badge = diag.message_type.upper()
            li_rows.append(
                f"   <li><strong>[{html.escape(badge)}]</strong> " + f"{html.escape(loc)}{html.escape(diag.text)}</li>",
            )
        for s_issue in s_issues:
            li_rows.append(
                "   <li><strong>[UNSCOPED-STYLE]</strong> "
                + f"{html.escape(s_issue.source_name)}: selector "
                + f"<code>{html.escape(s_issue.selector)}</code> is not prefixed with an ID.</li>",
            )

        blocks.append(
            "\n".join(
                [
                    f' <details class="diagnostics-spec-block" id="diagnostics:{html.escape(sid, quote=True)}">',
                    f"  <summary>{summary_label}</summary>",
                    '  <ul class="diagnostics-list">',
                    "\n".join(li_rows),
                    "  </ul>",
                    " </details>",
                ],
            ),
        )

    total_bs = sum(len(v) for v in bs_by_spec.values())
    total_style = sum(len(v) for v in style_by_spec.values())
    wrapper_summary = (
        f"Show diagnostics for {len(all_flagged)} spec(s) "
        + f"({total_bs:,} Bikeshed message(s), {total_style:,} unscoped CSS selector(s))"
    )
    return "\n".join(
        [
            '<section id="build-errors-section">',
            (
                ' <h2 class="heading no-num no-ref settled" id="build-errors">'
                + '<span class="content">Appendix: Bikeshed &amp; Style Diagnostics</span>'
                + '<a class="self-link" href="#build-errors"></a></h2>'
            ),
            ' <details class="diagnostics-wrapper">',
            f"  <summary>{html.escape(wrapper_summary)}</summary>",
            "\n".join(blocks),
            " </details>",
            "</section>",
        ],
    )


def _make_lazy_dfn_panel_script(template: str) -> str:
    """Transform Bikeshed's script-dfn-panel to fetch ./dfn-panels.json and build panels on click."""
    marker = "function genDfnPanel("
    idx = template.find(marker)
    if idx == -1:
        msg = "Unexpected script-dfn-panel boilerplate structure: missing genDfnPanel"
        raise RuntimeError(msg)
    return LAZY_DFN_PANEL_PREFIX + template[idx:]


def _make_lazy_ref_hints_script(template: str) -> str:
    """Transform Bikeshed's script-ref-hints to fetch ./ref-hints.json lazily on first interaction."""
    data_decl = f"let refsData = {REF_HINTS_PLACEHOLDER};"
    if data_decl not in template:
        msg = "Unexpected script-ref-hints boilerplate structure: missing refsData placeholder"
        raise RuntimeError(msg)
    updated = template.replace(data_decl, LAZY_REF_HINTS_LOADER, 1)
    updated = updated.replace(
        "function hideAllRefHints() {\n",
        "function hideAllRefHints() {\n    latestHintRequest++;\n",
        1,
    )
    updated, count = REF_HINT_SHOW_RE.subn(LAZY_SHOW_REF_HINT, updated, count=1)
    if count != 1:
        msg = "Unexpected script-ref-hints boilerplate structure: missing showRefHint"
        raise RuntimeError(msg)
    return updated


def _make_lazy_microlighter_script(code: str) -> str:
    """Transform Bikeshed's script-microlighter to use StaticRange and highlight chapters lazily."""
    old_range = (
        "  const range = new Range();\n"
        + "  range.setStart(startNode, startOffset);\n"
        + "  range.setEnd(endNode, endOffset);"
    )
    new_range = (
        '  const range = typeof StaticRange !== "undefined"\n'
        + "    ? new StaticRange({ startContainer: startNode, startOffset, endContainer: endNode, endOffset })\n"
        + "    : (() => {\n"
        + "        const r = new Range();\n"
        + "        r.setStart(startNode, startOffset);\n"
        + "        r.setEnd(endNode, endOffset);\n"
        + "        return r;\n"
        + "      })();"
    )
    updated = code.replace(old_range, new_range, 1)

    old_sig = (
        "const highlightAll = async ({\n"
        + "  root = document,\n"
        + '  selector = "[data-language], pre.highlight, code.highlight, pre > code",\n'
        + "  languageAliases\n"
        + "} = {}) => {"
    )
    new_sig = (
        "const highlightAll = async ({\n"
        + "  root = document,\n"
        + '  selector = "[data-language], pre.highlight, code.highlight, pre > code",\n'
        + "  languageAliases,\n"
        + "  clearExisting = true\n"
        + "} = {}) => {"
    )
    if old_sig not in updated:
        msg = "Unexpected script-microlighter boilerplate structure: missing highlightAll signature"
        raise RuntimeError(msg)
    updated = updated.replace(old_sig, new_sig, 1)

    old_clear = (
        "  highlights.forEach((ranges, category) => {\n"
        + "    if (CSS.highlights.get(category) === ranges) CSS.highlights.delete(category);\n"
        + "    ranges.clear();\n"
        + "  });"
    )
    new_clear = (
        "  if (clearExisting) {\n"
        + "    highlights.forEach((ranges, category) => {\n"
        + "      if (CSS.highlights.get(category) === ranges) CSS.highlights.delete(category);\n"
        + "      ranges.clear();\n"
        + "    });\n"
        + "  }"
    )
    if old_clear not in updated:
        msg = "Unexpected script-microlighter boilerplate structure: missing highlights clear loop"
        raise RuntimeError(msg)
    updated = updated.replace(old_clear, new_clear, 1)

    old_boot = 'document.addEventListener("syntax-highlight", () => highlightAll());\nhighlightAll();'
    new_boot = (
        "const highlightedContainers = new WeakSet();\n"
        + "const initLazyHighlighting = () => {\n"
        + '  if (typeof CSS === "undefined" || !CSS.highlights) return;\n'
        + '  const containers = document.querySelectorAll(".spec-chapter, .sec-priv-spec");\n'
        + '  if (containers.length === 0 || typeof IntersectionObserver === "undefined") {\n'
        + "    highlightAll();\n"
        + "    return;\n"
        + "  }\n"
        + "  const io = new IntersectionObserver(\n"
        + "    (entries) => {\n"
        + "      for (const entry of entries) {\n"
        + "        if (!entry.isIntersecting) continue;\n"
        + "        const container = entry.target;\n"
        + "        io.unobserve(container);\n"
        + "        if (highlightedContainers.has(container)) continue;\n"
        + "        highlightedContainers.add(container);\n"
        + "        highlightAll({ root: container, clearExisting: false });\n"
        + "      }\n"
        + "    },\n"
        + '    { rootMargin: "20% 0px" },\n'
        + "  );\n"
        + "  for (const container of containers) {\n"
        + "    io.observe(container);\n"
        + "  }\n"
        + "};\n"
        + 'document.addEventListener("syntax-highlight", () => highlightAll());\n'
        + 'if (document.readyState === "loading") {\n'
        + '  document.addEventListener("DOMContentLoaded", initLazyHighlighting);\n'
        + "} else {\n"
        + "  initLazyHighlighting();\n"
        + "}"
    )
    if old_boot not in updated:
        msg = "Unexpected script-microlighter boilerplate structure: missing eager highlightAll boot"
        raise RuntimeError(msg)
    return updated.replace(old_boot, new_boot, 1)


def _assemble_scripts_html(extracted_specs: list[ExtractedSpec]) -> str:
    """Emit deduplicated lazy Bikeshed boilerplate scripts and retained spec-specific scripts."""
    boilerplate_scripts: BoilerplateMap = {}
    for spec in extracted_specs:
        for bp_name, bp_code in spec.boilerplate_scripts.items():
            if bp_name in OMITTED_BOILERPLATE_SCRIPTS:
                continue
            boilerplate_scripts.setdefault(bp_name, bp_code)

    ordered_bp_names: list[str] = [name for name in SCRIPT_ORDER_PRIORITY if name in boilerplate_scripts]
    for bp_name in sorted(boilerplate_scripts.keys()):
        if bp_name not in ordered_bp_names:
            ordered_bp_names.append(bp_name)

    script_tags: list[str] = [
        '<script src="https://www.w3.org/scripts/TR/2021/fixup.js"></script>',
    ]
    for bp_name in ordered_bp_names:
        code = boilerplate_scripts[bp_name]
        if bp_name == "script-dfn-panel":
            code = _make_lazy_dfn_panel_script(code)
        elif bp_name == "script-ref-hints":
            code = _make_lazy_ref_hints_script(code)
        elif bp_name == "script-position-annos":
            code = LAZY_POSITION_ANNOS_SCRIPT
        elif bp_name == "script-microlighter":
            code = _make_lazy_microlighter_script(code)
        script_tags.append(f"<script>\n{code}\n</script>")

    script_tags.append(f"<script>\n{LAZY_SWATCH_SCRIPT}\n</script>")
    script_tags.append(f"<script>\n{TOC_SCROLLSPY_SCRIPT}\n</script>")

    for spec in extracted_specs:
        for c_script in spec.custom_scripts:
            extra_attrs = "".join(
                f' {html.escape(k)}="{html.escape(v, quote=True)}"' for k, v in sorted(c_script.attrs.items())
            )
            if c_script.src:
                src_path = rewrite_relative_asset_path(c_script.src, c_script.spec_id)
                esc_src = html.escape(src_path, quote=True)
                script_tags.append(f'<script src="{esc_src}"{extra_attrs}></script>')
            elif c_script.inline_code:
                script_tags.append(
                    f"<script{extra_attrs}>\n/* Source: {c_script.spec_id} */\n" + f"{c_script.inline_code}\n</script>",
                )

    return "\n".join(script_tags)


def assemble_combined_html(
    extracted_specs: list[ExtractedSpec],
    unconfigured_dirs: list[SpecId],
    resolver: LinkResolver,
    merged_panels: MergedPanelsResult,
    style_issues: list[StyleRuleIssue],
) -> str:
    """Assemble and return the full `all-css/index.html` document string."""
    now = datetime.now(tz=UTC)
    iso_date = now.strftime("%Y-%m-%d")
    human_date = f"{now.day} {now.strftime('%B %Y')}"

    boilerplate_styles: BoilerplateMap = {}
    for spec in extracted_specs:
        for bp_name, css_text in spec.boilerplate_styles.items():
            if bp_name in OMITTED_BOILERPLATE_STYLES:
                continue
            boilerplate_styles.setdefault(bp_name, css_text)

    head_styles: list[str] = [
        f"<style>\n{boilerplate_styles[name]}\n</style>" for name in sorted(boilerplate_styles.keys())
    ]
    head_styles.append(f"<style>\n{COMBINER_EXTRA_CSS}</style>")

    for spec in extracted_specs:
        for link in spec.custom_stylesheets:
            rel_href = rewrite_relative_asset_path(link.href, link.spec_id)
            esc_href = html.escape(rel_href, quote=True)
            head_styles.append(f'<link rel="stylesheet" href="{esc_href}">')
        for block in spec.custom_styles:
            head_styles.append(f"<style>\n/* Spec: {block.spec_id} */\n{block.css_text}\n</style>")

    title_by_id: dict[SpecId, str] = {s.meta.spec_id: s.meta.title for s in extracted_specs}

    toc_entries: list[TocEntry] = [
        TocItem(level=2, heading_id="combiner-intro", secno="", title_html="Introduction"),
    ]
    spec_sections_html: list[str] = [_render_intro_section(len(extracted_specs))]

    for spec in extracted_specs:
        sid = spec.meta.spec_id
        esc_sid = html.escape(sid, quote=True)
        esc_title = html.escape(spec.meta.title)
        toc_entries.append(
            TocCollapsibleGroup(
                heading_id=sid,
                summary_html=f"{esc_title} (<code>{html.escape(sid)}</code>)",
                top_link_html=esc_title,
                children=collect_toc_items_from_elements(spec.main_elements),
            ),
        )

        meta_dl = _render_spec_metadata_dl(spec, title_by_id)
        body_html = "\n".join(lxml.html.tostring(el, encoding="unicode") for el in spec.main_elements)
        spec_sections_html.append(
            "\n".join(
                [
                    f'<section class="spec-section" id="spec-container:{esc_sid}">',
                    (
                        f' <h2 class="heading settled" id="{esc_sid}">'
                        + f'<span class="content">{esc_title}</span>'
                        + f'<a class="self-link" href="#{esc_sid}"></a></h2>'
                    ),
                    f" {meta_dl}",
                    body_html,
                    "</section>",
                ],
            ),
        )

    sec_priv = _render_security_privacy_section(extracted_specs)
    if sec_priv.toc_group is not None:
        toc_entries.append(sec_priv.toc_group)

    prop_index_html = build_property_index_html(extracted_specs)
    toc_entries.append(
        TocItem(level=2, heading_id="property-index", secno="", title_html="Property Index"),
    )

    combined_index_html = build_combined_index_html(
        extracted_specs=extracted_specs,
        resolver=resolver,
        rewritten_external_urls=merged_panels.rewritten_external_urls,
        merged_dfn_panels=merged_panels.dfn_panels,
    )
    toc_entries.append(TocItem(level=2, heading_id="index", secno="", title_html="Index"))
    toc_entries.append(
        TocItem(
            level=3,
            heading_id="index-defined-here",
            secno="",
            title_html="Terms defined by CSS specifications",
        ),
    )

    diagnostics_html = _render_diagnostics_appendix(extracted_specs, style_issues)
    toc_entries.append(
        TocItem(
            level=2,
            heading_id="build-errors",
            secno="",
            title_html="Appendix: Bikeshed &amp; Style Diagnostics",
        ),
    )

    toc_html = render_toc_nav_html(toc_entries)
    banner_html = _render_unconfigured_banner(unconfigured_dirs)

    mdn_html = "\n".join(
        lxml.html.tostring(anno, encoding="unicode") for spec in extracted_specs for anno in spec.mdn_annotations
    )
    scripts_html = _assemble_scripts_html(extracted_specs)

    return "\n".join(
        [
            "<!doctype html>",
            '<html lang="en">',
            "<head>",
            ' <meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
            ' <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">',
            " <title>Cascading Style Sheets — Combined Specification</title>",
            ' <meta name="w3c-status" content="ED">',
            ' <meta name="color-scheme" content="dark light">',
            ' <link rel="stylesheet" href="https://www.w3.org/StyleSheets/TR/2021/W3C-ED">',
            (
                ' <link rel="stylesheet" href="https://www.w3.org/StyleSheets/TR/2021/dark.css" '
                + 'media="(prefers-color-scheme: dark)" type="text/css">'
            ),
            ' <link rel="icon" href="https://drafts.csswg.org/csslogo.ico">',
            *head_styles,
            "</head>",
            '<body class="h-entry">',
            ' <div class="head">',
            (
                '  <p data-fill-with="logo"><a class="logo" href="https://www.w3.org/">'
                + '<img alt="W3C" height="48" src="https://www.w3.org/StyleSheets/TR/2021/logos/W3C" '
                + 'width="72"></a></p>'
            ),
            '  <h1 id="title" class="p-name no-ref">Cascading Style Sheets — Combined Specification</h1>',
            (
                '  <p id="w3c-state"><a href="https://www.w3.org/standards/types#ED">CSSWG Combined '
                + f'Editor\'s Draft</a>, <time class="dt-updated" datetime="{iso_date}">{human_date}</time></p>'
            ),
            '  <div data-fill-with="spec-metadata">',
            "   <dl>",
            "    <dt>This version:</dt>",
            (
                '    <dd><a class="u-url" href="https://drafts.csswg.org/all-css/">'
                + "https://drafts.csswg.org/all-css/</a></dd>"
            ),
            "    <dt>Markdown version (for agents):</dt>",
            '    <dd><a href="./index.md">index.md</a></dd>',
            "    <dt>Repository &amp; Issues:</dt>",
            '    <dd><a href="https://github.com/w3c/csswg-drafts">w3c/csswg-drafts on GitHub</a></dd>',
            "    <dt>Combined Specifications:</dt>",
            f"    <dd>{len(extracted_specs)} modules</dd>",
            "   </dl>",
            "  </div>",
            (
                '  <p class="copyright" data-fill-with="copyright">'
                + '<a href="https://www.w3.org/policies/#copyright">Copyright</a> © '
                + f'{now.year} <a href="https://www.w3.org/">World Wide Web Consortium</a>. '
                + "W3C<sup>®</sup> liability, trademark and permissive document license rules apply.</p>"
            ),
            '  <hr title="Separator for header">',
            " </div>",
            banner_html,
            ' <div class="p-summary" data-fill-with="abstract">',
            (
                '  <h2 class="heading no-num no-toc no-ref settled" id="abstract">'
                + '<span class="content">Abstract</span></h2>'
            ),
            (
                "  <p>This document is an automatically generated mega-specification combining all active "
                + "CSS Working Group specifications into a single searchable HTML and Markdown reference.</p>"
            ),
            " </div>",
            toc_html,
            " <main>",
            "\n".join(spec_sections_html),
            " </main>",
            sec_priv.html,
            prop_index_html,
            combined_index_html,
            diagnostics_html,
            mdn_html,
            scripts_html,
            "</body>",
            "</html>\n",
        ],
    )
