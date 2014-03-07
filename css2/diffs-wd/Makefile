%.html: ../%.html $(PREV)/%.html
	-$(HTMLDIFF) $(PREV)/$@ ../$@ | perl -p -0777 \
	 -e 's/<\/del>([ \t\n]*)<del>/$$1/g;' \
	 -e 's/<\/ins>([ \t\n]*)<ins>/$$1/g;' >$@

$(PREV)/%.html:
	touch $@
