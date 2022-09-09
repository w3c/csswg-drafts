import os
from os.path import join
import re
import hashlib
import json

from bikeshed.config import scriptPath as bikeshedScriptPath

# This script changes the Bikeshed spec data to have any cross-references to
# CSSWG specs linked to their mirror URL.

ORIGINAL_BASE_URL = "https://drafts.csswg.org/"
BASE_URL = "https://w3c.github.io/csswg-drafts/"

spec_data_folder = bikeshedScriptPath("spec-data")

changed_hashes = {}

# We only need to change anchors, biblio and headings, as well as the
# manifest.txt


def generate_manifest_hash(text):
    encoded = text.encode("ascii", "xmlcharrefreplace")
    return hashlib.md5(encoded).hexdigest()


def update_anchors_and_biblio(file):
    changed = False
    replacedText = ""
    path = join(spec_data_folder, file)
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith(ORIGINAL_BASE_URL):
                changed = True
                line = BASE_URL + line[len(ORIGINAL_BASE_URL):]
            replacedText += line
    if changed:
        with open(path, mode="w", encoding="utf-8") as f:
            f.write(replacedText)
        changed_hashes[file] = generate_manifest_hash(replacedText)


def update_headings(file):
    changed = False
    path = join(spec_data_folder, file)
    with open(path) as f:
        headings_map = json.load(f)

    for heading_id in headings_map.values():
        if type(heading_id) != dict:
            continue
        for heading in heading_id.values():
            if heading["url"].startswith(ORIGINAL_BASE_URL):
                changed = True
                heading["url"] = BASE_URL + \
                    heading["url"][len(ORIGINAL_BASE_URL):]

    if changed:
        replacedText = json.dumps(
            headings_map, ensure_ascii=False, indent=2, sort_keys=True)
        with open(path, mode="w", encoding="utf-8") as f:
            f.write(replacedText)
        changed_hashes[file] = generate_manifest_hash(replacedText)


def update_manifest():
    if changed_hashes:
        replacedText = ""
        manifestFilename = join(spec_data_folder, "manifest.txt")
        with open(manifestFilename, encoding="utf-8") as f:
            for line in f:
                match = re.match("([0-9a-f]{32}) (.*)\n", line)
                if match:
                    filename = match.group(2)
                    if filename in changed_hashes:
                        sha = changed_hashes[filename]
                    else:
                        sha = match.group(1)
                    replacedText += "{} {}\n".format(sha, filename)
                else:
                    replacedText += line
        with open(manifestFilename, mode="w", encoding="utf-8") as f:
            f.write(replacedText)


for folder in ["anchors", "biblio"]:
    for file in os.listdir(join(spec_data_folder, folder)):
        update_anchors_and_biblio(join(folder, file))

for file in os.listdir(join(spec_data_folder, "headings")):
    update_headings(join("headings", file))

update_manifest()