# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 2.60 2002-08-02 14:54:02 bbos Exp $

# what needs to be set for every new release:
# Note use of full year (1998) in identifier.
THE_PREVIOUS_VERSION = http://www.w3.org/TR/1998/REC-CSS2-19980512
PERMANENT_NAME = CSS21
THE_YEAR = 2002
THE_DATE = 2 August $(THE_YEAR)
THE_ID = WD-$(PERMANENT_NAME)-$(THE_YEAR)0802

THE_LOC = $(THE_YEAR)/$(THE_ID)
THIS_VERSION = http://www.w3.org/TR/$(THE_LOC)
THE_LATEST_VERSION = http://www.w3.org/TR/$(PERMANENT_NAME)
CSSGROUPDIR = /afs/w3.org/pub/WWW/Style/Group
TR_DIR = /afs/w3.org/pub/WWW/TR
INSTALLDIR = $(TR_DIR)/$(THE_LOC)
THE_UPDATE_DIR = http://www.w3.org/Style/css2-updates
UPDATESDIR= /afs/w3.org/pub/WWW/Style/css2-updates

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
cover.src

SRCS1 = \
about.src\
intro.src\
conform.src\
syndata.src\
selector.src\
cascade.src\
media.src\
box.src\
visuren.src\
visudet.src\
visufx.src\
generate.src\
page.src\
colors.src\
fonts.src\
text.src\
tables.src\
ui.src\
aural.src


APPSRCS = \
sample.src\
changes.src\
grammar.src

REFSRCS = \
refs.src

INDEXSRCS= \
propidx.src \
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
box.html\
visuren.html\
visudet.html\
visufx.html\
generate.html\
page.html\
colors.html\
fonts.html\
text.html\
tables.html\
ui.html\
aural.html

APPENDIXES= \
sample.html\
changes.html\
grammar.html

REFS= \
refs.html

INDEXES= \
propidx.html \
indexlist.html

SPECSRCS= $(SRCS0) $(MAINSRCS) $(APPSRCS)
SPECOBJS= $(MAINOBJS) $(APPENDIXES) $(REFS)

