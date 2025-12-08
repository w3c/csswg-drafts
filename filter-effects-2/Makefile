# Use "make REMOTE=1" to use remote bikeshed

SOURCEFILE=Overview.bs
OUTPUTFILE=Overview.html
PREPROCESSOR=bikeshed.py
REMOTE_PREPROCESSOR_URL=https://api.csswg.org/bikeshed/

all: $(OUTPUTFILE)

$(OUTPUTFILE): $(SOURCEFILE)
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(SOURCEFILE) > "$@"
else
	$(PREPROCESSOR) -f spec "$<" "$@"
endif

