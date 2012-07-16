
ANOLIS = anolis
PYTHON = python
NODE = node

XREFS  = data/xrefs/css/cssom.json
EDFILE = Overview.html
TRFILE = TR/Overview.html

all: $(EDFILE)

Overview.src.html: cssom-generate.js idl/cssom.json cssom-source
	$(NODE) cssom-generate.js > $@

$(XREFS): Overview.src.html Makefile
	$(ANOLIS) --dump-xrefs=$@ $< /tmp/spec; $(RM) /tmp/spec

$(EDFILE): Overview.src.html $(XREFS) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom" \
	--force-html4-id --filter=".publish" $< $@

draft: $(EDFILE)

$(TRFILE): Overview.src.html $(XREFS) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom" \
	--force-html4-id --filter=".dontpublish" --pubdate="$(PUBDATE)" --w3c-status=WD $< $@

publish: $(TRFILE)

clean::
	$(RM) $(EDFILE)
	$(RM) Overview.src.html
	echo '{ "definitions": {}, "url": "http://dvcs.w3.org/hg/csswg/raw-file/tip/cssom/Overview.html#" }' > $(XREFS)


