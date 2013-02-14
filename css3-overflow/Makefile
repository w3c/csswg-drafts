# Calling the post-processor with file-upload. Assumes the username
# and password are in ~/.curl-w3.org (user = USER:PASS)
#
# To set a date other than today, use: make cdate=YYYYMMDD
#
# To set the status, modify one of the "this version" URLs:
# http://www.w3.org/TR/[YEAR]/CR-[SHORTNAME]-[CDATE]/
# Or set that URL to [VERSION] and call Make as: make status=CR
#
#
# Possible other options to add to the curl command below:
# -F ids=on

cdate = $(shell date +%Y%m%d)
status = ED

%.html: %.src.html
	@echo "Calling post-processor to generate $@..."
	@curl -F file=@$< -F group=CSS -F output=html -F method=file -s \
	-F date=$(cdate) -F status=$(status) \
	-K ~/.curl-w3.org https://www.w3.org/Style/Group/process.cgi >$@
%.err: %.src.html
	@echo "Calling post-processor to check $<..."
	@curl -F file=@$< -F group=CSS -F output=err -F method=file -s \
	-F date=$(cdate) -F status=$(status) \
	-K ~/.curl-w3.org https://www.w3.org/Style/Group/process.cgi >$@



all: check Overview.html
	@echo Done.

check: Overview.err
	@cat $<
	@grep -q '^No errors$$' $< # Force a non-zero exit code if errors



# A handy shortcut:

clean:
	rm Overview.html



.PHONY: check clean
