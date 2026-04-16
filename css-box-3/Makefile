# Calling the post-processor with file-upload. Assumes the username
# and password are in ~/.curl-w3.org (user = USER:PASS)
#
# To set a date other than today, use: make date=YYYY-MM-DD
#
# "cdate" is an alias for "date": "make cdate=YYYY-MM-DD" works, too.
#
# To set the status, modify one of the "this version" URLs:
# http://www.w3.org/TR/[YEAR]/CR-[SHORTNAME]-[CDATE]/
# Or set that URL to [VERSION] and call Make as: make status=CR
#
# Additional options may be specified via opts, e.g.:
# make opts='-F md-prepare-for-tr=yes'

date ?=
status ?= ED
group ?= CSS
opts ?=
target ?= Overview
cdate ?= $(date)


# %.html: %.src.html
# 	@echo "Calling post-processor to generate $@..."
# 	@curl -K ~/.curl-w3.org -s -S -F output=html -F file=@$< \
# 	-F group=$(group) -F method=file -F date=$(cdate) -F status=$(status) \
# 	$(opts) -o $@ https://www.w3.org/Style/Group/process.cgi
# %.err: %.src.html
# 	@echo "Calling post-processor to check $<..."
# 	@curl -K ~/.curl-w3.org -s -S -F output=err -F file=@$< \
# 	-F group=$(group) -F method=file -F date=$(cdate) -F status=$(status) \
# 	$(opts) -o $@ https://www.w3.org/Style/Group/process.cgi
%.html: %.bs
	@echo "- Calling Bikeshed to generate $@..."
	@curl -o $@ -s -L -F file=@$< -F md-date=$(cdate) -F md-status=$(status) \
	 -F type=bikeshed-spec -F output=html $(opts) https://www.w3.org/publications/spec-generator/
%.err: %.bs
	@echo "- Calling Bikeshed to check $<..."
	@rm -f $@
	@touch $@
	@curl -o $@ -s -L -F file=@$< -F md-date=$(cdate) -F md-status=$(status) \
	  -F type=bikeshed-spec -F output=messages $(opts) https://www.w3.org/publications/spec-generator/

# For Dispositions of Comments in css3-background:
%.html: %.txt; awk -f issues-txt-to-html.awk $< >$@

# Rule to create PNG from FIG
%.png: %.fig; fig2dev -L png -m 0.8 -S 4 $< $@

# Rule to create EPS from FIG
%.eps: %.fig; fig2dev -m 0.8 -L eps -F -c $< $@

# Rule to create PNG from EPS
%.png: %.eps; convert -density 96x96 $< $@


all: check $(target).html

# fgrep will exit with a zero exit code if there is anything left
check: $(target).err
	@cat $<
	@echo
	@if fgrep -q '"messageType":"success"' $<;\
	 then true; else false; fi


# A handy shortcut:

commit: update all
	hg commit -m 'Generated. Do not edit!' $(target).html || true
	hg push

update:
	hg pull
	hg update

clean:
	rm -f $(target).html $(target).err



.PHONY: check commit update clean
.DELETE_ON_ERROR:
.PRECIOUS: %.png
