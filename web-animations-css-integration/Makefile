# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
#
# FIXME: New documentation needed.
#
# Use "make REMOTE=1" to use remote bikeshed

SOURCEFILE=Overview.src.html
OUTPUTFILE=Overview.html
PREPROCESSOR=bikeshed.py
REMOTE_PREPROCESSOR_URL=https://www.w3.org/publications/spec-generator/

all: $(OUTPUTFILE)

$(OUTPUTFILE): $(SOURCEFILE) Makefile
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(SOURCEFILE) -F output=messages -F type=bikeshed-spec
	@echo
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(SOURCEFILE) -F type=bikeshed-spec > "$@"
else
	$(PREPROCESSOR) -f spec "$<" "$@"
endif

