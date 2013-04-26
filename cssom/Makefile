
ANOLIS		= anolis
NODE		= node

SPECSTOP	= ..
GENDIR		= $(SPECSTOP)/cssom
IDLGEN		= $(GENDIR)/cssom-generate-json.js
SPECGEN		= $(GENDIR)/cssom-generate.js
SPECSRC		= cssom-source

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

$(JSONFILE): $(IDLDRIVER) $(IDLFRAGS) $(IDLGEN)
	gcc -E -x c -P -Iidl -C $(IDLDRIVER) | node $(IDLGEN) > $@

Overview.src.html: $(SPECGEN) $(JSONFILE) $(SPECSRC)
	$(NODE) $(SPECGEN) $(JSONFILE) $(SPECSRC) > $@

$(XREFS): Overview.src.html Makefile
	$(ANOLIS) --allow-duplicate-dfns --dump-xrefs=$@ $< /tmp/spec; $(RM) /tmp/spec

$(EDFILE): Overview.src.html $(XREFS) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom" \
	--force-html4-id --filter=".publish" --split-references-section --allow-duplicate-dfns $< $@

draft: $(EDFILE)

$(TRFILE): Overview.src.html $(XREFS) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom" \
	--force-html4-id --filter=".dontpublish" --pubdate="$(PUBDATE)" --split-references-section \
        --w3c-status=WD --allow-duplicate-dfns $< $@

publish: $(TRFILE)

clean::
	$(RM) Overview.src.html
	$(RM) $(JSONFILE)

cleanall:: clean
	$(RM) $(EDFILE)
	echo '{ "definitions": {}, "url": "http://dvcs.w3.org/hg/csswg/raw-file/tip/cssom/Overview.html#" }' > $(XREFS)


