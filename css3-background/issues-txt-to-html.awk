#!/usr/bin/awk
#
# Takes a compact issues list in plain text and expands it to an HTML
# document. The issues list is line-based. Lines that start neither
# with "Issue" nor with a keyword and a colon are ignored, unless they
# are continuation lines (see below). The lines are grouped into issues: each
# occurrence of "Issue:" starts a new issue. The following keywords
# are recognized:
#
# Draft
#   Must only occur once. The draft that these issues apply to. The
#   value must be a URL that ends with <status>-<shortname>-<YYYYMMDD>
#   and an optional slash.
#
# Audience
#   Must occur at most once. Set to "WG" (the default) for an HTML
#   output with the "Edit" fields included, or to "Director" for an
#   HTML output without those fields.
#
# Issue
#   The issue number. The colon is optional after "Issue". Typically a
#   number, but may be anything. Must be unique.
#
# Summary
#   A short summary of the issue. May occur multiple times per
#   issue. Each occurrence adds a paragraph to the summary.
#
# From
#   The person who raised the issue. May occur multiple times per
#   issue.
#
# Comment
#   Typically a URL pointing to (a part of) the comment. May occur
#   multiple times per issue. (Usually a pointer to a message on
#   www-style.)
#
# Response
#   Typically a URL pointing to an answer that the WG sent to the
#   commenter. (Usually a pointer to a message on www-style.) May
#   occur multiple times per issue. Comment and Response lines should
#   occur in date order: for each issue, older comments and responses
#   should be listed before newer ones.
#
# Closed
#   The WG's resolution. Can be "Accepted," "Rejected," "OutOfScope,"
#   "Retracted" or "Invalid." May occur only once per issue.
#
# Verified
#   URL pointing to a message in which the commenter accepts the WG's
#   resolution. (Typically omitted for issues that are "Accepted.") 
#   Should only occur multiple times if there are multiple From lines.
#
# Objection
#   URL pointing to a message in which the commenter rejects the WG's
#   resolution. Should only occur multiple times if there are
#   multiple From lines.
#
# Edit
#   Any text destined at the working group: edits to do or done,
#   actions for people or for the WG, other comments...
#
# Resolution:
#   Like Edit, only destined at the working group, but used to
#   summarize a resolution.
#
# "Summary:", "Comment:", "Response:", "From:" and "Edit:" may have
# continuation lines (in the case of Comment and Response only if the
# first line contains text and not a URL), which are lines that start
# with white space.
#
# Author: Bert Bos <bert@w3.org>
# Created: 13 March 2012
# Copyright: © 2012 World Wide Web Consortium
# See http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231


BEGIN {nerrors = 0; n = 0; prev = ""; IGNORECASE = 1}

# Lines that start with a field name:

/^draft[ \t]*:/ {
  draft = val($0);
  prev = "";
  next;
}
/^audience[ \t]*:[ \t]*wg\>/ {
  next;
}
/^audience[ \t]*:[ \t]*director\>/ {
  audience = "Director";
  next;
}
/^audience[ \t]*:/ {
  err("Audience must be \"WG\" (default) or \"Director\".");
  next;
}
/^issue\>/ {
  h = val($0);
  if (h in seqno) err("Duplicate issue number: " h);
  id[++n] = h;
  seqno[h] = n;
  prev = "";
  next;
}
n && /^summary[ \t]*:/ {
  summary[n] = summary[n] "<p>" val($0);
  prev = "summary";
  next;
}
n && /^comment[ \t]*:[ \t]*http:/ {
  link[n] = link[n] "<li><a href=\"" val($0) "\">comment</a>\n";
  prev = "";
  next;
}
n && /^comment[ \t]*:/ {
  link[n] = link[n] "<li>" val($0) "\n";
  prev = "comment";
  next;
}
n && /^response[ \t]*:[ \t]*http:/ {
  link[n] = link[n] "<li><a href=\"" val($0) "\">reply</a>\n";
  prev = "";
  next;
}
n && /^response[ \t]*:/ {
  link[n] = link[n] "<li>" val($0) "\n";
  prev = "response";
  next;
}
n && /^from[ \t]*:/ {
  from[n] = (from[n] ? from[n] "<br>" : "") val($0);
  prev = "from";
  next;
}
n && /^closed[ \t]*:[ \t]* accepted\>/ {
  status[n] = "Accepted";
  prev = "";
  next;
}
n && /^closed[ \t]*:[ \t]* outofscope\>/ {
  status[n] = "Out of scope";
  prev = "";
  next;
}
n && /^closed[ \t]*:[ \t]* invalid\>/ {
  status[n] = "Invalid";
  prev = "";
  next;
}
n && /^closed[ \t]*:[ \t]* rejected\>/ {
  status[n] = "Rejected";
  prev = "";
  next;
}
n && /^closed[ \t]*:[ \t]* retracted\>/ {
  status[n] = "Retracted";
  prev = "";
  next;
}
n && /^closed[ \t]*:/ {
  err("Unrecognized resolution \"" val($0) "\".");
  prev = "";
  next;
}
n && /^verified[ \t]*:[ \t]*http:/ {
  verif[n] = verif[n] "<a href=\"" val($0) "\">verified</a> ";
  prev = "";
  next;
}
n && /^verified[ \t]*:/ {
  verif[n] = verif[n] "<span title=\"" val($0) "\">verified</span> ";
  prev = "";
  next;
}
n && /^objection[ \t]*:/ {
  obj[n] = obj[n] "<a href=\"" val($0) "\">objection</a> ";
  prev = "";
  next;
}
n && /^edit[ \t]*:/ {
  edit[n] = edit[n] "<p>" val($0);
  prev = "edit";
  next;
}

