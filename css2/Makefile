# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 1.26 1997-09-22 16:13:18 ian Exp $

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
$(ROOT)/cover.src

# $(ROOT)/cover-short.src

SRCS1 = \
about.src\
intro.src\
convent.src\
syndata.src\
selector.src\
cascade.src\
media.src\
flowobj.src\
flowobj2.src\
colors.src\
fonts.src\
text.src\
lists.src\
tables.src\
ui.src\
aural.src\
print.src

APPSRCS = \
sample.src\
changes.src\
notes.src\
grammar.src

REFSRCS = \
refs.src

INDEXSRCS= \
index.src

MAINSRCS = $(SRCS1)

MAINOBJS = \
cover.html\
about.html\
intro.html\
convent.html\
syndata.html\
selector.html\
cascade.html\
media.html\
flowobj.html\
flowobj2.html\
colors.html\
fonts.html\
text.html\
lists.html\
tables.html\
ui.html\
aural.html\
print.html

APPENDIXES= \
sample.html\
changes.html\
notes.html\
grammar.html

REFS= \
refs.html

INDEXES= \
index.html

SPECSRCS= $(SRCS0) $(MAINSRCS) $(APPSRCS)
SPECOBJS= $(MAINOBJS) cover-short.html $(APPENDIXES)

IMAGES= images/*.gif
STYLESHEETS= style/*.css

ALLOBJS= $(SPECOBJS) $(INDEXES) $(IMAGES) $(STYLESHEETS) translations.html

PROPSRC= properties/properties.db
DESCSRC= properties/descriptors.db
PROPBLKSDIR= build/properties
DESCBLKSDIR= build/descriptors

#Sample install dir
#INSTALLDIR= /afs/w3.org/pub/WWW/Style/Group/9709/css2-970908
INSTALLDIR=

# dbase for property name anchors
PROPERTYDB= build/property.db
# dbase for value types
VALUEDB= build/value.db
# dbase for heading dbase
HEADINGDB= build/headings.db

PERL= perl5
NSGMLS=nsgmls

# HTML include preprocessor (for includes)
HIPP= $(PERL) ./bin/hipp
# make depend utility for CSS source documents
HMKDEPEND= $(PERL) ./bin/hmkdep
# make property anchor database
MKANCHDB= $(PERL) ./bin/mkanchdb
# add heading anchors
ADDHANCH= $(PERL) ./bin/addhanch
# add index anchors and generate related index database
ADDIDXANCH= $(PERL) ./bin/addianch
# add navigation bars
ADDNAVBAR= $(PERL) ./bin/addnavbar
# make CSS Index
MKIDX= $(PERL) ./bin/mkidx
# make table of contents and heading database
MKTOC= $(PERL) ./bin/mktoc
# HTML concate utility
HTMLCAT= $(PERL) ./bin/htmlcat
# trim utility to get rid of navbar sections
HTMLTRIM= $(PERL) ./bin/htmltrim
# make sub table of contents
MKSUBTOC= $(PERL) ./bin/mksubtoc
# insert subtoc
INSAFTER= $(PERL) ./bin/insafter
# add link
ADDLINKS= $(PERL) ./bin/addlinks
# extract properties from db.
PEXTR= $(PERL) ./bin/pextr
# extract descriptors from db.
DEXTR= $(PERL) ./bin/dextr
# extract issues from issues db.
ISSUES= bin/issues

# utility to generate the PostScript version
# -R seems broken for this spec.
HTML2PS= $(PERL) ./bin/html2ps -f html2psrc

# PS -> GIF tools
PSTOPNM = ./bin/mypstopnm -r 75
PPMQUANT = ppmquant 256
PPMTOGIF = ppmtogif -trans rgb:ffff/ffff/ffff

# include paths
INCLUDES= -Ibuild -I.

RM= rm -fr
CP= cp
TAR= tar
ZIP= zip
LN= ln

.SUFFIXES: .src .html .srb .idraw .gif

.src.html:
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(HIPP) $(INCLUDES) $< - | $(ADDHANCH) -n -ml 4 -r $< - - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

.idraw.gif:
	$(RM) $@
	$(PSTOPNM) $< | $(PPMQUANT) | $(PPMTOGIF) >$@


all: blocks $(PROPERTYDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES) \
	$(IMAGES) issues.html

install: all css20.tgz 
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css20.tgz $(INSTALLDIR)
	(cd $(INSTALLDIR); $(TAR) xvzf css20.tgz)
	$(CP) Overview.html html2psrc $(INSTALLDIR)

install-all: install css20.zip css20.ps css20.txt
	$(CP) css20.zip css20.ps css20.txt $(INSTALLDIR)

#### Special section to build PS file and single plain text file

css20.ps ps: all
	$(HTML2PS) $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES) > $@

css20.html html: all
	$(HTMLCAT) - $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES) | \
	$(HTMLTRIM) div navbar - $@

# the following requires to be on unix and have Netscape running...
css20.txt txt: css20.html
	$(RM) css20.txt; \
        netscape -remote "openFile(`pwd`/css20.html)" -remote "saveAs(`pwd`/css20.txt,Text)"

####

css20.tgz: all
	$(TAR) czf $@ $(ALLOBJS)

css20.zip: all
	$(ZIP) $@ $(ALLOBJS)

#### Section generate property/descriptor tables from property database.

blocks: $(PROPBLKSDIR)/blocks.ok $(DESCBLKSDIR)/blocks.ok

$(PROPBLKSDIR)/blocks.ok: $(PROPSRC)
	@if [ ! -d $(PROPBLKSDIR) ]; then mkdir -p $(PROPBLKSDIR);fi
	$(PEXTR) $(PROPSRC) $(PROPBLKSDIR)
	touch $@

$(DESCBLKSDIR)/blocks.ok: $(DESCSRC)
	@if [ ! -d $(DESCBLKSDIR) ]; then mkdir -p $(DESCBLKSDIR);fi
	$(DEXTR) $(DESCSRC) $(DESCBLKSDIR)
	touch $@

$(PROPERTYDB): $(SPECSRCS)
	@if [ ! -d build ]; then mkdir build;fi
	$(MKANCHDB) propdef - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

$(VALUEDB): $(SPECSRCS)
	$(MKANCHDB) value-def - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

index.html: build/index.srb
build/index.srb: $(SPECOBJS)
	$(MKIDX) $@ build/index/*

cover.html: cover.src cover-info.src build/contents.srb
	$(HIPP) $(INCLUDES) $< - | \
 $(ADDNAVBAR) -bottom -hr -r $@ - $@ "go to the table of contents" "#toc"

cover-short.html: cover-short.src cover-info.src build/contents-short.srb
	$(HIPP) $(INCLUDES) $< - | \
 $(ADDNAVBAR) -bottom -hr -r $@ - $@ "go to the table of contents" "#toc"

build/contents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS) $(REFSRCS)
	$(MKTOC) -ml 5 $@ $(HEADINGDB) $(MAINSRCS) -ul -roman $(APPSRCS) \
		-ol -none $(REFSRCS) $(INDEXSRCS) 
$(HEADINGDB): build/contents.srb

build/contents-short.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS) $(REFSRCS)
	$(MKTOC) -ml 3 $@ $(HEADINGDB) $(MAINSRCS) -ul -roman $(APPSRCS) \
		-ol -none $(REFSRCS) $(INDEXSRCS) 

# special rule with different numbering
sample.html: sample.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

changes.html: changes.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

notes.html: notes.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

grammar.html: grammar.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

refs.html: refs.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

# simpler rules for special pages

index.html: index.src
	$(HIPP) $(INCLUDES) $< - | \
	$(ADDNAVBAR) -r $@ - $@ contents "cover.html#toc" 

issues.html: issues.src issues.srb
	$(HIPP) $(INCLUDES) issues.src $@

issues.srb: issues.db
	$(ISSUES) -g >$@

### check on the document to see if it's valid

check: all
	@for i in $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES) ; \
	do echo checking $$i...; $(NSGMLS) -s -c sgml/HTML4.cat $$i; done; \
	echo checking done.

# get cvs logs

FROMDATE=1 week ago
log:
	@for i in `cat DOC/FILES` ; \
	do cvs log -d ">$(FROMDATE)" $$i >/tmp/log; \
	   grep "selected revisions: 0" /tmp/log >/dev/null || cat /tmp/log; \
	done; rm /tmp/log

clean:
	$(RM) $(SPECOBJS) $(SPECIALOBJS) $(INDEXES) $(PROPBLKSDIR)/* \
        $(DESCBLKSDIR)/* build/* css20.*

realclean: clean

depend:
	$(HMKDEPEND) $(SPECOBJS) $(SPECIALOBJS) 

##### The following is automatically generated. Do not edit!! ####
