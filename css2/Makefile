# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 1.78 1998-01-29 01:29:31 ijacobs Exp $

# what needs to be set for every new release:
# Note use of full year (1998) in identifier.
THIS_VERSION= http://www.w3.org/TR/WD-css2-19980128
THE_PREVIOUS_VERSION= http://www.w3.org/TR/WD-CSS2-971104
THE_LATEST_VERSION= http://www.w3.org/TR/WD-css2
THE_DATE= 28-Jan-1998
THE_ID= WD-css2-19980128
INSTALLDIR= /afs/w3.org/pub/WWW/TR/WD-css2-19980128
CSSGROUPDIR = /afs/w3.org/pub/WWW/Style/Group/

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
$(ROOT)/cover.src

SRCS1 = \
about.src\
intro.src\
conform.src\
syndata.src\
selector.src\
cascade.src\
media.src\
visuren.src\
visudet.src\
visufx.src\
generate.src\
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
grammar.src

REFSRCS = \
refs.src

INDEXSRCS= \
propidx.src \
descidx.src \
indexlist.src

MAINSRCS = $(SRCS1)

MAINOBJS = \
cover.html\
about.html\
intro.html\
conform.html\
syndata.html\
selector.html\
cascade.html\
media.html\
visuren.html\
visudet.html\
visufx.html\
generate.html\
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
grammar.html

REFS= \
refs.html

INDEXES= \
propidx.html \
descidx.html \
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
MINIHEADINGDB= build/miniheadings.db

SED = sed
PERL= perl5
NSGMLS=nsgmls
LINKLINT=$(PERL) bin/linklint
SPELL = ispell -l -p
DIFF = diff

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
# make property index
MKPROPIDX= $(PERL) ./bin/mkpropidx
# make descriptor index
MKDESCIDX= $(PERL) ./bin/mkdescidx
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
# check validity of sample style sheet
CHKSAMPLE= $(PERL) ./bin/chksample
# make database of references (reference.src)
MKREFDB = $(PERL) ./bin/mkrefdb
# check references.
CHKREFS= $(PERL) ./bin/chkrefs
# check property/descriptor defs and instances
CHKPROPS= $(PERL) ./bin/chkprops
# add reference normative/informative class info.
CHKSPACES= $(PERL) ./bin/chkspaces
# check CSS examples
CHKCSS= ./bin/chkcss
# add reference normative/informative class info.
ADDREFCLASS= $(PERL) ./bin/addrefclass

# utility to generate the PostScript version
#
HTML2PS= $(PERL) bin/html2ps -d -f html2psrc

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

%.html: %.src $(HEADINGDB) $(PROPERTYDB) $(DESCRIPTORDB) $(VALUEDB) blocks
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -l 2  $(HEADINGDB) $< |\
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) >> build/subtoc.$$$$;\
	echo "</div>" >> build/subtoc.$$$$; \
	$(HIPP) $(INCLUDES) $< | $(ADDHANCH) -n -ml 3 -r $< $(HEADINGDB) | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@;\
	$(RM) build/subtoc.$$$$

.idraw.gif:
	$(RM) $@
#	$(PSTOPNM) $< | $(PPMQUANT) | $(PPMTOGIF) >$@
	$(PSTOPNM) $< | $(PNMTOGIF_PIPE) >$@

all: blocks $(PROPERTYDB) $(DESCRIPTORDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES) \
	$(IMAGES) issues.html DOC/TODO.html

install: all css20.tgz 
	@if [ -z "$(INSTALLDIR)" ]; then\
	  echo >&2;\
	  echo "*** No target directory specified" >&2;\
	  echo "*** Please use: make install INSTALLDIR=<target-dir>" >&2;\
	  exit 1;\
	fi
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css20.tgz $(INSTALLDIR)
	(cd $(INSTALLDIR); zcat css20.tgz | $(TAR) xvf -)
	-(cd $(CSSGROUPDIR); rm -f issues.html; \
	    $(RM) css2-issues.html; \
            $(LN) -s $(INSTALLDIR)/issues.html css2-issues.html)
	(cd $(INSTALLDIR); $(LN) -s cover.html Overview.html)

install-all: install css20.zip css20.ps css20.txt
	$(CP) css20.zip css20.ps css20.txt $(INSTALLDIR)

#### Special section to build PS file and single plain text file

