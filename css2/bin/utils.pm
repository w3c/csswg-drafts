# A few common routines						 -*-perl-*-
#
# Bert Bos <bert@w3.org>
# $Id: utils.pm,v 2.3 2002-08-02 18:59:42 bbos Exp $

package utils;
require Exporter;
@ISA = qw(Exporter);
@EXPORT = qw(readfile writefile read_config $contents @stylesheet
	@styletype @chapter @resetnumber @format %lookup $chapno @relations
	@links @tonavbar $src_ext);

# @EXPORT_OK = qw(parsewords);



$contents = '';			# File containing ToC
@stylesheet = ();		# URLs of style sheets
@styletype = ();		# MIME types of style sheets
@chapter = ();			# Array of chapter files
@resetnumber = ();		# For each chapter: the chapter number - 1
@format = ();			# For each chapter: list of number formats
%lookup = ();			# Reverse index: chapter name -> number
$chapno = -1;			# Number of the chapter under consideration
@relations = ();		# Additional links
@links = ();			# Additional links (paired with @relations)
@tonavbar = ();			# Whether the link goes into the navbar
$src_ext = undef;		# Extension of source files

# Parse a string into an array of "words".
# Words are whitespace-separated sequences of non-whitespace characters,
# or quoted strings ("" or ''), with the quotes removed.
sub parsewords {
    my $line = $_[0];
    my @words = ();
    while ($line ne '') {
	if ($line =~ /^\s+/) {
	    # Skip whitespace
	} elsif ($line =~ /^\"((?:[^\"]|\\\")*)\"/) {
	    push(@words, $1);
	} elsif ($line =~ /^\'((?:[^\']|\\\')*)\'/) {
	    push(@words, $1);
	} elsif ($line =~ /^\S+/) {
	    push(@words, $&);
	} else {
	    die "Cannot happen\n";
	}
	$line = $';
    }
    return @words;
}

# Read info about book's structure from $_[0]
sub read_config {
    open(IN, $_[0]) || die "$0: cannot open file $_[0]\n";
    my $reset = 0;		# If >= 0, start chapter numbering w/ this
    my @curformat = ("1","1.1","1.1.1","1.1.1.1","1.1.1.1.1","1.1.1.1.1.1");
    while (<IN>) {
	chop;
	my @words = parsewords($_);
	if (!defined $words[0]) {next;} # Empty line
	for ($words[0]) {
	    /^\@contents$/o and do { # URL of ToC
		$contents = $words[1];
		last;
	    };
	    /^\@stylesheet$/o and do { # URL (and type) of style sheet
		push(@stylesheet, ($words[1]));
		if (defined $words[2]) {push(@styletype, ($words[2]));}
		last;
	    };
	    /^\@format$/o and do { # Set numbering style for next chapters
		@curformat = @words;
		$reset = 0;
		last;
	    };
	    /^\@restart$/o and do { # Reset the chapter number
		$reset = int($words[1]) - 1;
		next;
	    };
	    /^\@chapter$/o and do { # File with next chapter
		push(@chapter, ($words[1]));
		push(@format, ([@curformat]));
		push(@resetnumber, ($reset));
		$reset++;
		$lookup{$words[1]} = $#chapter;
		last;
	    };
	    /^\@link$/o and do {	# Additional <LINK> tags
		push(@relations, ($words[1]));
		push(@links, ($words[2]));
		push(@tonavbar, (defined $words[3] ? $words[3] : ""));
		last;
	    };
	    /^\@source-extension$/o and do { # Extension of sources
		$src_ext = $words[1];
		last;
	    };
	    /^\#/o and do {	# Comment
		last;
	    };
	    die "$0: syntax error in config file $_[0], line $.\n";
	}
    }
    close(IN);
}

# Load file into memory
sub readfile {
    open(INPUT, $_[0]) || die "$PROG: cannot open file $_[0]\n";
    local $/ = undef;
    my $buf = <INPUT>;
    close(INPUT);
    return $buf;
}

# Create a file $_[0] containing $_[1]
sub writefile {
    open(OUTPUT, ">$_[0]") || die "$PROG: cannot create file $_[0]\n";
    print OUTPUT $_[1];
    close(OUTPUT);
}

return 1;
