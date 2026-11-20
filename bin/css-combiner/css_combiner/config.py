"""Configuration loading, repository spec discovery, and shared routing metadata."""

from __future__ import annotations

import re
import sys
import tomllib
from pathlib import Path
from typing import NamedTuple

from .models import (
    CurrentWorkMap,
    DiscoveredSpec,
    DiscoveryResult,
    LegacyRedirectMap,
    ReplacedSpecMap,
    SkipMap,
    SpecConfig,
    SpecConfigMap,
    SpecId,
)

SNAPSHOT_RE = re.compile(r"^css-\d{4}$")


class SourceCandidate(NamedTuple):
    """A candidate spec source filename and whether it requires Bikeshed."""

    filename: str
    is_bikeshed: bool


class FoundSpecSource(NamedTuple):
    """Located source file path and format flag for a spec directory."""

    path: Path
    is_bikeshed: bool


SOURCE_CANDIDATES: tuple[SourceCandidate, ...] = (
    SourceCandidate("Overview.bs", True),
    SourceCandidate("index.bs", True),
    SourceCandidate("Overview.html", False),
)


class LoadedConfig(NamedTuple):
    """Parsed contents of config.toml."""

    specs: SpecConfigMap
    skip: SkipMap
    replaced: ReplacedSpecMap


class SharedSpecsConfig(NamedTuple):
    """Shared current-work and legacy redirect mappings from bin/specs-config.toml."""

    current_work_exceptions: CurrentWorkMap
    legacy_redirects: LegacyRedirectMap


def load_config(config_path: Path) -> LoadedConfig:
    """Load and validate the TOML configuration file."""
    raw = tomllib.loads(config_path.read_text(encoding="utf-8"))
    raw_specs = raw.get("specs")
    raw_skip = raw.get("skip", {})
    if not isinstance(raw_specs, dict) or not isinstance(raw_skip, dict):
        msg = f"Invalid config schema in {config_path}: expected [specs] and [skip] tables."
        raise TypeError(msg)

    specs: SpecConfigMap = {}
    for index, (spec_id, meta) in enumerate(raw_specs.items()):
        if not isinstance(meta, dict):
            msg = f"Config entry [specs.{spec_id}] must be a table."
            raise TypeError(msg)
        diff_of = meta.get("diff_of")
        if diff_of is not None and not isinstance(diff_of, str):
            msg = f"Config entry [specs.{spec_id}].diff_of must be a string."
            raise TypeError(msg)
        specs[spec_id] = SpecConfig(
            spec_id=spec_id,
            diff_of=diff_of,
            order_index=index,
        )

    skip: SkipMap = {}
    for spec_id, reason in raw_skip.items():
        if not isinstance(reason, str):
            msg = f"Config entry [skip].{spec_id} must be a reason string."
            raise TypeError(msg)
        skip[spec_id] = reason

    overlap = sorted(set(specs) & set(skip))
    if overlap:
        msg = f"Specs listed in both [specs] and [skip] in {config_path}: {', '.join(overlap)}"
        raise ValueError(msg)

    for spec_cfg in specs.values():
        if spec_cfg.diff_of is not None and spec_cfg.diff_of not in specs:
            msg = f"[specs.{spec_cfg.spec_id}] sets diff_of = '{spec_cfg.diff_of}', " + "which is not in [specs]."
            raise ValueError(msg)

    raw_replaced = raw.get("replaced", {})
    if not isinstance(raw_replaced, dict):
        msg = f"Invalid [replaced] table in {config_path}."
        raise TypeError(msg)
    replaced: ReplacedSpecMap = {}
    for old_spec, targets in raw_replaced.items():
        if not isinstance(targets, list) or not all(isinstance(t, str) for t in targets):
            msg = f"Config entry [replaced].{old_spec} must be a list of spec IDs."
            raise TypeError(msg)
        for target_id in targets:
            if target_id not in specs:
                msg = f"[replaced].{old_spec} references '{target_id}', which is not in [specs]."
                raise ValueError(msg)
        replaced[old_spec.lower()] = [t.lower() for t in targets]

    return LoadedConfig(specs=specs, skip=skip, replaced=replaced)


