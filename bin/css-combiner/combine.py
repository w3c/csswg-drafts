#!/usr/bin/env python3
"""CLI entrypoint for building the combined CSS mega-specification."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from css_combiner.pipeline import run_combiner


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line options for the CSS Combiner CLI."""
    parser = argparse.ArgumentParser(
        description="Combine CSSWG specifications into all-css/index.html, properties.html, and index.md.",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="Path to config.toml (defaults to bin/css-combiner/config.toml).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Output directory (defaults to <repo-root>/all-css).",
    )
    parser.add_argument(
        "--specs",
        nargs="*",
        default=None,
        help="Optional subset of spec directory names to combine (for testing).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Run the CSS Combiner from command-line arguments."""
    args = parse_args(argv)
    combiner_dir = Path(__file__).resolve().parent
    repo_root = combiner_dir.parent.parent
    only_specs = set(args.specs) if args.specs else None
    return run_combiner(
        combiner_dir=combiner_dir,
        repo_root=repo_root,
        config_path=args.config,
        output_dir=args.output_dir,
        only_specs=only_specs,
    )


if __name__ == "__main__":
    sys.exit(main())