n && /^resolution[ \t]*:/ {
  edit[n] = edit[n] "<p>Resolution: " val($0);
  prev = "edit";
  next;
}

# Continuation lines start with white space:

/^[ \t]+[^ \t]/ && prev == "summary" {
  summary[n] = summary[n] val2($0);
  next;
}
/^[ \t]+[^ \t]/ && prev == "comment" {
  link[n] = link[n] val2($0);
  next;
}
/^[ \t]+[^ \t]/ && prev == "response" {
  link[n] = link[n] val2($0);
  next;
}
/^[ \t]+[^ \t]/ && prev == "from" {
  from[n] = from[n] val2($0);
  next;
}
/^[ \t]+[^ \t]/ && prev == "edit" {
  edit[n] = edit[n] val2($0);
  next;
}

# Any other line is ignored, any other field name is an error:

{prev = ""}
n && /^[a-z]+[ \t]*:/ {err("Unrecognized keyword \"" $1 "\"."); next}
/^[a-z]+[ \t]*:/ {err("Incorrect keyword \"" $1 "\" before first issue."); next}

END {generate(); exit nerrors}


# arraylength -- return length of an array
function arraylength(x,		i, n)
{
  n = 0;
  for (i in x) n++;
  return n;
}


# generate -- generate the HTML file with all the issues
function generate(	command, title, date, class, nobjections, i)
{
  if (draft) {
    command = "hxnormalize -l 10000 -x " draft " | hxselect -c -s '\n' title";
    command | getline title;
    date = gensub("^.*-([0-9][0-9][0-9][0-9])([0-9][0-9])([0-9][0-9])/?$", \
                  "\\1-\\2-\\3", 1, draft);
  }

  if (!title) title = draft;
  if (!title) title = "[unknown]";
  if (!date) date = "[unknown]";

  print "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">";
  print "<html lang=en>";
  print "<title>Disposition of Comments for “" title "” of " date "</title>";
  print "<meta http-equiv=content-type content=\"text/html; charset=utf-8\">\n";
  print "<style type=\"text/css\">";
  print "body {background: white; color: black}";
  print ".incomplete {background: lavender}";
  print ".proposal:before {content: \"Proposal: \"; font-weight: bold}";
  print "table {border-collapse: collapse}";
  print "thead {background: gray; color: white}";
  print "tr {border-bottom: solid thin white}";
  print "th, td {text-align: left; padding: 0.5em; vertical-align: baseline}";
  print "td > *:first-child {margin-top: 0}";
  print "td > *:last-child {margin-bottom: 0}";
  print ".legend {font-size: smaller}";
  print ".ok {background: hsl(120,100%,85%)}";
  print ".objection {background: hsl(0,100%,40%); color: white}";
  print ".unverified {background: hsl(39,100%,70%)}";
  print ".edit {background: white; border-bottom: solid thin gray}";
  print "</style>\n";
  print "<h1>Disposition of comments</h1>\n";
  print "<dl>";
  print "<dt>Title <dd>" title;
  print "<dt>Date <dd>" date;
  print "<dt>URL <dd><a href=\"" draft "\">" draft "</a>";
  print "</dl>\n";
  i = arraylength(obj);
  if (i == 0)
    print "<p>There are no objections.\n";
  else if (i == 1)
    print "<p class=objection>There is 1 objection.\n";
  else
    print "<p class=objection>There are " i " objections.\n";
  print "<table>";
  print "<thead>";
  print "<tr>";
  print "<th>#"
  print "<th>Author";
  print "<th>Summary and discussion";
  if (audience != "Director") print "<th>Actions for WG";
  print "<th>Result";
  print "<tbody>";

  for (i = 1; i <= n; i++) {
    printf "\n<tr class=";
    if (obj[i]) print "objection>";
    else if (verif[i] || status[i] ~ "Accepted|Retracted") print "ok>";
    else if (status[i]) print "unverified>";
    else print "incomplete>";
    print "<td id=x" i "><a href=\"#x" i "\">" id[i] "</a>";
    print "<td>" from[i];
    print "<td>" linkify(summary[i]);
    if (link[i]) printf "<ol>\n%s</ol>\n", link[i];
    if (audience != "Director") printf "<td class=edit>%s\n", linkify(edit[i]);
    if (status[i]) printf "<td>%s", status[i];
    else printf "<td><strong>[OPEN]</strong>";
    if (obj[i]) printf " but %s", obj[i];
    else if (verif[i]) printf " and %s", verif[i];
    else if (status[i] && status[i] !~ "Accepted|Retracted") printf " but unverified";
    printf "\n";
  }
  print "</table>\n";
  print "<p class=legend>Legend:\n";
  print "<table class=legend>";
  print "<thead>";
  print "<tr><th>Status<th>Meaning";
  print "<tbody>";
  print "<tr>\n<td class=ok>Retracted";
  print "<td>Commenter has withdrawn the comment.";
  print "<tr>\n<td class=ok>Accepted";
  print "<td>The WG accepted and applied the comment.";
  print "<tr>\n<td class=ok>Out of scope and verified";
  print "<td>Commenter accepts that the comment is out of scope.";
  print "<tr>\n<td class=ok>Invalid and verified";
  print "<td>Commenter accepts that the comment is invalid.";
  print "<tr>\n<td class=ok>Rejected and verified";
  print "<td>Commenter accepts that the WG did not apply the comment.";
  print "<tr>\n<td class=unverified>Out of scope but unverified";
  print "<td>Comment out of scope, but commenter did not yet react."
  print "<tr>\n<td class=unverified>Invalid but unverified";
  print "<td>Comment invalid, but commenter did not yet react.";
  print "<tr>\n<td class=unverified>Rejected but unverified";
  print "<td>Comment rejected, but commenter did not yet react.";
  print "<tr>\n<td class=objection>Out of scope with objection";
  print "<td>Comment out of scope, but commenter disagrees.";
  print "<tr>\n<td class=objection>Invalid with objection";
  print "<td>Comment invalid, but commenter disagrees.";
  print "<tr>\n<td class=objection>Rejected with objection";
  print "<td>Comment rejected, but commenter objects.";
  print "</table>\n";
  print "<p>This file was generated from";
  print "<a href=\"" FILENAME "\">" FILENAME "</a>";
  print "on " strftime("%e %B %Y", systime(), 1) ".";
}


