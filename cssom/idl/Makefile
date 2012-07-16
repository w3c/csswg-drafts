
IDLDRIVER	= cssom.idl
IDLFRAGS	= CSSFontFaceRule.idl \
		  CSSImportRule.idl \
		  CSSMediaRule.idl \
		  CSSNamespaceRule.idl \
		  CSSPageRule.idl \
		  CSSRule.idl \
		  CSSRuleList.idl \
		  CSSStyleDeclaration.idl \
		  CSSStyleRule.idl \
		  CSSStyleSheet.idl \
		  Document.idl \
		  ElementCSSInlineStyle.idl \
		  LinkStyle.idl \
		  MediaList.idl \
		  ProcessingInstruction.idl \
		  StyleSheet.idl \
		  StyleSheetList.idl \
		  Window.idl
JSONFILE	= cssom.json

all: $(JSONFILE)

$(JSONFILE): $(IDLDRIVER) $(IDLFRAGS)
	gcc -E -x c -P -C $< | node cssom.js > $@

clean::
	$(RM) $(JSONFILE)
