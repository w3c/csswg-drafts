%.html: ../%.html $(PREV)/%.html
	-$(HTMLDIFF) $(PREV)/$@ ../$@ >$@

$(PREV)/%.html:
	touch $@
