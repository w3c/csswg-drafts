# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 1.45 1997-11-24 04:13:55 ian Exp $

# what needs to be set for every new release:
THIS_VERSION= http://www.w3.org/Style/Group/9711/WD-css2-971128
THE_PREVIOUS_VERSION= http://www.w3.org/TR/WD-CSS2/
THE_LATEST_VERSION= http://www.w3.org/Style/Group/9711/WD-css2-971128
THE_DATE= 28-Nov-1997
THE_ID= WD-CSS20-971128
INSTALLDIR= /afs/w3.org/pub/WWW/Style/Group/9711/WD-css2-971128
CSSGROUPDIR = /afs/w3.org/pub/WWW/Style/Group/

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
indexlist.src

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
indexlist.html

SPECSRCS= $(SRCS0) $(MAINSRCS) $(APPSRCS)
SPECOBJS= $(MAINOBJS) $(APPENDIXES) $(REFS)

IMAGES = images/*.gif  
STYLESHEETS= style/*.css

ALLOBJS= $(SPECOBJS) $(INDEXES) $(IMAGES) $(STYLESHEETS) translations.html

PROPSRC= properties/properties.db
DESCSRC= properties/descriptors.db
PROPBLKSDIR= build/properties
DESCBLKSDIR= build/descriptors

# dbase for property name anchors
PROPERTYDB= build/property.db
# dbase for descriptor name anchors
DESCRIPTORDB= build/descriptor.db
# dbase for value types
VALUEDB= build/value.db
# dbase for heading dbase
HEADINGDB= build/headings.db

SED = sed
PERL= perl5
NSGMLS=nsgmls
LINKLINT=linklint

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
# make database of references (reference.src)
MKREFDB = $(PERL) ./bin/mkrefdb
# check references.
CHKREFS= $(PERL) ./bin/chkrefs
# add reference normative/informative class info.
ADDREFCLASS= $(PERL) ./bin/addrefclass

# utility to generate the PostScript version
# -R seems broken for this spec.
HTML2PS= $(PERL) ./bin/html2ps -d -f html2psrc

# IDRAW -> PS -> GIF tools
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

.SUFFIXES: .src .html .srb .idraw .gif .ps

.src.html:
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(HIPP) $(INCLUDES) $< - | $(ADDHANCH) -n -ml 3 -r $< - - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

.idraw.gif:
	$(RM) $@
#	$(PSTOPNM) $< | $(PPMQUANT) | $(PPMTOGIF) >$@
	$(PSTOPNM) $< | $(PNMTOGIF_PIPE) >$@

all: blocks $(PROPERTYDB) $(DESCRIPTORDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES) \
	$(IMAGES) issues.html DOC/TODO.html

install: all css2.tgz 
	@if [ -z "$(INSTALLDIR)" ]; then\
	  echo >&2;\
	  echo "*** No target directory specified" >&2;\
	  echo "*** Please use: make install INSTALLDIR=<target-dir>" >&2;\
	  exit 1;\
	fi
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css2.tgz $(INSTALLDIR)
	(cd $(INSTALLDIR); zcat css2.tgz | $(TAR) xvf -)
	-(cd $(CSSGROUPDIR); rm -f issues.html; \
            $(LN) -s $(INSTALLDIR)/issues.html css2-issues.html)
	$(CP) Overview.html html2psrc $(INSTALLDIR)

install-all: install css2.zip css2.ps css2.txt
	$(CP) css2.zip css2.ps css2.txt $(INSTALLDIR)

#### Special section to build PS file and single plain text file

css2.ps ps: all
	$(HTML2PS) $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES) > $@

css2.html html: all
	$(HTMLCAT) - $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES) | \
	$(HTMLTRIM) div navbar - $@

# the following requires to be on unix and have Netscape running...
css2.txt txt: css2.html
	$(RM) css2.txt; \
        netscape -remote "openFile(`pwd`/css2.html)" -remote "saveAs(`pwd`/css2.txt,Text)"

####

css2.tgz: $(ALLOBJS)
	$(TAR) cf - $(ALLOBJS) | gzip >$@

css2.zip: $(ALLOBJS)
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
	$(MKPANCHDB) properties propdef - $(SPECSRCS) | $(SED) 's/\.src/\.html/' > $@

$(DESCRIPTORDB): $(SPECSRCS)
	@if [ ! -d build ]; then mkdir build;fi
	$(MKPANCHDB) descriptors descdef - $(SPECSRCS) | $(SED) 's/\.src/\.html/' > $@

$(VALUEDB): $(SPECSRCS)
	$(MKANCHDB) value-def - $(SPECSRCS) | $(SED) 's/\.src/\.html/' > $@

indexlist.html: build/indexlist.srb
build/indexlist.srb: $(SPECOBJS)
	$(MKIDX) $@ build/index/*

cover.html: cover.src build/contents.srb
	$(SED) -e 's|_THIS_VERSION_|$(THIS_VERSION)|g' \
	       -e 's|_THE_PREVIOUS_VERSION_|$(THE_PREVIOUS_VERSION)|g' \
	       -e 's|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g' \
	       -e 's|_THE_DATE_|$(THE_DATE)|g' \
	       -e 's|_THE_ID_|$(THE_ID)|g' $< | \
	$(HIPP) $(INCLUDES) - - | \
 $(ADDNAVBAR) -hr -r $@ - $@ "table of contents" "#toc" index indexlist.html

build/contents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS) $(REFSRCS)
	$(MKTOC) -ml 5 $@ $(HEADINGDB) $(MAINSRCS) -ul -roman $(APPSRCS) \
		-ol -none $(REFSRCS) $(INDEXSRCS) 
	$(ADDLINKS) -r $< $(HEADINGDB) $(HEADINGDB) propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) 
	$(ADDLINKS) -r $< $@ $@ propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) 
$(HEADINGDB): build/contents.srb

# special rule with different numbering
about.html: about.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	$(ADDHANCH) -n -l 2 -ml 4 $< - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html >$@

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
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html| \
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
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html| \
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
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html| \
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
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html| \
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
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index indexlist.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$

# simpler rules for special pages

indexlist.html: indexlist.src
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

check: checkdoc checkrefs checklnx

FILES= $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES)

checkdoc: all
	@for i in $(FILES); \
	do echo checking $$i...; \
           $(NSGMLS) -s -c sgml/HTML4.cat $$i; done; \
	echo checking done.

### check on the validity references in the document

checkrefs: build/refs.db
	-@$(CHKREFS) build/refs.db $(SPECSRCS)

build/refs.db : $(SPECSRCS) $(REFSRCS)
	-@$(RM) -f build/refs.db
	-@$(MKREFDB) $(REFSRCS) build/refs.db

### check links

checklnx: all
	-@$(RM) linklint
	$(LINKLINT) -doc linklint $(FILES)

# get cvs logs

FROMDATE=1 week ago
log:
	@for i in `cat DOC/FILES` ; \
	do cvs log -d ">$(FROMDATE)" $$i >/tmp/log; \
	   grep "selected revisions: 0" /tmp/log >/dev/null || cat /tmp/log; \
	done; rm /tmp/log

clean:
	$(RM) $(SPECOBJS) $(SPECIALOBJS) $(INDEXES) $(PROPBLKSDIR)/* \
        $(DESCBLKSDIR)/* build/* css2.* linklint

realclean: clean

depend:
	$(HMKDEPEND) $(SPECOBJS) $(SPECIALOBJS) 

##### The following is automatically generated. Do not edit!! ####
