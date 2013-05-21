ANOLIS		= anolis
SPECSTOP	= ..
GENDIR		= $(SPECSTOP)/cssom
XREF  = data
XREFS		= $(XREF)/xrefs/css/cssom-values.json
EDFILE		= Overview.html
TRFILE		= TR/Overview.html

all: $(EDFILE) $(XREFS)

$(XREFS): Overview.src.html Makefile
	$(ANOLIS) --dump-xrefs=$@ $< /tmp/spec; $(RM) /tmp/spec

$(EDFILE): Overview.src.html $(XREF) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom-values" \
	--force-html4-id --filter=".publish" $< $@

draft: $(EDFILE)

$(TRFILE): Overview.src.html $(XREF) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom-values" \
	--force-html4-id --filter=".dontpublish" --pubdate="$(PUBDATE)" \
 --w3c-status=WD $< $@

publish: $(TRFILE)
