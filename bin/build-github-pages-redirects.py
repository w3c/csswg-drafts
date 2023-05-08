"""
Builds the Github Pages for this repo, which now only redirects to
drafts.csswg.org
"""

import glob
import re
import os
import os.path

paths_to_build = set(["/", "/css-snapshot/"])

for file in glob.glob("**/*.bs"):
    if file.endswith("/Overview.bs"):
        folder = "/" + file.removesuffix("Overview.bs")
        paths_to_build.add(folder)

        # If the folder ends with a version number, remove it to build
        # the unversioned spec as well.
        # We make sure to exclude css-20XX snapshots.
        match = re.search("^(.+)-\d+/$", folder)
        if match and match.group(1) != "/css":
            paths_to_build.add(match.group(1) + "/")
    else:
        paths_to_build.add("/" + file.removesuffix(".bs") + ".html")


for path in paths_to_build:
    dest = "./build" + path
    if dest.endswith("/"):
        dest += "index.html"

    # Make sure the folder exists
    os.makedirs(os.path.dirname(dest), exist_ok=True)

    with open(dest, mode="w", encoding="UTF-8") as f:
        f.write(
            f"""
<!doctype html>
<meta charset=utf-8>
<title>Redirecting to drafts.csswg.org...</title>
<meta http-equiv=Refresh content="0; url='https://drafts.csswg.org{path}'">
<script>
window.location.href = "https://drafts.csswg.org{path}";
</script>
"""
        )
