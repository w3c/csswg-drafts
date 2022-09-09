"""Builds the CSSWG directory index.

It also sets up redirects from shortnames to the current work spec, by building
an index.html with a <meta refresh>.
"""

import json
import os
import os.path
import re
import sys
from collections import defaultdict

from html.parser import HTMLParser

from bikeshed import Spec, constants

import jinja2

jinja_env = jinja2.Environment(
    loader=jinja2.PackageLoader("build-index", "templates"),
    autoescape=jinja2.select_autoescape(),
    trim_blocks=True,
    lstrip_blocks=True
)


def title_from_html(file):
    class HTMLTitleParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.in_title = False
            self.title = ""
            self.done = False

        def handle_starttag(self, tag, attrs):
            if tag == "title":
                self.in_title = True

        def handle_data(self, data):
            if self.in_title:
                self.title += data

        def handle_endtag(self, tag):
            if tag == "title" and self.in_title:
                self.in_title = False
                self.done = True
                self.reset()

    parser = HTMLTitleParser()
    with open(file, encoding="UTF-8") as f:
        for line in f:
            parser.feed(line)
            if parser.done:
                break
    if not parser.done:
        parser.close()

    return parser.title if parser.done else None


def get_bs_spec_metadata(folder_name, path):
    spec = Spec(path)
    spec.assembleDocument()

    level = int(spec.md.level) if spec.md.level else 0

    if spec.md.shortname == "css-animations-2":
        shortname = "css-animations"
    elif spec.md.shortname == "css-gcpm-4":
        shortname = "css-gcpm"
    elif spec.md.shortname == "css-transitions-2":
        shortname = "css-transitions"
    elif spec.md.shortname == "scroll-animations-1":
        shortname = "scroll-animations"
    else:
        # Fix CSS snapshots (e.g. "css-2022")
        snapshot_match = re.match(
            "^css-(20[0-9]{2})$", spec.md.shortname)
        if snapshot_match:
            shortname = "css-snapshot"
            level = int(snapshot_match.group(1))
        else:
            shortname = spec.md.shortname

    return {
        "shortname": shortname,
        "level": level,
        "title": spec.md.title,
        "workStatus": spec.md.workStatus
    }


def get_html_spec_metadata(folder_name, path):
    match = re.match("^([a-z0-9-]+)-([0-9]+)$", folder_name)
    if match and match.group(1) == "css":
        shortname = "css-snapshot"
        title = f"CSS Snapshot {match.group(2)}"
    else:
        shortname = match.group(1) if match else folder_name
        title = title_from_html(path)

    return {
        "shortname": shortname,
        "level": int(match.group(2)) if match else 0,
        "title": title,
        "workStatus": "completed"  # It's a good heuristic
    }


def build_redirect(shortname, spec_folder):
    """Builds redirects from the shortname to the current work for that spec.

    Since Github Actions doesn't allow anything like mod_rewrite, we do this by
    creating an empty index.html in the shortname folder that redirects to the
    correct spec.
    """

    template = jinja_env.get_template("redirect.html.j2")
    contents = template.render(spec_folder=spec_folder)

    folder = os.join(".", shortname)
    try:
        os.mkdir(folder)
    except FileExistsError:
        pass

    index = os.path.join(folder, "index.html")
    with open(index, mode='w', encoding="UTF-8") as f:
        f.write(contents)


CURRENT_WORK_EXCEPTIONS = {
    "css-conditional": 5,
    "css-easing": 2,
    "css-grid": 2,
    "css-snapshot": None,  # always choose the last spec
    "css-values": 4,
    "css-writing-modes": 4,
    "web-animations": 2
}

# ------------------------------------------------------------------------------


constants.setErrorLevel("nothing")

specgroups = defaultdict(list)

for entry in os.scandir("."):
    if entry.is_dir():
        # Not actual specs, just examples.
        if entry.name in ["css-module"]:
            continue

        bs_file = os.path.join(entry.path, "Overview.bs")
        html_file = os.path.join(entry.path, "Overview.html")
        if os.path.exists(bs_file):
            metadata = get_bs_spec_metadata(entry.name, bs_file)
        elif os.path.exists(html_file):
            metadata = get_html_spec_metadata(entry.name, html_file)
        else:
            # Not a spec
            continue

        metadata["dir"] = entry.name
        metadata["currentWork"] = False
        specgroups[metadata["shortname"]].append(metadata)

# Reorder the specs with common shortname based on their level (or year, for
# CSS snapshots), and determine which spec is the current work.
for shortname, specgroup in specgroups.items():
    if len(specgroup) == 1:
        if shortname != specgroup[0]["dir"]:
            build_redirect(shortname, specgroup[0]["dir"])
    else:
        specgroup.sort(key=lambda spec: spec["level"])

        # TODO: This algorithm for determining which spec is the current work
        # is wrong in a number of cases. Try and come up with a better
        # algorithm, rather than maintaining a list of exceptions.
        for spec in specgroup:
            if shortname in CURRENT_WORK_EXCEPTIONS:
                if CURRENT_WORK_EXCEPTIONS[shortname] == spec["level"]:
                    spec["currentWork"] = True
                    currentWorkDir = spec["dir"]
                    break
            elif spec["workStatus"] != "completed":
                spec["currentWork"] = True
                currentWorkDir = spec["dir"]
                break
        else:
            specgroup[-1]["currentWork"] = True
            currentWorkDir = specgroup[-1]["dir"]

        if shortname != currentWorkDir:
            build_redirect(shortname, currentWorkDir)
        if shortname == "css-snapshot":
            build_redirect("css", currentWorkDir)

with open("./index.html", mode='w', encoding="UTF-8") as f:
    template = jinja_env.get_template("index.html.j2")
    f.write(template.render(specgroups=specgroups))