#IMAGES = images/*.gif images/*.png
IMAGES = images/*.png images/*.jpg
LONGDESCS = images/longdesc/*.html
STYLESHEETS= style/*.css

ALLOBJS= $(SPECOBJS) $(INDEXES) $(IMAGES) $(LONGDESCS) $(STYLESHEETS)

PROPSRC= properties/properties.db
PROPSAMPLE= properties/sample.db
PROPBLKSDIR= build/properties

# dbase for property name anchors
PROPERTYDB= build/property.db
# dbase for value types
VALUEDB= build/value.db
# dbase for headings
HEADINGDB= build/headings.db
# dbase for index terms
INDEXDB = build/index.db

SED = sed
#PERL= perl5 -Ibin
PERL= perl
NSGMLS=nsgmls
HTMLDECL = sgml/HTML4.decl
LINKLINT=$(PERL) bin/linklint
SPELL = ispell -l -p
DIFF = diff
GREP = grep
LS = ls
HTML2TXT = lynx -cfg lynx.cfg -dump -nolist

# HTML include preprocessor (for includes)
HIPP= $(PERL) ./bin/hipp
# make depend utility for CSS source documents
HMKDEPEND= $(PERL) ./bin/hmkdep
# make value anchor database
MKANCHDB= $(PERL) ./bin/mkanchdb
# make property anchor database
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
# extract issues from issues db.
ISSUES= bin/issues
# extract issues from errata-issues db.
ERRATA= bin/errata
# extract issues from todo db.
TODO= bin/todo
# check validity of sample style sheet
CHKSAMPLE= $(PERL) ./bin/chksample
# make database of references (reference.src)
MKREFDB = $(PERL) ./bin/mkrefdb
# check references.
CHKREFS= $(PERL) ./bin/chkrefs
# check property defs and instances
CHKPROPS= $(PERL) ./bin/chkprops
# add reference normative/informative class info.
CHKSPACES= $(PERL) ./bin/chkspaces
# check CSS examples
CHKCSS= ./bin/chkcss
# check XML examples
CHKXML= ./bin/chkxml
# add reference normative/informative class info.
ADDREFCLASS= $(PERL) ./bin/addrefclass
# Add prev/next/toc/stylesheet and other links to document
MKCHAIN = $(PERL) ./bin/mkchain
# Expand [[cite]] to link to bibliography
ADDCITE = $(PERL) ./bin/addcite
# Remove extensions (.gif, .png,...) from IMG links
RMIMGEXT = $(PERL) ./bin/rmimgext
# Add special markup (e.g., keyword "Example")
ADDMARKUP = $(PERL) ./bin/addmarkup
# Add longdesc descriptions to images
ADDLONGDESC = $(PERL) ./bin/addlongdesc

# utility to generate the PostScript version
#
HTML2PS= $(PERL) bin/html2ps -d -f html2psrc2

# IDRAW -> PS -> GIF tools
#PSTOPNM = ./bin/mypstopnm -r 75
PSTOPNM = ./bin/mypstopnm -r 150
#PNMTOGIF_PIPE = ppmquant 256 | ppmtogif
PNMTOGIF_PIPE = pnmscale 0.5 | pnmgamma 1.7 | ppmquant -fs 256 | ppmtogif

# idraw -> png
PNMTOPNG_PIPE = pnmscale 0.5 | pnmgamma 1.7 | pnmtopng -gamma 1.7

# include paths
INCLUDES= -Ibuild -I.

RM= rm -fr
CP= cp
TAR= tar
ZIP= zip -y
LN= ln

.SUFFIXES: .src .html .srd .idraw .gif .ps .subtoc .png

%.subtoc: %.srd Project.cfg
	@echo "=========== making" $@
	echo "<div class=\"subtoc\">" >$@
	echo "<p><strong>Contents</strong>" >>$@
	$(MKTOC) -l 2 -r $*.html $(HEADINGDB) >>$@
	echo "</div>" >>$@
	if [ `cat $@ | wc -l` = 3 ]; then $(RM) $@; touch $@; fi

# Use the shorter line to avoid regenerating all .html if one .src changed,
# at the cost of possibly incorrect xrefs in the other .html files
#
#%.html: %.subtoc Project.cfg
%.html: %.subtoc $(MAINSRCS:.src=.srd) $(APPSRCS:.src=.srd) Project.cfg #$(SPECSRCS:.src=.srd)
	@echo "=========== making" $@
	$(ADDLINKS) $(VALUEDB) $*.srd propinst-/propdef- value-inst-/value-def- |\
	$(ADDIDXANCH) -r $@ $(INDEXDB) - |\
	$(ADDMARKUP) - |\
	$(ADDLONGDESC) - |\
	$(ADDNAVBAR) -r $@ |\
	$(INSAFTER) - $*.subtoc /H1 - |\
	$(MKCHAIN) -r $@ - $@

%.srd: %.src build/blocks.ok $(REFSRC:.src=.srd)
	@echo "=========== making" $@
	$(HIPP) $(INCLUDES) $< |\
	$(ADDCITE) -r $(REFS) $(REFSRCS) |\
	$(ADDHANCH) -r $*.html $(HEADINGDB) - $@
	$(MKANCHDB) -r $*.html value-def- $(VALUEDB) $@
	$(MKANCHDB) -r $*.html propdef- $(VALUEDB) $@

.idraw.gif:
	$(RM) $@
#	$(PSTOPNM) $< | $(PPMQUANT) | $(PPMTOGIF) >$@
	$(PSTOPNM) $< | $(PNMTOGIF_PIPE) >$@

.idraw.png:
	$(RM) $@
	$(PSTOPNM) $< | $(PNMTOPNG_PIPE) >$@

all: build/blocks.ok $(SPECOBJS) $(INDEXES) images/pngs.ok \
	$(IMAGES)
#	$(IMAGES) issues.html errata-issues.html DOC/TODO.html


#images/links.ok : $(IMAGES)
#	-@(cd images; for i in *.gif; do $(LN) -s $$i "`basename $$i .gif`" 2>//dev/null; done)
#	touch images/links.ok

install: all css2.tgz 
	@if [ -z "$(INSTALLDIR)" ]; then\
	  echo >&2;\
	  echo "*** No target directory specified" >&2;\
	  echo "*** Please use: make install INSTALLDIR=<target-dir>" >&2;\
	  exit 1;\
	fi
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css2.tgz $(INSTALLDIR)
	zcat css2.tgz | (cd $(INSTALLDIR); $(TAR) xvf -)
#	-$(RM) -f $(CSSGROUPDIR)/issues.html
#	-$(RM) $(CSSGROUPDIR)/css2-issues.html
#	$(LN) -s $(INSTALLDIR)/issues.html $(CSSGROUPDIR)/css2-issues.html
	-$(RM) $(INSTALLDIR)/Overview.html
	(cd $(INSTALLDIR); $(LN) -s cover.html Overview.html)
	-$(RM) -f $(TR_DIR)/$(PERMANENT_NAME)
	(cd $(TR_DIR); $(LN) -s $(THE_LOC) $(PERMANENT_NAME))

install-ps: install css2.ps.gz
	$(CP) css2.ps.gz $(INSTALLDIR)

install-pdf: install css2.pdf
	$(CP) css2.pdf $(INSTALLDIR)

# install all
install-all: install install-ps install-pdf css2.zip css2.txt
	$(CP) css2.zip css2.txt $(INSTALLDIR)

images/pngs.ok: images/*.idraw
	-@for f in images/*.idraw; do make images/`basename $$f .idraw`.gif; done
	-@for f in images/*.idraw; do make images/`basename $$f .idraw`.png; done
	touch images/pngs.ok

translations.html : translations.src
	$(SED) -e 's|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g' \
	       -e 's|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g' $< > $@

errata.html : errata.src
	$(SED) -e 's|_THIS_VERSION_|$(THIS_VERSION)|g' \
	       -e 's|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g' \
	       -e 's|_THE_ID_|$(THE_ID)|g' \
	       -e 's|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g' $< > $@

#### Special section to build PS file and single plain text file

css2.ps ps: build/blocks.ok $(SPECOBJS) $(INDEXES) images/pngs.ok $(IMAGES)
# Because of memory limitations in html2ps, use the
# automagic feature that any *.gif files are not
# converted to ps if there's a *.ps file in the same
# directory.
	-@(cd images; for i in *.idraw; do $(LN) -s $$i "`basename $$i .idraw`.ps"; done)
	$(HTML2PS) $(SPECOBJS) $(INDEXES) > $@

css2.ps.gz: css2.ps
	gzip <$< >$@

# This requires Acrobat Distiller
css2.pdf: css2.ps
	distill css2.ps

css2.html html: $(SPECOBJS) $(INDEXES)
	$(HTMLCAT) - $(SPECOBJS) $(INDEXES) | \
	$(HTMLTRIM) div navbar - $@

# the following requires to be on unix and have Netscape running...
#css2.txt txt: css2.html
#	$(RM) css2.txt; \
#        netscape -remote "openFile(`pwd`/css2.html)" -remote "saveAs(`pwd`/css2.txt,Text)"

# The following requires Lynx
css2.txt txt: css2.html
	$(HTML2TXT) css2.html >$@

####

css2.tgz: $(ALLOBJS) # images/links.ok
#	$(TAR) cf - $(ALLOBJS) `$(LS) -d images/*.png | $(GREP) -v "\."` | gzip >$@
	$(TAR) cf - $(ALLOBJS) | gzip >$@

css2.zip: $(ALLOBJS)
	$(ZIP) $@ $(ALLOBJS) images/*.png
#	$(ZIP) $@ $(ALLOBJS) `$(LS) -d images/*.png | $(GREP) -v "\."` 

#### Section generate property tables from property database.

build/blocks.ok: $(PROPBLKSDIR)/blocks.ok
	touch $@

$(PROPBLKSDIR)/blocks.ok: $(PROPSRC)
	@if [ ! -d $(PROPBLKSDIR) ]; then mkdir -p $(PROPBLKSDIR);fi
	$(PEXTR) $(PROPSRC) $(PROPBLKSDIR)
	$(PEXTR) -n $(PROPSAMPLE) $(PROPBLKSDIR)
	touch $@


cover.srd: cover.src build/contents.srb build/minicontents.srb
	@echo "=========== making" $@
	$(HIPP) $(INCLUDES) $<  |\
	$(ADDCITE) -r $(REFS) $(REFSRCS) >$@

cover.html: cover.srd Project.cfg
	@echo "=========== making" $@
	$(SED) -e 's|_THIS_VERSION_|$(THIS_VERSION)|g' \
	       -e 's|_THE_PREVIOUS_VERSION_|$(THE_PREVIOUS_VERSION)|g' \
	       -e 's|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g' \
	       -e 's|_THE_DATE_|$(THE_DATE)|g' \
	       -e 's|_THE_ID_|$(THE_ID)|g' \
	       -e 's|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g' $*.srd | \
	$(ADDNAVBAR) -r $@ |\
	$(MKCHAIN) -r $@ - $@

build/contents.srb: $(MAINSRCS:.src=.srd) $(APPSRCS:.src=.srd) $(REFSRCS:.src=.srd) $(INDEXSRCS:.src=.srd) Project.cfg
	@echo "=========== making" $@
	$(MKTOC) -h 5 $(HEADINGDB) $@


build/minicontents.srb: $(MAINSRCS:.src=.srd) $(APPSRCS:.src=.srd) $(REFSRCS:.src=.srd) $(INDEXSRCS:.src=.srd) Project.cfg
	@echo "=========== making" $@
	$(MKTOC) -h 1 $(HEADINGDB) $@

### general index related rules
build/indexlist.srb: $(MAINSRCS) $(APPSRCS) $(INDEXDB)
	@echo "=========== making" $@
	$(MKIDX) $(INDEXDB) $@

$(INDEXDB): $(MAINSRCS:.src=.html) $(APPSRCS:.src=.html) #$(SPECSRCS:.src=.html)
	touch $(INDEXDB)

indexlist.srd:: build/indexlist.srb #indexlist.src build/blocks.ok
#	@echo "=========== making" $@
#	$(CP) $< $@

indexlist.html: indexlist.srd build/indexlist.srb Project.cfg
	@echo "=========== making" $@
	$(ADDNAVBAR) -r $@ $< |\
	$(MKCHAIN) -r $@ - $@

build/propidx.srb: $(PROPSRC)
	@echo "=========== making" $@
	$(MKPROPIDX) -l 2.1 -r $@ $@ $(PROPSRC)

propidx.srd:: build/propidx.srb #propidx.src
#	@echo "=========== making" $@
#	$(HIPP) $(INCLUDES) $< $@

# Issues and todo lists.
#issues.html: issues.src build/issues.srb
#	@echo "=========== making" $@
#	$(HIPP) $(INCLUDES) $< $@

#build/issues.srb: issues.db
#	@echo "=========== making" $@
#	$(ISSUES) -g >$@

# Errata-Issues
#errata-issues.html: errata-issues.src build/errata-issues.srb
#	@echo "=========== making" $@
#	$(HIPP) $(INCLUDES) $< $@

#build/errata-issues.srb: errata-issues.db
#	@echo "=========== making" $@
#	$(ERRATA) -g >$@

#DOC/TODO.html: DOC/TODO.src build/todo.srb
#	@echo "=========== making" $@
#	$(HIPP) $(INCLUDES) $< $@

#build/todo.srb: DOC/todo.db
#	@echo "=========== making" $@
#	$(TODO) -g >$@

### check on the document to see if it's valid

check: checkdoc checkspaces checkprops checkrefs checkspell checksample checklnx checkx

FILES= $(MAINOBJS) $(APPENDIXES) $(REFS) $(INDEXES)

checkdoc: all
	-@echo "# Begin checking sgml."
	@for i in $(FILES) $(LONGDESCS); \
	do echo checking $$i...; \
           $(NSGMLS) -s -c sgml/HTML4.cat $(HTMLDECL) $$i; done;
	-@echo "# End checking sgml."

### check on the validity references in the document

checkrefs: build/refs.db $(SPECOBJS)
	-@echo "# Begin checking references."
	-@$(CHKREFS) build/refs.db $(SPECOBJS)
	-@echo "# End checking references."

build/refs.db : $(SPECSRCS) $(REFSRCS)
	-@$(RM) -f build/refs.db
	-@$(MKREFDB) $(REFSRCS) build/refs.db

### Spell check, using a "CSS" personal dictionary.

checkspell: 
	-@echo "# Begin spell checking."
	-@for i in $(SPECSRCS) $(LONGDESCS); \
	   do\
		echo "Checking spelling in $$i.";\
		cat $$i | $(SPELL) css.dico | sort -u;\
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

checkprops: $(SPECSRCS) $(PROPSRC)
	-@echo "# Begin checking properties."
	-@$(CHKPROPS) $(PROPSRC) propinst $(SPECSRCS)
	-@echo "# End checking properties."

# Check spaces

checkspaces: $(SPECSRCS) 
	-@echo "# Begin checking spaces."
	-@$(CHKSPACES) $(SPECSRCS) $(LONGDESCS)
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
	   $(NSGMLS) -s -c sgml/HTML4.cat $(HTMLDECL) $$i >> build/checkx.out 2>&1; \
	done;
	-@echo Begin checking CSS examples.
	$(CHKCSS) build/?*xampl*.css >> build/checkx.out 2>&1
	-@echo Begin checking XML examples.
	$(CHKXML) build/?*xampl*.xml 2>&1 | tee -a build/checkx.out

checkx: build/checkx.out
	@$(DIFF) checkx.out build/checkx.out >build/checkx.diff \
		|| echo output differs, see build/checkx.diff for details.

# get cvs logs

FROMDATE=1 week ago
log:
	@for i in `cat DOC/FILES` ; \
	do cvs log -d ">$(FROMDATE)" $$i >/tmp/log; \
	   $(GREP) "selected revisions: 0" /tmp/log >/dev/null || cat /tmp/log; \
	done; rm /tmp/log

clean:
	$(RM) $(SPECOBJS) $(INDEXES) $(PROPBLKSDIR)/* \
	$(SPECOBJS:.html=.srd) $(SPECOBJS:.html=.subtoc) \
        $(INDEXES:.html=.srd) \
        build/* css2.* linklint images/links.ok images/pngs.ok

realclean: clean

depend:
	$(HMKDEPEND) $(SPECOBJS) 

.PHONY: all install install-all clean realclean checkx

##### The following is automatically generated. Do not edit!! ####
