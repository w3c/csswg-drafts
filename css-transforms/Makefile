# $Id: Makefile,v 1.5 2008/02/06 14:05:15 mike Exp $
#
# Use "make REMOTE=1" to use remote bikeshed
# Use "make issues REMOTE=1" to update issues with remote bikeshed

SOURCEFILE=Overview.bs
LINKEDFILE=Overview.linked.html
OUTPUTFILE=Overview.html

ISSUESOUTPUT=issues-wd-2013.html
ISSUESINPUT=issues-wd-2013.txt

EXTERNALLINKS=perl external-spec-links.pl
PREPROCESSOR=bikeshed.py
REMOTE_PREPROCESSOR_URL=https://api.csswg.org/bikeshed/

all: $(OUTPUTFILE)

$(LINKEDFILE) : $(SOURCEFILE)
	$(EXTERNALLINKS) "$<" > "$@"

$(OUTPUTFILE): $(LINKEDFILE)
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(LINKEDFILE) > "$@"
else
	$(PREPROCESSOR) -f spec "$<" "$@"
endif

issues: $(ISSUESOUTPUT)
$(ISSUESOUTPUT) : $(ISSUESINPUT)
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(ISSUESINPUT) -F input=issues > "$@"
else
	$(PREPROCESSOR) -f issues "$<" "$@"
endif
