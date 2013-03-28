# $Id$
#
#   http://dev.w3.org/buildtools/css3-module-postprocessor/Makefile
#
# This is a makefile for generating output using the CSS3 module
# postprocessor. Details about that are here:
#
#   http://www.w3.org/Style/Group/css3-src/bin/postprocess
#
# To use this makefile, you need to have the "make" and "curl"
# programs installed. If you are running a Windows/MS-DOS system,
# you can download the "make" and "curl" programs from here:
#
#   http://gnuwin32.sourceforge.net/downlinks/make.php
#   http://curl.haxx.se/dlwiz/?type=bin&os=Win32&flav=-&ver=2000/XP
#
# You also need to install either a .curlrc (*NIX/*BSD) or _curlrc
# (MS-DOS ) file in your HOME directory, with at minimum the
# following contents:
#
#   user = foo:bar
#
# ...where "foo" and "bar" are your W3C username and password.

SOURCEFILE=Overview.src.html
OUTPUTFILE=Overview.html
PROCESSCGI=https://www.w3.org/Style/Group/process.cgi
CURL=curl
CURLFLAGS=

# if you want to set a publication date other than today's date,
# invoke make like this: "make PUBDATE=2008-03-19"
PUBMSG=
PUBDATE=
USER=

W3C_CSS_DIR=~/work/W3C/cvs/dev.w3.org/csswg/css3-page-template

all: $(OUTPUTFILE) 

$(OUTPUTFILE): $(SOURCEFILE)
ifeq (,$(PUBDATE))
	$(CURL) $(CURLFLAGS) --user $(USER) -F file="@$<" -o "$@" -F group=CSS -F output=html -F method=file $(PROCESSCGI)
else
	$(CURL) $(CURLFLAGS) --user $(USER) -F file="@$<" -o "$@" -F group=CSS -F output=html -F method=file $(PROCESSCGI) -F date=$(PUBDATE)
endif


	