def discover_specs(repo_root: Path, config: LoadedConfig, config_path: Path) -> DiscoveryResult:
    """Scan top-level repo directories for specs and match against config.toml."""
    found_by_id: dict[SpecId, FoundSpecSource] = {}

    for entry in sorted(repo_root.iterdir(), key=lambda p: p.name):
        if entry.name.startswith(".") or entry.is_symlink() or not entry.is_dir():
            continue
        if SNAPSHOT_RE.match(entry.name):
            continue

        for src_cand in SOURCE_CANDIDATES:
            candidate = entry / src_cand.filename
            if candidate.is_file():
                found_by_id[entry.name] = FoundSpecSource(candidate, src_cand.is_bikeshed)
                break

    unconfigured: list[SpecId] = []
    for spec_id in sorted(found_by_id):
        if spec_id not in config.specs and spec_id not in config.skip:
            unconfigured.append(spec_id)

    if unconfigured:
        lines = [
            f"ERROR: Found {len(unconfigured)} unconfigured spec folder(s): {', '.join(unconfigured)}",
            f"Please update {config_path} by adding each folder to EITHER:",
            '  - [specs.<folder>] (placed in foundational order, with optional `diff_of = "<earlier-spec>"`',
            "    if it is a delta/diff spec, moving any replaced earlier level to [skip]), OR",
            '  - [skip] as `<folder> = "<reason>"` if abandoned, retired, a WG Note, or a redirect stub.',
            "Skipping unconfigured folder(s) for now.",
        ]
        sys.stderr.write("\n".join(lines) + "\n")

    ordered_specs: list[DiscoveredSpec] = []
    for spec_id, spec_cfg in config.specs.items():
        if spec_id not in found_by_id:
            sys.stderr.write(
                f"WARNING: Configured spec '{spec_id}' in {config_path} was not found in {repo_root}.\n",
            )
            continue
        found_src = found_by_id[spec_id]
        ordered_specs.append(
            DiscoveredSpec(
                spec_id=spec_id,
                source_path=found_src.path,
                is_bikeshed=found_src.is_bikeshed,
                diff_of=spec_cfg.diff_of,
                order_index=spec_cfg.order_index,
            ),
        )

    ordered_specs.sort(key=lambda s: s.order_index)
    return DiscoveryResult(specs=ordered_specs, unconfigured_dirs=unconfigured)


def load_shared_specs_config(shared_config_path: Path) -> SharedSpecsConfig:
    """Load CURRENT_WORK_EXCEPTIONS and LEGACY_REDIRECTS from bin/specs-config.toml."""
    raw = tomllib.loads(shared_config_path.read_text(encoding="utf-8"))
    raw_current = raw.get("current_work_exceptions", {})
    raw_redirects = raw.get("legacy_redirects", {})
    if not isinstance(raw_current, dict) or not isinstance(raw_redirects, dict):
        msg = f"Invalid schema in {shared_config_path}: expected [current_work_exceptions] and [legacy_redirects]."
        raise TypeError(msg)

    current_work: CurrentWorkMap = {}
    for key, val in raw_current.items():
        if val == "last":
            current_work[key] = None
        elif isinstance(val, int) and not isinstance(val, bool):
            current_work[key] = val
        else:
            msg = f"Invalid value for [current_work_exceptions].{key} in {shared_config_path}: {val!r}"
            raise TypeError(msg)

    legacy_redirects: LegacyRedirectMap = {}
    for old_name, new_name in raw_redirects.items():
        if not isinstance(new_name, str):
            msg = f"Invalid value for [legacy_redirects].{old_name} in {shared_config_path}: expected string."
            raise TypeError(msg)
        legacy_redirects[old_name] = new_name

    return SharedSpecsConfig(
        current_work_exceptions=current_work,
        legacy_redirects=legacy_redirects,
    )
