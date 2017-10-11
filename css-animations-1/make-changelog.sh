#/bin/bash
hg log --style="$(dirname "$0")/make-changelog.template" "$(dirname "$0")/Overview.bs" "$(dirname "$0")/Overview.src.html" | sed 's/^	/  /;s/^- \(\[css[a-z0-9-]*\]\)* /- /'
