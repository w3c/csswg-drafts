ANOLIS		= anolis
SED  = sed
CURL  = curl
SPECSTOP	= ..
GENDIR		= $(SPECSTOP)/cssom
XREF  = data
XREFS		= $(XREF)/xrefs/css/cssom.json
SRCFILE  = Overview.src.html
VNUFILE  = Overview.src.vnu.html
EDFILE		= Overview.html
TRFILE		= TR/Overview.html

all: $(EDFILE) $(XREFS)

$(XREFS): Overview.src.html Makefile
	$(ANOLIS) --dump-xrefs=$@ $< /tmp/spec; $(RM) /tmp/spec

$(EDFILE): Overview.src.html $(XREF) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values --use-strict \
	--w3c-compat-substitutions --w3c-compat-xref-a-placement --w3c-compat-class-toc --enable=xspecxref --enable=refs --w3c-shortname="cssom" \
	--filter=".publish" $< $@; \
 $(SED) 's/\[/\(/g;s/\]/\)/g' <$(SRCFILE) >$(VNUFILE); \
 $(CURL) -F out=gnu -F content=@$(VNUFILE) https://html5.validator.nu/; \
 $(RM) $(VNUFILE); \
 $(CURL) 'http://www.w3.org/2009/07/webidl-check?doc=http%3A%2F%2Fdev.w3.org%2Fcsswg%2Fcssom%2F&output=text'
 #$(CURL) -F output=text -F input=@$(SRCFILE) http://www.w3.org/2009/07/webidl-check

draft: $(EDFILE)

$(TRFILE): Overview.src.html $(XREF) Makefile
	$(ANOLIS) --output-encoding=utf-8 --omit-optional-tags --quote-attr-values --use-strict \
	--w3c-compat-substitutions --w3c-compat-xref-a-placement --w3c-compat-class-toc --enable=xspecxref --enable=refs --w3c-shortname="cssom" \
	--filter=".dontpublish" --pubdate="$(PUBDATE)" \
 --w3c-status=WD $< $@

publish: $(TRFILE)
