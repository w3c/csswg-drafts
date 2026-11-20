"""Parallel Bikeshed builder and HTML loader for discovered CSS specifications."""

from __future__ import annotations

import io
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor
from datetime import UTC, datetime
from pathlib import Path
from typing import NamedTuple

import bikeshed  # type: ignore[import-not-found]
import lxml.html
from bikeshed import metadata

from .models import BikeshedDiagnostic, BuiltSpec, DiscoveredSpec, xpath_elements

DIAGNOSTIC_TYPES: frozenset[str] = frozenset({"fatal", "link", "lint", "warning"})


def get_last_edited_date(source_path: Path, repo_root: Path) -> str:
    """Return the UTC YYYY-MM-DD date of the most recent git commit touching source_path."""
    resolved = source_path.resolve()
    proc = subprocess.run(  # noqa: S603
        ["git", "log", "-1", "--format=%at", str(resolved)],
        cwd=repo_root,
        capture_output=True,
        encoding="utf-8",
        check=False,
    )
    lines = proc.stdout.strip().splitlines()
    if proc.returncode == 0 and lines and lines[-1].isdigit():
        ts = int(lines[-1])
    else:
        ts = int(resolved.stat().st_mtime)
    return datetime.fromtimestamp(ts, tz=UTC).strftime("%Y-%m-%d")


def _parse_bikeshed_diagnostics(spec_id: str, raw_output: str) -> list[BikeshedDiagnostic]:
    """Parse newline-delimited JSON messages emitted by Bikeshed's json printMode."""
    diagnostics: list[BikeshedDiagnostic] = []
    for raw_line in raw_output.splitlines():
        cleaned = raw_line.strip().rstrip(",").strip()
        if not cleaned.startswith("{"):
            continue
        try:
            payload = json.loads(cleaned)
        except json.JSONDecodeError:
            continue
        if not isinstance(payload, dict):
            continue
        msg_type = str(payload.get("messageType", ""))
        if msg_type not in DIAGNOSTIC_TYPES:
            continue
        line_num_raw = payload.get("lineNum")
        line_num = str(line_num_raw) if line_num_raw is not None else None
        text = str(payload.get("text", ""))
        diagnostics.append(
            BikeshedDiagnostic(
                spec_id=spec_id,
                line_num=line_num,
                message_type=msg_type,
                text=text,
            ),
        )
    return diagnostics


def _build_bikeshed_spec(item: DiscoveredSpec, last_edited: str) -> BuiltSpec:
    """Build a single Bikeshed .bs specification in-memory and capture diagnostics."""
    msg_buffer = io.StringIO()
    with bikeshed.messages.withMessageState(
        msg_buffer,
        dieOn="nothing",
        dieWhen="never",
        printMode="json",
    ):
        spec = bikeshed.Spec(inputFilename=str(item.source_path))
        spec.mdCommandLine = metadata.MetadataManager()
        spec.mdCommandLine.addData("Die On", "nothing")
        spec.mdCommandLine.addData("Date", last_edited)
        spec.mdCommandLine.addData("Text Macro", "BUILTBYGITHUBCI foo")
        # Disable live GitHub issue fetching to avoid unauthenticated API rate-limiting
        # in CI/offline environments and concurrent worker writes to github-issues.json.
        spec.mdCommandLine.addData("Inline Github Issues", "no")
        spec.preprocess()
        serialized = spec.serialize()
        html = serialized if serialized is not None else ""

    diagnostics = _parse_bikeshed_diagnostics(item.spec_id, msg_buffer.getvalue())
    title = str(spec.md.title) if spec.md.title else item.spec_id
    status = str(spec.md.rawStatus or spec.md.status or "ED")
    work_status = str(spec.md.workStatus) if spec.md.workStatus else None
    ed_raw = str(spec.md.ED).strip() if spec.md.ED else ""
    ed_url = ed_raw if ed_raw.startswith(("http://", "https://")) else f"https://drafts.csswg.org/{item.spec_id}/"
    tr_raw = str(spec.md.TR).strip() if spec.md.TR else ""
    tr_url = tr_raw if tr_raw.startswith(("http://", "https://")) else None

    return BuiltSpec(
        spec_id=item.spec_id,
        is_bikeshed=True,
        html=html,
        title=title,
        status=status,
        work_status=work_status,
        ed_url=ed_url,
        tr_url=tr_url,
        last_edited=last_edited,
        diff_of=item.diff_of,
        order_index=item.order_index,
        diagnostics=diagnostics,
    )


def _load_html_spec(item: DiscoveredSpec, last_edited: str) -> BuiltSpec:
    """Load a pre-Bikeshed Overview.html specification and extract header metadata."""
    html = item.source_path.read_text(encoding="utf-8")
    doc = lxml.html.fromstring(html)

    title_els = xpath_elements(doc, "//title")
    title = " ".join(title_els[0].text_content().split()) if title_els else item.spec_id

    status = "ED"
    head_h2s = xpath_elements(doc, "//div[contains(@class, 'head')]//h2")
    if head_h2s:
        h2_text = " ".join(head_h2s[0].text_content().split())
        if "Recommendation" in h2_text and "Candidate" not in h2_text:
            status = "REC"
        elif "Candidate Recommendation" in h2_text:
            status = "CR"
        elif "Working Draft" in h2_text:
            status = "WD"

    tr_url: str | None = None
    for dt in xpath_elements(doc, "//div[contains(@class, 'head')]//dt"):
        dt_label = " ".join(dt.text_content().split()).lower()
        if "latest" in dt_label:
            dd = dt.getnext()
            if dd is not None and isinstance(dd, lxml.html.HtmlElement) and dd.tag == "dd":
                links = xpath_elements(dd, ".//a[@href]")
                if links:
                    candidate = str(links[0].get("href", "")).strip()
                    if candidate.startswith("//"):
                        candidate = "https:" + candidate
                    if re.match(r"^https?://", candidate):
                        tr_url = candidate
                        break

    return BuiltSpec(
        spec_id=item.spec_id,
        is_bikeshed=False,
        html=html,
        title=title,
        status=status,
        work_status="completed",
        ed_url=f"https://drafts.csswg.org/{item.spec_id}/",
        tr_url=tr_url,
        last_edited=last_edited,
        diff_of=item.diff_of,
        order_index=item.order_index,
        diagnostics=[],
    )


class BuildTask(NamedTuple):
    """Input payload for a parallel spec build worker."""

    item: DiscoveredSpec
    repo_root: Path


def _build_worker(task: BuildTask) -> BuiltSpec:
    """Worker entrypoint for building or loading a single specification."""
    last_edited = get_last_edited_date(task.item.source_path, task.repo_root)
    if task.item.is_bikeshed:
        return _build_bikeshed_spec(task.item, last_edited)
    return _load_html_spec(task.item, last_edited)


def build_all_specs(specs: list[DiscoveredSpec], repo_root: Path) -> list[BuiltSpec]:
    """Build all configured specs in parallel while preserving configured order."""
    max_workers = min(os.cpu_count() or 4, 8)
    sys.stderr.write(f"Building {len(specs)} specifications using {max_workers} worker processes...\n")
    tasks = [BuildTask(spec, repo_root) for spec in specs]
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(_build_worker, tasks))
    results.sort(key=lambda r: r.order_index)
    return results
