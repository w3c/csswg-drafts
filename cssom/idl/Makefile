
IDLDRIVER	= cssom.idl
IDLFRAGS	= cssfontfacerule.idl \
		  cssimportrule.idl \
		  cssmediarule.idl \
		  cssnamespacerule.idl \
		  cssom.idl \
		  csspagerule.idl \
		  cssrule.idl \
		  cssrulelist.idl \
		  cssstyledeclaration.idl \
		  cssstylerule.idl \
		  cssstylesheet.idl \
		  document.idl \
		  elementcssinlinestyle.idl \
		  linkstyle.idl \
		  medialist.idl \
		  processinginstruction.idl \
		  stylesheet.idl \
		  stylesheetlist.idl \
		  window.idl
JSONFILE	= cssom.json

all: $(JSONFILE)

$(JSONFILE): $(IDLDRIVER) $(IDLFRAGS)
	gcc -E -x c -P -C $< | node cssom.js > $@

clean::
	$(RM) $(JSONFILE)
