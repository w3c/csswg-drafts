# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
#
# FIXME: New documentation needed.
#
	
SOURCEFILE=Overview.src.html
LINKEDFILE=.Overview.linked.html
OUTPUTFILE=Overview.html
EXTERNALLINKS=perl external-spec-links.pl
PREPROCESSOR=bikeshed.py

all: $(OUTPUTFILE)

.%.linked.html : %.src.html
	$(EXTERNALLINKS) "$<" > "$@"

$(OUTPUTFILE): $(LINKEDFILE)
	$(PREPROCESSOR) -f spec "$<" "$@"


