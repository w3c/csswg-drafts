#!/usr/bin/perl

# Color coding
#   Note statuses will get lowercased before lookup
%statusStyle = (
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
  print "\nPass in issues list filename for processing!\n\n";
  print "~~~~~~~~~~~~~~~~~~~~~ Template for issues-list.txt ~~~~~~~~~~~~~~~~~~~~~\n";
  print <<XXX;

Draft:    https://www.w3.org/TR/2013/WD-css-text-decor-3-20130103/
Title:    CSS Text Decoration Level 3
... anything else you want here, except 4 dashes ...

----
Issue 1.
Summary:  [summary]
From:     [name]
Comment:  [url]
Response: [url]
Closed:   [status ... or replace this "Closed" line with "Open"]
Verified: [url]
----
XXX
  exit;
}

# Input/Output setup
my $outFile = $inFile;
$outFile =~ s/\.txt/\.html/;
open IN,  "<", $inFile  || die "Cannot open $inFile: $!";
open OUT, ">", $outFile || die "Cannot open $outFile: $!";
$/ = "----\n";

# Header
&header;

# Issues
while (<IN>) {
  chomp;

  # Issue number
  s/Issue (\d+)\./Issue \1. <a href="#issue-\1">#<\/a>/;
  $index = $1;

  # Color coding
  $code = '';
  if (/\nVerified:\s+http/) {
    $code = 'a';
  }
  elsif (/\n(?:Closed|Open):\s+(\S+)/) {
    $code = $statusStyle{lc $1};
  }
  if (/\nOpen/) {
    $code .= ' ' if $code;
    $code .= 'open';
  }

  # And print it
  print OUT "<pre class='$code' id='issue-$index'>\n";
  s/(http\S+)/<a href="\1">\1<\/a>/g;
  print OUT;
  print OUT "</pre>\n";
}

sub header {
  # Read header
  local $_ = <IN>;
  chomp;

  # Extract title and URL
  my $title, $url;
  for (split /\n+/) {
    $title = $1 if (/^Title:\s+(.+)$/);
    $url   = $1 if (/^Draft:\s+(\S+)/);
  }
  die "Error: missing document URL or title.\n" unless ($url && $title);

  # Process URL to get status, date, shorname
  die "Error: Draft URL wrong format.\n" unless
    ($url =~ /([A-Z]{2})-([a-z0-9-]+)-(\d{8})/);
  ($status, $shortname, $date) = ($1, $2, $3);
  $status = 'LCWD' if ('WD' eq $status && $inFile =~ /[lL][cC]/);
  $date = "$1-$2-$3" if ($date =~ /(\d{4})(\d{2})(\d{2})/);

  # Print it all out
  print OUT <<XXX;
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<title>$title Disposition of Comments for $date $status</title>
<style type="text/css">
  .a  { background: lightgreen }
  .d  { background: lightblue  }
  .r  { background: orange     }
  .fo { background: red        }
  .open   { border: solid red; padding: 0.2em; }
  :target { box-shadow: 0.25em 0.25em 0.25em;  }
</style>

<h1>$title Disposition of Comments for $date $status</h1>

<p>Last call document: <a href="$url">$url</a>

<p>Editor's draft: <a href="https://drafts.fxtf.org/$shortname/">https://drafts.fxtf.org/$shortname/</a>

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
