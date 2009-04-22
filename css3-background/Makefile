# Calling the post-processor with file-upload. Assumes the username
# and password are in ~/.curl-w3.org
#
# To set a date other than today, use: make cdate=YYYYMMDD
#
# Possible other options:
# -F ids=on

cdate = $(shell date +%Y%m%d)

%.html: %.src.html
	@echo "Calling post-processor to generate $@..."
	@curl -F file=@$< -F group=CSS -F output=html -F method=file -s \
	-F date=$(cdate) \
	-K ~/.curl-w3.org http://cgi.w3.org/member-bin/process.cgi >$@
%.err: %.src.html
	@echo "Calling post-processor to check $<..."
	@curl -F file=@$< -F group=CSS -F output=err -F method=file -s \
	-F date=$(cdate) \
	-K ~/.curl-w3.org http://cgi.w3.org/member-bin/process.cgi >$@



all: check Overview.html
	@echo Done.

check: Overview.err
	@cat $<
	@grep -q '^No errors$$' $< # Force a non-zero exit code if errors



# A handy shortcut:

commit: update clean all
	cvs commit -m 'Generated. Do not edit!' Overview.html

update:
	cvs update

clean:
	rm Overview.html



.PHONY: check commit update clean