# linkify -- make words that look like URLs into links
function linkify(s)
{
  s = gensub(/[a-z]+:[^ )<]+/, "<a href=\"&\">&</a>", "g", s);
  # s = gensub(/(>[a-z]+:)[^ )<]*([^ )<][^ )<][^ )<][^ )<][^ )<][^ )<][^ )<][^ )<][^ )<]<)/, "\\1\\&hellip;\\2", "g", s);
  # s = gensub(/(>[a-z]+:)[^ )<]*\/([^ /)<]+<)/, "\\1\\&hellip;\\2", "g", s);
  s = gensub(/>[^ )<]*\/([^ /)<]+<)/, ">\\1", "g", s);
  return s;
}


# esc -- escape HTML delimiters
function esc(s)
{
  gsub("&", "\\&amp;", s);
  gsub("<", "\\&lt;", s);
  gsub(">", "\\&gt;", s);
  gsub("\"", "\\&quot;", s);
  return s;
}


# val -- return the value part of the line s, as an HTML string
function val(s)
{
  return esc(gensub("^[a-z]+[ \t]*(:[ \t]*)?", "", 1, s));
}


# val2 -- return the line s with initial white space collapsed
function val2(s)
{
  return esc(gensub("^[ \t]*", " ", 1, s));
}


# err -- print an error message and increment the error count
function err(msg)
{
  print FILENAME ":" FNR ": " msg > "/dev/stderr";
  nerrors++;
}
