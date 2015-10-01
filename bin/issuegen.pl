#!/usr/bin/perl

use strict;

# Color coding
#   Note statuses will get lowercased before lookup
my %statusStyle = (
  'accepted'     => 'a',
  'retracted'    => 'a',
  'rejected'     => 'r',
  'objection'    => 'fo',
  'deferred'     => 'd',
  'invalid'      => 'oi',
  'outofscope'   => 'oi',
);
# Header template is at the end of the file

################################################################################

my $inFile = $ARGV[0];
if (!$inFile) {
  print "\nPass in issues list filename for processing!";
  print "\nOr use argument 'help' for help.\n\n";
  print "~~~~~~~~~~~~~~~~~~~~~ Template for issues-list.txt ~~~~~~~~~~~~~~~~~~~~~\n";
  print <<XXX;

Draft:    http://www.w3.org/TR/2013/WD-css-text-decor-3-20130103/
Title:    CSS Text Decoration Level 3
... any notes you want here, except 4 dashes ...

----
Issue 1.
Summary:  [summary]
From:     [name]
Comment:  [url]
Response: [url]
Closed:   Accepted/OutOfScope/Invalid/Rejected/Retracted/Deferred ... or replace this line with "Open"
Verified: [url]
Resolved: Editorial/Bugfix (for obvious fixes)/Editor discretion/[url to minutes]
----
XXX
  exit;
}
if ($inFile eq 'help') {
  print <<XXX;

Welcome to fantasai's Issues List Generator!

This is a script that converts a plaintext (.txt) issues list into a
color-coded HTML file of the same name (but .html file extension).
The input is itself a presentable, easily-editable file designed
mostly for the editor’s convenenience.

The original purpose of this format is to create a Disposition of
Comments for the W3C's LCWD->CR transition process. However, it is
also useful for tracking issues in general and can be used as such.
There is no requirement to use this format; fantasai merely found it
the most convenient way to track issues and create a DoC.

Beyond the header, the script itself only processes the dividers,
the issue number, and the status (Closed/Open). Additional fields
may be added or removed as desired; they are merely passed through.

fantasai suggests the following fields, as seen in the template:

Summary:  A one-line summary of the issue, so that a reviewer can
          quickly grasp what the issue was about.

From:     The name of the commenter.

Comment:  URL to the message that most clearly presents the issue.
          Usually the initial message in a thread, but not always.
          This is the hook into the discussion, where further details
          can be read.

Response: URL to the editor’s response that is intended to close
          the issue: usually either reporting changes made to the
          spec, or explaining why changes aren't being made.
          Note this is not always the first reply from the editor.

The Comment/Response lines can be repeated if new responses are
made presenting information that reopens the issue; however the
entire thread shouldn't be tracked, only key messages. The goal
is to minimize the effort required for someone reviewing the issues
to understand this issue and its resolution.

Closed:   A status line on how the issue was closed. Triggers colors.
          Replacing "Closed" with "Open" marks the issue unresolved.

Verified: URL to a message where the commenter indicates satisfaction
          with the resolution of the issue.
          (If the status was Rejected, this will turn the color green.)
          It's helpful to get the commenter's feedback on the changes,
          since they will often notice any mistakes. Verification
          indicates full closure of the issue.

Resolved: I use this line to track by what authority the issue was closed.
          It makes me think explicitly about whether the WG or anyone
          else should be consulted for solutions/review/approval.
          Values applicable to the CSSWG include:
            Editorial - no substantive change
            Bugfix    - fixes an obvious error with an obvious solution
            [URL]     - link to WG resolution closing the issue
            Editor discretion - 
              This is the tricky one. It's used in cases where
                1. the solution isn't obvious (not Bugfix)
                2. the impact of the solution is minor and localized:
                     * there is no cross-module impact
                     * there is no cross-module consistency concern
                     * it is unlikely to affect implementation architecture
                3. no syntax/API is affected
                4. there is consensus on the mailing list, at least
                   among the people involved in the discussion; and
                   nobody not involved is likely to care
              It is also occasionally used to close issues as No Change
              in cases where the commenter is clueless or the requested
              change would clearly violate a WG design principle.
~fantasai
XXX
  exit;
}

# Input/Output setup
my $outFile = $inFile;
if ($inFile =~ /\.(.+)$/) {
  $outFile =~ s/\.$1/\.html/;
}
elsif ($inFile =~ /\.$/) { # tab completion case
  $inFile .= 'txt';
  $outFile .= 'html';
}
else {
  $inFile .= '.html';
}
open IN,  "<", $inFile  || die "Cannot open $inFile: $!";
open OUT, ">", $outFile || die "Cannot open $outFile: $!";
$/ = "----\n";

