#!/usr/bin/env python3
"""Convert markdown files in spec directories to HTML.

Uses cmark-gfm for full GitHub Flavored Markdown rendering, then
post-processes the output to convert GFM alert syntax (> [!NOTE], etc.)
into styled admonition blocks.
"""

import glob
import os
import re
import subprocess

ADMONITION_TYPES = {"NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"}

TEMPLATE = """\
<!doctype html>
<meta charset="utf-8">
<title>{title}</title>
<style>
body {{ max-width: 50em; margin: 2em auto; padding: 0 1em; font-family: sans-serif; line-height: 1.6; }}
code {{ background: #f4f4f4; padding: .1em .3em; border-radius: 3px; }}
pre {{ background: #f4f4f4; padding: 1em; overflow: auto; border-radius: 3px; }}
pre code {{ background: none; padding: 0; }}
img {{ max-width: 100%; }}
.admonition {{ border-left: 4px solid #888; padding: 0.5em 1em; margin: 1em 0; background: #f8f9fa; border-radius: 3px; }}
.admonition-title {{ font-weight: bold; margin: 0 0 0.25em; }}
.admonition.note, .admonition.tip {{ border-color: #0969da; }}
.admonition.important {{ border-color: #8250df; }}
.admonition.warning, .admonition.caution {{ border-color: #d1242f; }}
</style>
{body}
"""

# cmark-gfm renders > [!NOTE]\n> text as:
#   <blockquote>\n<p>[!NOTE]\ntext</p>\n</blockquote>
# We convert these to styled admonition divs.
ADMONITION_RE = re.compile(
    r"<blockquote>\n<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n"
    r"(.*?)</p>\n</blockquote>",
    re.DOTALL,
)


def convert_admonitions(html):
    def replace(m):
        kind = m.group(1).lower()
        body = m.group(2)
        title = m.group(1).capitalize()
        return (
            f'<div class="admonition {kind}">\n'
            f'<p class="admonition-title">{title}</p>\n'
            f"<p>{body}</p>\n"
            f"</div>"
        )
    return ADMONITION_RE.sub(replace, html)


def extract_title(text):
    m = re.search(r"^#\s+(.+)", text, re.MULTILINE)
    return m.group(1).strip() if m else "Untitled"


def render_markdown(text):
    proc = subprocess.run(
        ["cmark-gfm", "--extension", "table", "--extension", "autolink",
         "--extension", "strikethrough", "--extension", "tasklist"],
        input=text, capture_output=True, encoding="utf-8",
    )
    if proc.returncode != 0:
        raise RuntimeError(f"cmark-gfm failed: {proc.stderr}")
    return convert_admonitions(proc.stdout)


def main():
    for md_file in sorted(glob.glob("*/*.md")):
        if md_file.startswith("."):
            continue

        html_file = os.path.splitext(md_file)[0] + ".html"
        if os.path.exists(html_file):
            continue

        with open(md_file, encoding="utf-8") as f:
            text = f.read()

        title = extract_title(text)
        body = render_markdown(text)

        with open(html_file, "w", encoding="utf-8") as f:
            f.write(TEMPLATE.format(title=title, body=body))

        print(f"  {html_file}")


if __name__ == "__main__":
    main()
