# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
#
# FIXME: New documentation needed.
#
# Use "make REMOTE=1" to use remote bikeshed

SOURCEFILE=Overview.bs
OUTPUTFILE=Overview.html
PREPROCESSOR=bikeshed
REMOTE_PREPROCESSOR_URL=https://www.w3.org/publications/spec-generator/

all: $(OUTPUTFILE)

$(OUTPUTFILE): $(SOURCEFILE)
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(SOURCEFILE) -F type=bikeshed-spec > "$@"
else
	$(PREPROCESSOR) -f spec "$<" "$@"
endif
