#!/bin/bash
# This script automates a large part of making sure "user agent" is written in lower case.
# Doing so is backed by the CSS-WG resolution recorded at https://logs.csswg.org/irc.w3.org/css/2021-04-08/#e1402191
# After this script has run,
# there can remain a few instances of the term being used.
# Those will have to be fixed manually.
# Run frequently to avoid cruft piling up.
for FILE in "$@"
do
	sed -i -e "s/\([a-zA-Z,;]\) User Agent/\1 user agent/"\
	    -e "s/Note: User Agent/Note: User agent/"\
	    -e "s/\. User Agent/. User agent/" $FILE
done
echo "Remaining instances of 'User Agent':"
grep -R "User Agent" $@
