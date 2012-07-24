
ANOLIS		= anolis
NODE		= node

IDLDRIVER	= cssom.idl
IDLFRAGS	= idl/CSSFontFaceRule.idl \
		  idl/CSSImportRule.idl \
		  idl/CSSMediaRule.idl \
		  idl/CSSNamespaceRule.idl \
		  idl/CSSPageRule.idl \
		  idl/CSSRule.idl \
		  idl/CSSRuleList.idl \
		  idl/CSSStyleDeclaration.idl \
		  idl/CSSStyleRule.idl \
		  idl/CSSStyleSheet.idl \
		  idl/Document.idl \
		  idl/ElementCSSInlineStyle.idl \
		  idl/LinkStyle.idl \
		  idl/MediaList.idl \
		  idl/ProcessingInstruction.idl \
		  idl/StyleSheet.idl \
		  idl/StyleSheetList.idl \
		  idl/Window.idl
JSONFILE	= cssom.json
XREFS		= data/xrefs/css/cssom.json
EDFILE		= Overview.html
TRFILE		= TR/Overview.html

all: $(EDFILE)

$(JSONFILE): cssom-generate-json.js $(IDLDRIVER) $(IDLFRAGS)
	gcc -E -x c -P -Iidl -C $(IDLDRIVER) | node cssom-generate-json.js > $@

Overview.src.html: cssom-generate.js $(JSONFILE) cssom-source
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
	$(RM) $(JSONFILE)
	echo '{ "definitions": {}, "url": "http://dvcs.w3.org/hg/csswg/raw-file/tip/cssom/Overview.html#" }' > $(XREFS)


