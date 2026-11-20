"""End-to-end orchestration pipeline for combining CSSWG specifications."""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

from .assembler import assemble_combined_html, assemble_properties_html
from .builder import build_all_specs
from .config import discover_specs, load_config, load_shared_specs_config
from .extractor import extract_spec
from .markdown_writer import serialize_html_to_markdown
from .rewriter import LinkResolver, rewrite_and_merge_all


def run_combiner(
    combiner_dir: Path,
    repo_root: Path,
    config_path: Path | None = None,
    output_dir: Path | None = None,
    only_specs: set[str] | None = None,
) -> int:
    """Execute the full CSS combiner pipeline and write `index.html` and `index.md`."""
    t_start = time.monotonic()
    resolved_config_path = config_path or (combiner_dir / "config.toml")
    resolved_output_dir = output_dir or (repo_root / "all-css")
    shared_config_path = combiner_dir.parent / "specs-config.toml"

    loaded_cfg = load_config(resolved_config_path)
    discovery = discover_specs(
        repo_root=repo_root,
        config=loaded_cfg,
        config_path=resolved_config_path,
    )

    specs_to_build = discovery.specs
    if only_specs is not None:
        specs_to_build = [s for s in specs_to_build if s.spec_id in only_specs]

    if not specs_to_build:
        msg = "No specifications selected to combine."
        raise RuntimeError(msg)

    shared_mappings = load_shared_specs_config(shared_config_path)
    built_specs = build_all_specs(specs_to_build, repo_root)

    sys.stderr.write(f"Extracting meaningful content from {len(built_specs)} specifications...\n")
    extracted_specs = [extract_spec(b, repo_root) for b in built_specs]

    sys.stderr.write("Disambiguating IDs, rewriting links, and merging panel data...\n")
    resolver = LinkResolver(
        extracted_specs=extracted_specs,
        current_work_exceptions=shared_mappings.current_work_exceptions,
        legacy_redirects=shared_mappings.legacy_redirects,
        replaced_specs=loaded_cfg.replaced,
    )
    rewrite_outcome = rewrite_and_merge_all(
        extracted_specs=extracted_specs,
        resolver=resolver,
    )

    sys.stderr.write("Assembling combined HTML specification...\n")
    combined_html = assemble_combined_html(
        extracted_specs=extracted_specs,
        unconfigured_dirs=discovery.unconfigured_dirs,
        resolver=resolver,
        merged_panels=rewrite_outcome.panels,
        style_issues=rewrite_outcome.style_issues,
    )

    resolved_output_dir.mkdir(parents=True, exist_ok=True)
    html_out_path = resolved_output_dir / "index.html"
    html_out_path.write_text(combined_html, encoding="utf-8")

    sys.stderr.write("Assembling standalone Property Index document...\n")
    properties_html = assemble_properties_html(extracted_specs=extracted_specs)
    properties_out_path = resolved_output_dir / "properties.html"
    properties_out_path.write_text(properties_html, encoding="utf-8")

    # Emit interactive panel datasets as lazy-fetched sidecar JSON files so the
    # browser does not parse ~10 MB of inline JS on initial page load.
    dfn_panels_json = json.dumps(rewrite_outcome.panels.dfn_panels, ensure_ascii=False, separators=(",", ":"))
    dfn_out_path = resolved_output_dir / "dfn-panels.json"
    dfn_out_path.write_text(dfn_panels_json, encoding="utf-8")

    ref_hints_json = json.dumps(rewrite_outcome.panels.ref_hints, ensure_ascii=False, separators=(",", ":"))
    ref_out_path = resolved_output_dir / "ref-hints.json"
    ref_out_path.write_text(ref_hints_json, encoding="utf-8")

    sys.stderr.write("Serializing combined Markdown specification...\n")
    combined_md = serialize_html_to_markdown(combined_html)
    md_out_path = resolved_output_dir / "index.md"
    md_out_path.write_text(combined_md, encoding="utf-8")

    elapsed = time.monotonic() - t_start
    sys.stderr.write(
        f"Done in {elapsed:.1f}s! Wrote {html_out_path} ({len(combined_html):,} chars), "
        + f"{properties_out_path.name} ({len(properties_html):,} chars), "
        + f"{md_out_path} ({len(combined_md):,} chars), "
        + f"{dfn_out_path.name} ({len(dfn_panels_json):,} chars), "
        + f"and {ref_out_path.name} ({len(ref_hints_json):,} chars).\n",
    )
    return 0
