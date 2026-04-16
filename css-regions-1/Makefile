# Use this command with local bikeshed:
# bikeshed spec Overview.bs Overview.html

# spec-generator can be used, but sending only Overview.bs will lose img width/height generation
# curl https://www.w3.org/publications/spec-generator/ -F type=bikeshed-spec -F file=@Overview.bs > Overview.html

target ?= Overview

%.html: %.bs
	curl -s -L -F file=@$< -F md-date=$(cdate) -F output=html \
	-F type=bikeshed-spec $(opts) -o $@ https://www.w3.org/publications/spec-generator/
%.err: %.bs
	curl -s -L -F file=@$< -F md-date=$(cdate) -F output=messages \
	-F type=bikeshed-spec $(opts) https://www.w3.org/publications/spec-generator/ >$@

all: check Overview.html

check: $(target).err
	@cat $<
	@if fgrep -q '"messageType":"success"' $<;\
	 then true; else false; fi

clean:
	rm -f $(target).html $(target).err
