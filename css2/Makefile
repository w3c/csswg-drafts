# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 1.38 1997-10-31 10:20:31 bbos Exp $

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
$(ROOT)/cover.src

SRCS1 = \
about.src\
intro.src\
convent.src\
syndata.src\
process.src\
selector.src\
cascade.src\
media.src\
box.src\
flowobj.src\
flowobj2.src\
page.src\
colors.src\
fonts.src\
text.src\
lists.src\
tables.src\
ui.src\
aural.src


APPSRCS = \
sample.src\
changes.src\
notes.src\
grammar.src\
fontstuff.src

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
process.html\
selector.html\
cascade.html\
media.html\
box.html\
flowobj.html\
flowobj2.html\
page.html\
colors.html\
fonts.html\
text.html\
lists.html\
tables.html\
ui.html\
aural.html

APPENDIXES= \
sample.html\
changes.html\
notes.html\
grammar.html\
fontstuff.html

REFS= \
refs.html

INDEXES= \
index.html

SPECSRCS= $(SRCS0) $(MAINSRCS) $(APPSRCS)
SPECOBJS= $(MAINOBJS) $(APPENDIXES) $(REFS)

IMAGES= images/*.gif
STYLESHEETS= style/*.css

ALLOBJS= $(SPECOBJS) $(INDEXES) $(IMAGES) $(STYLESHEETS) translations.html

PROPSRC= properties/properties.db
DESCSRC= properties/descriptors.db
PROPBLKSDIR= build/properties
DESCBLKSDIR= build/descriptors

CSSGROUPDIR = /afs/w3.org/pub/WWW/Style/Group/
#Sample install dir
#INSTALLDIR= /afs/w3.org/pub/WWW/Style/Group/9709/css2-970908
INSTALLDIR=

# dbase for property name anchors
PROPERTYDB= build/property.db
# dbase for descriptor name anchors
DESCRIPTORDB= build/descriptor.db
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
# make value anchor database
MKANCHDB= $(PERL) ./bin/mkanchdb
# make property and descriptor anchor database
MKPANCHDB= $(PERL) ./bin/mkpanchdb
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
MKSUBTOC=$(PERL) ./bin/mksubtoc
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
# extract issues from todo db.
TODO= bin/todo

# utility to generate the PostScript version
# -R seems broken for this spec.
HTML2PS= $(PERL) ./bin/html2ps -f html2psrc

# PS -> GIF tools
#PSTOPNM = ./bin/mypstopnm -r 75
PSTOPNM = ./bin/mypstopnm -r 150
#PNMTOGIF_PIPE = ppmquant 256 | ppmtogif
PNMTOGIF_PIPE = pnmscale 0.5 | pnmgamma 1.8 | ppmquant 256 | ppmtogif

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
	$(HIPP) $(INCLUDES) $< - | $(ADDHANCH) -n -ml 3 -r $< - - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

.idraw.gif:
	$(RM) $@
#	$(PSTOPNM) $< | $(PPMQUANT) | $(PPMTOGIF) >$@
	$(PSTOPNM) $< \
	  | $(PNMTOGIF_PIPE) >$@


all: blocks $(PROPERTYDB) $(DESCRIPTORDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES) \
	$(IMAGES) issues.html DOC/TODO.html

install: all css20.tgz 
	if [ -z "$(INSTALLDIR)" ]; then\
	  echo >&2;\
	  echo "*** No target directory specified" >&2;\
	  echo "*** Please use: make install INSTALLDIR=<target-dir>" >&2;\
	  exit 1;\
	fi
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css20.tgz $(INSTALLDIR)
	(cd $(INSTALLDIR); zcat css20.tgz | $(TAR) xvf -)
	(cd $(CSSGROUPDIR); rm -f issues.html; \
            $(LN) -s $(INSTALLDIR)/issues.html css2-issues.html)
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

css20.tgz: $(ALLOBJS)
	$(TAR) cf - $(ALLOBJS) | gzip >$@

css20.zip: $(ALLOBJS)
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
	$(MKPANCHDB) properties propdef - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

$(DESCRIPTORDB): $(SPECSRCS)
	@if [ ! -d build ]; then mkdir build;fi
	$(MKPANCHDB) descriptors descdef - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

$(VALUEDB): $(SPECSRCS)
	$(MKANCHDB) value-def - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

index.html: build/index.srb
build/index.srb: $(SPECOBJS)
	$(MKIDX) $@ build/index/*

cover.html: cover.src cover-info.src build/contents.srb
	$(HIPP) $(INCLUDES) $< - | \
 $(ADDNAVBAR) -bottom -hr -r $@ - $@ "go to the table of contents" "#toc" index index.html

build/contents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS) $(REFSRCS)
	$(MKTOC) -ml 5 $@ $(HEADINGDB) $(MAINSRCS) -ul -roman $(APPSRCS) \
		-ol -none $(REFSRCS) $(INDEXSRCS) 
	$(ADDLINKS) -r $< $(HEADINGDB) $(HEADINGDB) propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) 
	$(ADDLINKS) -r $< $@ $@ propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) 
$(HEADINGDB): build/contents.srb

# special rule with different numbering
sample.html: sample.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
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
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
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
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
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
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
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
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

# simpler rules for special pages

index.html: index.src
	$(HIPP) $(INCLUDES) $< - | \
	$(ADDNAVBAR) -r $@ - $@ contents "cover.html#toc" 

issues.html: issues.src build/issues.srb
	$(HIPP) $(INCLUDES) issues.src $@

build/issues.srb: issues.db
	$(ISSUES) -g >$@

DOC/TODO.html: DOC/TODO.src build/todo.srb
	$(HIPP) $(INCLUDES) DOC/TODO.src $@

build/todo.srb: DOC/todo.db
	$(TODO) -g >$@

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
