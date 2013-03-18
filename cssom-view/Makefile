
ANOLIS		= anolis
NODE		= node

SPECSTOP	= ..
GENDIR		= $(SPECSTOP)/cssom
IDLGEN		= $(GENDIR)/cssom-generate-json.js
SPECGEN		= $(GENDIR)/cssom-generate.js
SPECSRC		= cssom-view-source

IDLDRIVER	= cssom-view.idl
IDLFRAGS	= idl/CaretPosition.idl \
		  idl/ClientRect.idl \
		  idl/ClientRectList.idl \
		  idl/Document.idl \
		  idl/Element.idl \
		  idl/HTMLElement.idl \
		  idl/MediaQueryList.idl \
		  idl/MediaQueryListListener.idl \
		  idl/MouseEvent.idl \
		  idl/Range.idl \
		  idl/Screen.idl \
		  idl/Window.idl
JSONFILE	= cssom-view.json
XREFS		= data/xrefs/css/cssom-view.json
EDFILE		= Overview.html
TRFILE		= TR/Overview.html

all: $(EDFILE)

$(JSONFILE): $(IDLDRIVER) $(IDLFRAGS) $(IDLGEN)
	gcc -E -x c -P -Iidl -C $(IDLDRIVER) | node $(IDLGEN) > $@

Overview.src.html: $(SPECGEN) $(JSONFILE) $(SPECSRC)
	$(NODE) $(SPECGEN) $(JSONFILE) $(SPECSRC) > $@

$(XREFS): Overview.src.html Makefile
	$(ANOLIS) --dump-xrefs=$@ $< /tmp/spec; $(RM) /tmp/spec

$(EDFILE): Overview.src.html $(XREFS) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom-view" \
	--force-html4-id --filter=".publish" --split-references-section $< $@

draft: $(EDFILE)

$(TRFILE): Overview.src.html $(XREFS) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values \
	--w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom-view" \
	--force-html4-id --filter=".dontpublish" --pubdate="$(PUBDATE)" --split-references-section \
        --w3c-status=WD $< $@

publish: $(TRFILE)

clean::
	$(RM) Overview.src.html
	$(RM) $(JSONFILE)

cleanall:: clean
	$(RM) $(EDFILE)
	echo '{ "definitions": {}, "url": "http://dvcs.w3.org/hg/csswg/raw-file/tip/cssom-view/Overview.html#" }' > $(XREFS)


