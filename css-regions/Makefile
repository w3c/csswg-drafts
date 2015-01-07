# use this command line now, or a local bikeshed

# curl http://api.csswg.org/bikeshed/ -F file=@Overview.src.html > Overview.html

%.html: %.src.html
	curl -s -L -F file=@$< -F time=$(cdate) -F output=html \
	-F paragraph=$(markup) $(opts) -o $@ http://api.csswg.org/bikeshed/
%.err: %.src.html
	curl -s -L -F file=@$< -F time=$(cdate) -F output=err \
	-F paragraph=$(markup) $(opts) http://api.csswg.org/bikeshed/ >$@

all: check Overview.html

check: Overview.err
	@if test -s $<; then false; else true; fi
	@cat $<