# Header
&header;

# Issues
while (<IN>) {
  chomp;

  # Don't pipe code
  s/</&lt;/g;

  # Linkify URLs
  s/(http\S+)/<a href='\1'>\1<\/a>/g;

  # Anchor issue number
  s/Issue (\d+)\./Issue \1. <a href='#issue-\1'>#<\/a>/;
  my $index = $1;

  # Color coding WG response
  my @lines = split /\n/;
  my ($status, $code);
  foreach (@lines) {
    # Get Status
    if (/^Open/) {
      $status = 'open';
    }
    # Colorize WG response
    if (/^(?:Closed|Open):\s+(\S+)$/) {
      $code = $statusStyle{lc $1};
      $_ = '<span class="' . $code . '">' . $_ . '</span>';
    }
    # Colorize commenter response
    elsif (/^Verified:\s+\S+/) {
      $code = 'a';
      $_ = '<span class="a">' . $_ . '</span>';
    }
    else {
      $_ = '<span>' . $_ . '</span>';
    }
  }

  # And print it
  print OUT "<pre class='$status $code' id='issue-$index'>\n";
  print OUT join "\n", @lines;
  print OUT "</pre>\n";
}

&script;

sub header {
  # Read header
  local $_ = <IN>;
  chomp;

  # Extract title and URL
  my ($title, $url);
  for (split /\n+/) {
    $title = $1 if (/^Title:\s+(.+)$/);
    $url   = $1 if (/^Draft:\s+(\S+)/);
  }
  die "Error: missing document URL or title.\n" unless ($url && $title);

  # Process URL to get status, date, shorname
  die "Error: Draft URL wrong format.\n" unless
    ($url =~ /([A-Z]{2})-([a-z0-9-]+)-(\d{8})/);
  my ($status, $shortname, $date) = ($1, $2, $3);
  $status = 'LCWD' if ('WD' eq $status && $inFile =~ /[lL][cC]/);
  $date = "$1-$2-$3" if ($date =~ /(\d{4})(\d{2})(\d{2})/);

  # Print it all out
  print OUT <<XXX;
<!DOCTYPE html>
<meta charset="utf-8">
<title>$title Disposition of Comments for $date $status</title>
<style type="text/css">
  pre { border: solid thin silver; padding: 0.2em; white-space: normal; }
  pre > span { display: block; white-space: pre; }
  :not(pre).a  { background: lightgreen }
  :not(pre).d  { background: lightblue  }
  :not(pre).oi { background: yellow     }
  :not(pre).r  { background: orange     }
  :not(pre).fo { background: red        }
  .open   { border: solid red; }
  :target { box-shadow: 0.25em 0.25em 0.25em;  }
</style>

<h1>$title Disposition of Comments for $date $status</h1>

<p>Last call document: <a href="$url">$url</a>

<p>Editor's draft: <a href="http://dev.w3.org/csswg/$shortname/">http://dev.w3.org/csswg/$shortname/</a>

<p>The following color coding convention is used for comments:</p>

<ul>
 <li class="a">Accepted or Rejected and positive response
 <li class="r">Rejected and no response
 <li class="fo">Rejected and negative response
 <li class="d">Deferred
 <li class="oi">Out-of-Scope or Invalid and not verified
</ul>

<p class=open>Open issues are marked like this</p>

<p>An issue can be closed as <code>Accepted</code>, <code>OutOfScope</code>,
<code>Invalid</code>, <code>Rejected</code>, or <code>Retracted</code>.
<code>Verified</code> indicates commentor's acceptance of the response.</p>
XXX
}

sub script {
	print OUT <<XXX;
<script>
(function () {
	var sheet = document.styleSheets[0];
	function addCheckbox(className) {
		var element = document.querySelector('*.' + className);
		var span = document.createElement('span');
		span.innerHTML = element.innerHTML;
		element.innerHTML = null;
		var check = document.createElement('input');
		check.type = 'checkbox';
		if (className == 'open') {
			check.checked = false;
			sheet.insertRule('pre:not(.open)' + '{}', sheet.cssRules.length);
			check.onchange = function (e) {
				rule.style.display = this.checked ? 'none' : 'block';
			}
		}
		else {
			check.checked = true;
			sheet.insertRule('pre.' + className + '{}', sheet.cssRules.length);
			check.onchange = function (e) {
				rule.style.display = this.checked ? 'block' : 'none';
			}
		}
		var rule = sheet.cssRules[sheet.cssRules.length - 1];
		element.appendChild(check);
		element.appendChild(span);
	}
	['a', 'd', 'fo', 'oi', 'r', 'open'].forEach(addCheckbox);
}());
</script>
XXX
}
