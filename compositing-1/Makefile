# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
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

SOURCEFILE=Compositing.src.html
OUTPUTFILE=index.html
PROCESSCGI=https://www.w3.org/Style/Group/process.cgi
CURL=curl
CURLFLAGS=

# if you want to set a publication date other than today's date,
# invoke make like this: "make PUBDATE=2008-03-19"
PUBMSG=
PUBDATE=
USER=
STATUS="CR"

W3C_CSS_DIR=~/work/W3C/cvs/dev.w3.org/csswg/compositing

all: $(OUTPUTFILE) 

$(OUTPUTFILE): $(SOURCEFILE)
ifeq (,$(PUBDATE))
	$(CURL) $(CURLFLAGS) -K ~/.curl-w3.org -F file="@$<" -o "$@" -F group=FX -F output=html -F method=file $(PROCESSCGI) -F status=$(STATUS)
else
	$(CURL) $(CURLFLAGS) -K ~/.curl-w3.org -F file="@$<" -o "$@" -F group=FX -F output=html -F method=file $(PROCESSCGI)  -F status=$(STATUS) -F date=$(PUBDATE)
endif

publish:
ifeq (,$(PUBMSG)) 
		@echo "Invoke command with a commit message for publication: e.g., make USER=<user-name> PUBMSG=<msg>"
else
		$(shell cd $(W3C_CSS_DIR); cvs edit *.html; cvs edit images/*.*;)
		cp 	*.html $(W3C_CSS_DIR)/.
		cp ./images/*.* $(W3C_CSS_DIR)/images/.
    	$(shell cd $(W3C_CSS_DIR); cvs commit -m "$(PUBMSG)";)
endif
	

