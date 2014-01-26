# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
#
# FIXME: New documentation needed.
#
# Use "make REMOTE=1" to use remote bikeshed

SOURCEFILE=Overview.src.html
LINKEDFILE=Overview.linked.html
OUTPUTFILE=Overview.html
EXTERNALLINKS=perl external-spec-links.pl
PREPROCESSOR=bikeshed.py
REMOTE_PREPROCESSOR_URL=https://api.csswg.org/bikeshed/

all: $(OUTPUTFILE)

%.linked.html : %.src.html
	$(EXTERNALLINKS) "$<" > "$@"

$(OUTPUTFILE): $(LINKEDFILE)
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(LINKEDFILE) > "$@"
else
	$(PREPROCESSOR) -f spec "$<" "$@"
endif

