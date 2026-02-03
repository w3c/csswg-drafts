#!/usr/bin/env python3
"""Convert markdown files in spec directories to HTML."""

import glob
import os
import re

import markdown

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
</style>
{body}
"""


def extract_title(text):
    m = re.search(r"^#\s+(.+)", text, re.MULTILINE)
    return m.group(1).strip() if m else "Untitled"


def main():
    md = markdown.Markdown(extensions=["fenced_code", "tables"])

    for md_file in sorted(glob.glob("*/*.md")):
        if md_file.startswith("."):
            continue

        html_file = os.path.splitext(md_file)[0] + ".html"
        if os.path.exists(html_file):
            continue

        with open(md_file, encoding="utf-8") as f:
            text = f.read()

        title = extract_title(text)
        body = md.convert(text)
        md.reset()

        with open(html_file, "w", encoding="utf-8") as f:
            f.write(TEMPLATE.format(title=title, body=body))

        print(f"  {html_file}")


if __name__ == "__main__":
    main()
