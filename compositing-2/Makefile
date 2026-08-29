# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
#
# FIXME: New documentation needed.
#
	
SOURCEFILE=Overview.bs
OUTPUTFILE=Overview.html
PREPROCESSOR=bikeshed.py

all: $(OUTPUTFILE)

$(OUTPUTFILE): $(SOURCEFILE)
	$(PREPROCESSOR) -f spec "$<"