css20.ps ps: all
# Because of memory limitations in html2ps, use the
# automagic feature that any *.gif files are not
# converted to ps if there's a *.ps file in the same
# directory.
	-@(cd images; for i in *.idraw; do $(LN) -s $$i "`basename $$i .idraw`.ps"; done)
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
	$(MKPANCHDB) properties propdef - $(SPECSRCS) | $(SED) 's/\.src/\.html/' > $@

$(DESCRIPTORDB): $(SPECSRCS)
	@if [ ! -d build ]; then mkdir build;fi
	$(MKPANCHDB) descriptors descdef - $(SPECSRCS) | $(SED) 's/\.src/\.html/' > $@

$(VALUEDB): $(SPECSRCS)
	$(MKANCHDB) value-def - $(SPECSRCS) | $(SED) 's/\.src/\.html/' > $@

cover.html: cover.src build/contents.srb build/minicontents.srb
	$(SED) -e 's|_THIS_VERSION_|$(THIS_VERSION)|g' \
	       -e 's|_THE_PREVIOUS_VERSION_|$(THE_PREVIOUS_VERSION)|g' \
	       -e 's|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g' \
	       -e 's|_THE_DATE_|$(THE_DATE)|g' \
	       -e 's|_THE_ID_|$(THE_ID)|g' $< | \
	$(HIPP) $(INCLUDES) | \
 $(ADDNAVBAR) -r $@ - $@ "table of contents" "#toc" properties propidx.html descriptors descidx.html index indexlist.html

build/contents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS) $(REFSRCS) $(PROPERTYDB) $(DESCRIPTORDB) $(VALUEDB)
	$(MKTOC) -ml 5 $@ $(HEADINGDB) $(MAINSRCS)\
	   -ol -roman $(APPSRCS) -ul -none $(REFSRCS) $(INDEXSRCS) 
	$(ADDLINKS) -r $< $@ $@ propinst $(PROPERTYDB) \
	   descinst $(DESCRIPTORDB) value-inst $(VALUEDB) 

build/minicontents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS) $(REFSRCS)
	$(MKTOC) -ml 1 $@ $(MINIHEADINGDB) $(MAINSRCS)\
	   -ol -roman $(APPSRCS) -ul -none $(REFSRCS) $(INDEXSRCS) 
	$(ADDLINKS) -r $< $@ $@ propinst $(PROPERTYDB) \
	   descinst $(DESCRIPTORDB) value-inst $(VALUEDB) 

$(HEADINGDB): build/contents.srb

# special rule with different numbering
about.html: about.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	$(ADDHANCH) -n -l 2 -ml 4 $(HEADINGDB) $< | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html >$@

# special rule with different numbering
sample.html: sample.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	$(ADDHANCH) -n -l 2 -ml 4 $(HEADINGDB) $<| \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html > $@

changes.html: changes.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -l 2  $(HEADINGDB) $< |\
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) >> build/subtoc.$$$$;\
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $(HEADINGDB) $<| \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@;\
	$(RM) build/subtoc.$$$$

notes.html: notes.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -l 2  $(HEADINGDB) $< |\
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) >> build/subtoc.$$$$;\
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $(HEADINGDB) $<| \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@;\
	$(RM) build/subtoc.$$$$

grammar.html: grammar.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	$(ADDHANCH) -n -l 2 -ml 4 $(HEADINGDB) $<| \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html > $@

refs.html: refs.src
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -l 2  $(HEADINGDB) $< |\
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) >> build/subtoc.$$$$;\
	echo "</div>" >> build/subtoc.$$$$; \
	$(ADDHANCH) -n -l 2 -ml 4 $(HEADINGDB) $<| \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDIDXANCH) -r $< build/index/`echo $<|tr / _`.db | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" properties propidx.html descriptors descidx.html index indexlist.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 - | \
	$(ADDLINKS) -r $< - $@ propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB);\
	$(RM) build/subtoc.$$$$

