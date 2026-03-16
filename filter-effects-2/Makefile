# Use "make REMOTE=1" to use remote bikeshed
# (note that relying on remote will lose image width/height generation)

SOURCEFILE=Overview.bs
OUTPUTFILE=Overview.html
PREPROCESSOR=bikeshed.py
REMOTE_PREPROCESSOR_URL=https://www.w3.org/publications/spec-generator/

all: $(OUTPUTFILE)

$(OUTPUTFILE): $(SOURCEFILE)
ifneq (,$(REMOTE))
	curl $(REMOTE_PREPROCESSOR_URL) -F file=@$(SOURCEFILE) -F type=bikeshed-spec > "$@"
else
	$(PREPROCESSOR) -f spec "$<" "$@"
endif

