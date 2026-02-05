"""
All the drafts are built by the build-specs workflow itself.
This handles the rest of the work:

* creates an index page listing all specs
* creates symlinks for unlevelled urls, linking to the appropriate levelled folder
* builds timestamps.json, which provides metadata about the specs
"""

import glob
import json
import os
import os.path
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timezone

import bikeshed
from html.parser import HTMLParser

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


def get_date_authored_timestamp_from_git(path):
    source = os.path.realpath(path)
    proc = subprocess.run(["git", "log", "-1", "--format=%at", source],
                          capture_output = True, encoding = "utf_8")
    return int(proc.stdout.splitlines()[-1])


def get_bs_spec_metadata(folder_name, path):
    spec = bikeshed.Spec(path)
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
        "timestamp": get_date_authored_timestamp_from_git(path),
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


def create_symlink(shortname, spec_folder):
    """Creates a <shortname> symlink pointing to the given <spec_folder>.
    """

    if spec_folder in timestamps:
        timestamps[shortname] = timestamps[spec_folder]

    try:
        os.symlink(spec_folder, shortname)
    except OSError:
        pass


def format_timestamp(ts):
    """Format a Unix timestamp as a human-readable date string."""
    dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    return dt.strftime("%Y-%m-%d")


def escape_html(text):
    """Escape HTML special characters."""
    return (text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;"))


CURRENT_WORK_EXCEPTIONS = {
    "compositing": 2,
    "css-conditional": 5,
    "css-easing": 2,
    "css-grid": 2,
    "css-snapshot": None,  # always choose the last spec
    "css-values": 4,
    "css-writing-modes": 4,
    "web-animations": 2
}

# ------------------------------------------------------------------------------


bikeshed.messages.state.dieOn = "nothing"

specgroups = defaultdict(list)
timestamps = defaultdict(list)

for entry in os.scandir("."):
    if entry.is_dir(follow_symlinks=False):
        # Not actual specs, just examples.
        if entry.name in ["css-module"]:
            continue

        bs_file = os.path.join(entry.path, "Overview.bs")
        html_file = os.path.join(entry.path, "Overview.html")
        if os.path.exists(bs_file):
            metadata = get_bs_spec_metadata(entry.name, bs_file)
            timestamps[entry.name] = metadata["timestamp"]
        elif os.path.exists(html_file):
            metadata = get_html_spec_metadata(entry.name, html_file)
        else:
            # Not a spec
            continue

        metadata["dir"] = entry.name
        metadata["currentWork"] = False
        issues_files = sorted(f for f in glob.glob(os.path.join(entry.path, "issues-*.html"))
                                  if not f.endswith(".bsi.html"))
        metadata["issues"] = [os.path.basename(f) for f in issues_files]
        specgroups[metadata["shortname"]].append(metadata)

# Reorder the specs with common shortname based on their level (or year, for
# CSS snapshots), and determine which spec is the current work.
for shortname, specgroup in specgroups.items():
    if len(specgroup) == 1:
        if shortname != specgroup[0]["dir"]:
            create_symlink(shortname, specgroup[0]["dir"])
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
            create_symlink(shortname, currentWorkDir)
        if shortname == "css-snapshot":
            create_symlink("css", currentWorkDir)

with open('./timestamps.json', 'w') as f:
    json.dump(timestamps, f, indent = 2, sort_keys=True)

# Build the index page

# Flatten all specs into a single list with full metadata
all_specs = []
for shortname, specgroup in specgroups.items():
    group_size = len(specgroup)
    for spec in specgroup:
        dir_name = spec["dir"]
        ts = timestamps.get(dir_name, 0)
        title = spec["title"] or dir_name

        doc_links = []
        for fname in spec.get("issues", []):
            label = fname.replace("issues-", "").replace(".html", "")
            doc_links.append((f"./{dir_name}/{fname}", label))

        all_specs.append({
            "shortname": shortname,
            "dir": dir_name,
            "title": title,
            "ts": ts if isinstance(ts, int) else 0,
            "currentWork": spec["currentWork"],
            "level": spec["level"],
            "group_size": group_size,
            "doc_links": doc_links,
        })

# Sort by timestamp descending (most recent first) for default view
all_specs.sort(key=lambda s: s["ts"], reverse=True)

# Generate HTML for each spec
REPO = "https://github.com/w3c/csswg-drafts"
spec_items = []
for spec in all_specs:
    t = escape_html(spec["title"])
    d = spec["dir"]
    sn = spec["shortname"]
    ts = spec["ts"]
    lv = spec["level"]
    gs = spec["group_size"]
    date_str = format_timestamp(ts) if ts else ""
    iso_date = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if ts else ""

    cw = ' <span class="badge current-work">Current Work</span>' if spec["currentWork"] else ""

    links = [
        f'<a href="{REPO}/issues?q=is%3Aissue+is%3Aopen+label%3A{d}">Issues</a>',
        f'<a href="{REPO}/pulls?q=is%3Apr+is%3Aopen+label%3A{d}">PRs</a>',
        f'<a href="{REPO}/commits/main/{d}/">History</a>',
    ]
    for url, label in spec["doc_links"]:
        links.append(f'<a href="{url}">DoC: {escape_html(label)}</a>')
    links_html = ' <span class="sep">\u00b7</span> '.join(links)

    spec_items.append(
        f'    <div class="spec" data-ts="{ts}" data-shortname="{escape_html(sn)}"'
        f' data-dir="{escape_html(d)}" data-level="{lv}" data-group-size="{gs}">\n'
        f'      <div class="spec-main">\n'
        f'        <span class="activity-dot" data-ts="{ts}"></span>\n'
        f'        <a class="spec-title" href="./{d}/">{t}</a>{cw}\n'
        f'        <code class="spec-shortname">{escape_html(d)}</code>\n'
        f'        <time class="spec-date" datetime="{iso_date}" data-ts="{ts}">{date_str}</time>\n'
        f'      </div>\n'
        f'      <div class="spec-links">{links_html}</div>\n'
        f'    </div>'
    )

specs_html = "\n".join(spec_items)

HTML_START = """\
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CSS Working Group Editor Drafts</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 960px;
      margin: 0 auto;
      padding: 1.5em 1em;
      color: #1f2328;
      background: #fff;
    }
    h1 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0 0 1em;
    }
    .search-bar {
      position: sticky;
      top: 0;
      background: #fff;
      padding: 0.5em 0 0.75em;
      z-index: 10;
    }
    .search-bar input {
      width: 100%;
      padding: 0.6em 1em;
      font-size: 1em;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      background: #f6f8fa;
    }
    .search-bar input:focus {
      background: #fff;
      border-color: #0366d6;
      box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.15);
    }
    .controls {
      display: flex;
      gap: 0.5em;
      align-items: center;
      margin-bottom: 0.75em;
      font-size: 0.85em;
      color: #666;
    }
    .controls button {
      background: none;
      border: 1px solid #d1d5db;
      padding: 0.25em 0.75em;
      border-radius: 4px;
      cursor: pointer;
      font-size: inherit;
      color: #444;
    }
    .controls button:hover { background: #f6f8fa; }
    .controls button.active {
      background: #0366d6;
      color: #fff;
      border-color: #0366d6;
    }
    .spec-count { margin-left: auto; }
    #spec-list { margin-top: 0.25em; }
    .spec {
      padding: 0.6em 0;
      border-bottom: 1px solid #eee;
    }
    .spec:last-child { border-bottom: none; }
    .spec.hidden { display: none; }
    .spec-main {
      display: flex;
      align-items: baseline;
      gap: 0.5em;
      flex-wrap: wrap;
    }
    .activity-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
      top: -1px;
    }
    .activity-dot.recent { background: #1a7f37; }
    .activity-dot.moderate { background: #bf8700; }
    .activity-dot.stale { background: #ccc; }
    .spec-title {
      color: #0366d6;
      text-decoration: none;
      font-weight: 500;
    }
    .spec-title:hover { text-decoration: underline; }
    .badge {
      font-size: 0.75em;
      padding: 0.15em 0.5em;
      border-radius: 3px;
      font-weight: 500;
      white-space: nowrap;
    }
    .current-work {
      background: #dafbe1;
      color: #1a7f37;
    }
    .spec-shortname {
      font-size: 0.8em;
      color: #656d76;
      background: #f6f8fa;
      padding: 0.1em 0.4em;
      border-radius: 3px;
    }
    .spec-date {
      margin-left: auto;
      font-size: 0.85em;
      color: #656d76;
      white-space: nowrap;
    }
    .spec-links {
      margin-top: 0.2em;
      padding-left: 1.5em;
      font-size: 0.8em;
    }
    .spec-links a {
      color: #656d76;
      text-decoration: none;
    }
    .spec-links a:hover { color: #0366d6; text-decoration: underline; }
    .sep { color: #ccc; margin: 0 0.15em; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .group-header {
      font-weight: 600;
      font-size: 0.9em;
      padding: 1em 0 0.3em;
      color: #1f2328;
      border-bottom: 1px solid #d1d5db;
    }
    .grouped-spec { padding-left: 1.5em; }
    .no-results {
      padding: 2em;
      text-align: center;
      color: #666;
      display: none;
    }
  </style>
</head>
<body>
  <h1>CSS Working Group Editor Drafts</h1>
  <div class="search-bar">
    <input type="text" id="search" placeholder="Filter specifications\u2026" autofocus>
  </div>
  <div class="controls">
    <button id="sort-recent" class="active">Recent</button>
    <button id="sort-grouped">Grouped</button>
    <span class="spec-count" id="spec-count"></span>
  </div>
  <div id="spec-list">
"""

HTML_END = """\
  </div>
  <div class="no-results" id="no-results">No matching specifications.</div>
  <script>
  (function() {
    var searchInput = document.getElementById('search');
    var specList = document.getElementById('spec-list');
    var specs = Array.from(specList.querySelectorAll('.spec'));
    var btnRecent = document.getElementById('sort-recent');
    var btnGrouped = document.getElementById('sort-grouped');
    var countEl = document.getElementById('spec-count');
    var noResults = document.getElementById('no-results');
    var totalCount = specs.length;

    // Relative dates and activity dots
    var now = Date.now() / 1000;
    var DAY = 86400;
    specs.forEach(function(el) {
      var ts = parseInt(el.dataset.ts);
      if (!ts) return;
      var age = now - ts;
      var dot = el.querySelector('.activity-dot');
      var timeEl = el.querySelector('.spec-date');

      if (age < 30 * DAY) dot.className = 'activity-dot recent';
      else if (age < 180 * DAY) dot.className = 'activity-dot moderate';
      else dot.className = 'activity-dot stale';

      var rel;
      if (age < DAY) rel = 'today';
      else if (age < 2 * DAY) rel = 'yesterday';
      else if (age < 7 * DAY) rel = Math.floor(age / DAY) + ' days ago';
      else if (age < 30 * DAY) {
        var w = Math.floor(age / (7 * DAY));
        rel = w === 1 ? 'last week' : w + ' weeks ago';
      } else if (age < 365 * DAY) {
        var m = Math.floor(age / (30 * DAY));
        rel = m === 1 ? 'last month' : m + ' months ago';
      } else {
        var y = Math.floor(age / (365 * DAY));
        rel = y === 1 ? 'last year' : y + ' years ago';
      }
      timeEl.title = timeEl.textContent;
      timeEl.textContent = rel;
    });

    function updateCount() {
      var visible = specs.filter(function(s) { return !s.classList.contains('hidden'); }).length;
      countEl.textContent = visible === totalCount ? totalCount + ' specs' : visible + ' of ' + totalCount;
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
    updateCount();

    // Search
    searchInput.addEventListener('input', function() {
      var q = searchInput.value.toLowerCase();
      specs.forEach(function(el) {
        var text = el.dataset.dir + ' ' + el.dataset.shortname + ' ' +
                   el.querySelector('.spec-title').textContent.toLowerCase();
        if (text.indexOf(q) >= 0) el.classList.remove('hidden');
        else el.classList.add('hidden');
      });
      specList.querySelectorAll('.group-header').forEach(function(h) {
        var sn = h.dataset.shortname;
        var any = specs.some(function(s) {
          return s.dataset.shortname === sn && !s.classList.contains('hidden');
        });
        h.style.display = any ? '' : 'none';
      });
      updateCount();
    });

    // Sort: Recent
    function sortRecent() {
      specList.querySelectorAll('.group-header').forEach(function(h) { h.remove(); });
      specs.sort(function(a, b) { return parseInt(b.dataset.ts) - parseInt(a.dataset.ts); });
      specs.forEach(function(el) {
        el.classList.remove('grouped-spec');
        specList.appendChild(el);
      });
      btnRecent.classList.add('active');
      btnGrouped.classList.remove('active');
    }

    // Sort: Grouped
    function sortGrouped() {
      specList.querySelectorAll('.group-header').forEach(function(h) { h.remove(); });
      specs.sort(function(a, b) {
        var c = a.dataset.shortname.localeCompare(b.dataset.shortname);
        if (c !== 0) return c;
        return parseInt(a.dataset.level) - parseInt(b.dataset.level);
      });
      var lastSn = null;
      specs.forEach(function(el) {
        var sn = el.dataset.shortname;
        var gs = parseInt(el.dataset.groupSize);
        if (sn !== lastSn && gs > 1) {
          var header = document.createElement('div');
          header.className = 'group-header';
          header.dataset.shortname = sn;
          header.textContent = sn;
          specList.appendChild(header);
        }
        if (gs > 1) el.classList.add('grouped-spec');
        else el.classList.remove('grouped-spec');
        specList.appendChild(el);
        lastSn = sn;
      });
      btnGrouped.classList.add('active');
      btnRecent.classList.remove('active');
    }

    btnRecent.addEventListener('click', sortRecent);
    btnGrouped.addEventListener('click', sortGrouped);
  })();
  </script>
</body>
</html>
"""

with open("./index.html", mode='w', encoding="UTF-8") as f:
    f.write(HTML_START)
    f.write(specs_html)
    f.write(HTML_END)