### general index related rules
indexlist.html: build/indexlist.srb
build/indexlist.srb: $(SPECOBJS)
	$(MKIDX) -r indexlist.html $@ build/index/*

indexlist.html: indexlist.src
	$(HIPP) $(INCLUDES) $< | \
	$(ADDNAVBAR) -r $@ - $@ contents "cover.html#toc" properties propidx.html descriptors descidx.html

propidx.html: build/propidx.srb
build/propidx.srb: $(SPECOBJS)
	$(MKPROPIDX) -r $@ $@ $(PROPSRC)

propidx.html: propidx.src
	$(HIPP) $(INCLUDES) $< | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - $@ contents "cover.html#toc" descriptors descidx.html index indexlist.html

descidx.html: build/descidx.srb
build/descidx.srb: $(SPECOBJS)
	$(MKDESCIDX) -r $@ $@ $(DESCSRC)

descidx.html: descidx.src
	$(HIPP) $(INCLUDES) $< | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) descinst $(DESCRIPTORDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - $@ contents "cover.html#toc" properties "propidx.html" index "indexlist.html"

# Issues and todo lists.
issues.html: issues.src build/issues.srb
	$(HIPP) $(INCLUDES) $< $@

build/issues.srb: issues.db
	$(ISSUES) -g >$@

DOC/TODO.html: DOC/TODO.src build/todo.srb
	$(HIPP) $(INCLUDES) $< $@

build/todo.srb: DOC/todo.db
	$(TODO) -g >$@

### check on the document to see if it's valid

check: checkdoc checkspaces checkprops checkrefs checkspell checksample checklnx checkx

FILES= $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES)

checkdoc: all
	-@echo "# Begin checking sgml."
	@for i in $(FILES); \
	do echo checking $$i...; \
           $(NSGMLS) -s -c sgml/HTML4.cat $$i; done;
	-@echo "# End checking sgml."

### check on the validity references in the document

checkrefs: build/refs.db
	-@echo "# Begin checking references."
	-@$(CHKREFS) build/refs.db $(SPECSRCS)
	-@echo "# End checking references."

build/refs.db : $(SPECSRCS) $(REFSRCS)
	-@$(RM) -f build/refs.db
	-@$(MKREFDB) $(REFSRCS) build/refs.db

### Spell check, using a "CSS" personal dictionary.

checkspell: 
	-@echo "# Begin spell checking."
	-@for i in $(SPECSRCS); \
	   do\
		echo "Checking spelling in $$i.";\
		cat $$i | $(SPELL) css.dico;\
	   done;
	-@echo "# End spell checking."

### check the sample style sheet.

checksample: sample.src $(PROPSRC)
	-@echo "# Begin checking sample."
	@$(CHKSAMPLE) sample.src $(PROPSRC)
	-@echo "# End checking sample."

### check links

checklnx: all
	-@echo "# Begin checking links."
	-@$(RM) linklint
	$(LINKLINT) -doc linklint $(FILES)
	-@echo "# End checking links."

### check property instances

checkprops: $(SPECSRCS) $(PROPSRC) $(DESCSRC)
	-@echo "# Begin checking properties."
	-@$(CHKPROPS) $(PROPSRC) propinst $(SPECSRCS)
	-@echo "# End checking properties."
	-@echo "# Begin checking descriptors."
	-@$(CHKPROPS) $(DESCSRC) descinst $(SPECSRCS)
	-@echo "# End checking descriptors."

# Check spaces

checkspaces: $(SPECSRCS) 
	-@echo "# Begin checking spaces."
	-@$(CHKSPACES) $(SPECSRCS)
	-@echo "# End checking spaces."

# Check examples (CSS, HTML, XML, etc.)

build/xamples.ok: $(SPECSRCS)
	@for i in $(SPECSRCS) ; \
	do $(PERL) bin/xextr $$i build; done;
	@touch build/xamples.ok

build/checkx.out: build/xamples.ok
	$(RM) build/checkx.out
	-@echo Begin checking HTML examples.
	-@for i in build/?*xampl*.html ; \
	do echo checking $$i...; \
	   $(NSGMLS) -s -c sgml/HTML4.cat sgml/HTML4.decl $$i >> build/checkx.out 2>&1; \
	done;
	-@echo Begin checking CSS examples.
	$(CHKCSS) build/?*xampl*.css >> build/checkx.out 2>&1; \

checkx: build/checkx.out
	@$(DIFF) checkx.out build/checkx.out >build/checkx.diff \
		|| echo output differs, see build/checkx.diff for details.

# get cvs logs

FROMDATE=1 week ago
log:
	@for i in `cat DOC/FILES` ; \
	do cvs log -d ">$(FROMDATE)" $$i >/tmp/log; \
	   grep "selected revisions: 0" /tmp/log >/dev/null || cat /tmp/log; \
	done; rm /tmp/log

clean:
	$(RM) $(SPECOBJS) $(SPECIALOBJS) $(INDEXES) $(PROPBLKSDIR)/* \
        $(DESCBLKSDIR)/* build/* css20.* linklint

realclean: clean

depend:
	$(HMKDEPEND) $(SPECOBJS) $(SPECIALOBJS) 

##### The following is automatically generated. Do not edit!! ####
