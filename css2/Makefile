# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 2.122 2013-07-18 08:21:21 bbos Exp $

# what needs to be set for every new release:
# Note use of full year (1998) in identifier.
THE_YEAR = YYYY
THE_MONTH = MM
THE_MONTHNAME = MMMMM
THE_DAY = DD
#THE_STATUS = NOTE
THE_STATUS = ED
#THE_STATUSNAME = Group Note
THE_STATUSNAME = Editors' Draft
#THE_STYLE = NOTE
THE_STYLE = ED

PREV_YEAR = 2016
PREV_MONTH = 04
PREV_DAY = 12
PREV_STATUS = WD
PREV_NAME = CSS22

PERMANENT_NAME = CSS2-testing

ifeq ($(THE_STATUS),REC)
THE_DATE = 07 June 2011, revised $(THE_DAY) $(THE_MONTHNAME) $(THE_YEAR)
else
THE_DATE = $(THE_DAY) $(THE_MONTHNAME) $(THE_YEAR)
endif

# A very visible warning after the first H1 on every page (or at the
# location of the _THE_WARNING_ placeholder on some pages). Leave
# empty if none is needed. (Escape any & as \&, # as \# and " as \")
# 
# THE_WARNING = <DIV>							\
#  <INPUT ID=annoying-warning TYPE=CHECKBOX TITLE=\"hide note\">		\
#  <LABEL FOR=annoying-warning>(hide)</LABEL>				\
#  <DIV CLASS=annoying-warning>						\
#  <P><STRONG>Note:</STRONG> several sections of this specification	\
#  have been extended by other specifications. Please, see <a		\
#  href=\"https://www.w3.org/TR/CSS/\#css\" >\"Cascading Style Sheets	\
#  (CSS) \&mdash; The Official Definition\"</a> in the latest <CITE>CSS	\
#  Snapshot</CITE> for a list of specifications and the sections they	\
#  replace.	       	    	 		    		 	\
#  </DIV>									\
#  </DIV>

# WEBROOT = /afs/w3.org/WWW
WEBROOT = $(HOME)/WWW

CSSGROUPDIR = $(WEBROOT)/Style/Group
UPDATES = /Style/css2-updates

THE_UPDATE_DIR = http://www.w3.org$(UPDATES)
UPDATESDIR= $(WEBROOT)$(UPDATES)
TR_DIR = $(WEBROOT)/TR
THE_ID = $(THE_STYLE)-$(PERMANENT_NAME)-$(THE_YEAR)$(THE_MONTH)$(THE_DAY)
PREV_DATE = $(PREV_YEAR)$(PREV_MONTH)$(PREV_DAY)
THE_PREVIOUS_VERSION = http://www.w3.org/TR/$(PREV_YEAR)/$(PREV_STATUS)-$(PREV_NAME)-$(PREV_DATE)/
THE_LOC = $(THE_YEAR)/$(THE_ID)
INSTALLDIR = $(TR_DIR)/$(THE_LOC)
THIS_VERSION = http://www.w3.org/TR/$(THE_LOC)/
THE_LATEST_VERSION = http://www.w3.org/TR/$(PERMANENT_NAME)/

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
Overview.src

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
aural.src\
zindex.src\
leftblank.src


APPSRCS = \
changes.src\
sample.src\
grammar.src

REFSRCS = \
refs.src

INDEXSRCS= \
propidx.src \
indexlist.src

MAINSRCS = $(SRCS1)

REFS= \
refs.html

SPECSRCS= $(SRCS0) $(MAINSRCS) $(APPSRCS)

SPECOBJS= \
Overview.html\
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
aural.html\
refs.html\
changes.html\
sample.html\
zindex.html\
propidx.html\
grammar.html\
leftblank.html\
indexlist.html

#IMAGES = images/*.gif images/*.png
IMAGES = images/*.png
LONGDESCS = images/longdesc/*.html
STYLESHEETS= style/*.css

ALLOBJS= $(SPECOBJS) $(IMAGES) $(LONGDESCS) $(STYLESHEETS)

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
NSGMLS=onsgmls
HTMLDECL = sgml/HTML4.decl
LINKLINT=$(PERL) bin/linklint
# SPELL = ispell -l -p css.dico
SPELL = aspell -H -p css.dico list
DIFF = diff
GREP = grep
LS = ls
#HTML2TXT = lynx -cfg lynx.cfg -dump -nolist
HTML2TXT = lynx -dump -nolist
DISTILL = ps2pdf

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
PDF2PS=pdftops
#HTML2PDF=prince -i html

# IDRAW -> PS -> GIF tools
#PSTOPNM = ./bin/mypstopnm -r 75
PSTOPNM = ./bin/mypstopnm -r 150
#PNMTOGIF_PIPE = ppmquant 256 | ppmtogif
#PNMTOGIF_PIPE = pnmscale 0.5 | pnmgamma 1.7 | ppmquant -fs 256 | ppmtogif
PNMTOGIF_PIPE = pnmscale 0.5 | ppmquant -fs 256 | ppmtogif

# idraw -> png
#PNMTOPNG_PIPE = pnmscale 0.5 | pnmgamma 1.7 | pnmtopng -gamma 1.7
PNMTOPNG_PIPE = pnmscale 0.5 | pnmtopng -gamma 1.45455

# include paths
INCLUDES= -Ibuild -I.

RM= rm -fr
CP= cp
TAR= tar
ZIP= zip -y
LN= ln

.SUFFIXES: .src .html .srd .idraw .gif .ps .subtoc .png .fig .pdf

%.subtoc: %.srd Project.cfg
	@echo "=========== making" $@
	echo "<div id=\"toc\" class=\"subtoc\">" >$@
	echo "<p><strong>Contents</strong>" >>$@
	$(MKTOC) -l 2 -r $*.html $(HEADINGDB) >>$@
	echo "</div>" >>$@
	if [ `cat $@ | wc -l` = 3 ]; then $(SED) -i -e 's|^<p><strong>Contents</strong>||' $@; fi
#	if [ `cat $@ | wc -l` = 3 ]; then $(RM) $@; touch $@; fi

# Use the shorter line to avoid regenerating all .html if one .src changed,
# at the cost of possibly incorrect xrefs in the other .html files
#
#%.html: %.subtoc Project.cfg
%.html: %.subtoc $(MAINSRCS:.src=.srd) $(APPSRCS:.src=.srd) Project.cfg build/warning build/meta-viewport build/fixup-js #$(SPECSRCS:.src=.srd)
	@echo "=========== making" $@
	$(ADDLINKS) $(VALUEDB) $*.srd propinst-/propdef- value-inst-/value-def- |\
	$(ADDIDXANCH) -r $@ $(INDEXDB) - |\
	$(ADDMARKUP) - |\
	$(ADDLONGDESC) - |\
	$(ADDNAVBAR) -r $@ |\
	$(INSAFTER) - build/meta-viewport /TITLE - |\
	$(INSAFTER) - build/fixup-js /TITLE - |\
	$(INSAFTER) - build/warning /H1 - |\
	$(INSAFTER) - $*.subtoc /H1 - |\
	$(MKCHAIN) -r $@ - |\
	$(SED) -e "s|_THIS_VERSION_|$(THIS_VERSION)|g" \
	       -e "s|_THE_PREVIOUS_VERSION_|$(THE_PREVIOUS_VERSION)|g" \
	       -e "s|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g" \
	       -e "s|_THE_STATUS_|$(THE_STATUS)|g" \
	       -e "s|_THE_STATUSNAME_|$(THE_STATUSNAME)|g" \
	       -e "s|_THE_STYLE_|$(THE_STYLE)|g" \
	       -e "s|_THE_DATE_|$(THE_DATE)|g" \
	       -e "s|_THE_WARNING_|$(THE_WARNING)|g" \
	       -e "s|_THE_ID_|$(THE_ID)|g" \
	       -e "s|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g" >$@

%.srd: %.src build/blocks.ok $(REFSRC:.src=.srd)
	@echo "=========== making" $@
	$(HIPP) $(INCLUDES) $< |\
	$(ADDCITE) -r $(REFS) $(REFSRCS) |\
	$(ADDHANCH) -r $*.html $(HEADINGDB) - $@
	$(MKANCHDB) -r $*.html value-def- $(VALUEDB) $@
	$(MKANCHDB) -r $*.html propdef- $(VALUEDB) $@

%.png: %.eps; convert -density 96x96 $< $@
%.png: %.ps; convert -density 96x96 $< $@
%.png: %.idraw; convert -density 96x96 $< $@
%.eps: %.fig; fig2dev -L eps -F -c $< $@

#.idraw.gif:
#	$(RM) $@
##	$(PSTOPNM) $< | $(PPMQUANT) | $(PPMTOGIF) >$@
#	$(PSTOPNM) $< | $(PNMTOGIF_PIPE) >$@
#
#.idraw.png:
#	$(RM) $@
#	$(PSTOPNM) $< | $(PNMTOPNG_PIPE) >$@
#
#.fig.png:
#	$(RM) $@
#	fig2dev -L eps $< | $(PSTOPNM) | $(PNMTOPNG_PIPE) >$@

all: build/blocks.ok $(SPECOBJS) images/pngs.ok \
	$(IMAGES)
#	$(IMAGES) issues.html errata-issues.html DOC/TODO.html

build/warning:
	echo "_THE_WARNING_" >$@

build/meta-viewport:
	echo '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' >$@

build/fixup-js:
	echo '<script type="text/javascript" src="https://www.w3.org/scripts/TR/2016/fixup.js"></script>' >$@

#images/links.ok : $(IMAGES)
#	-@(cd images; for i in *.gif; do $(LN) -s $$i "`basename $$i .gif`" 2>//dev/null; done)
#	touch images/links.ok

install: all css2.tgz css2.txt css2.zip css2.ps.gz css2.pdf # $(INSTALLDIR)/.htaccess
	@if [ -z "$(INSTALLDIR)" ]; then\
	  echo >&2;\
	  echo "*** No target directory specified" >&2;\
	  echo "*** Please use: make install INSTALLDIR=<target-dir>" >&2;\
	  exit 1;\
	fi
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css2.txt css2.zip css2.ps.gz css2.pdf css2.tgz $(INSTALLDIR)
	zcat css2.tgz | (cd $(INSTALLDIR); $(TAR) xvf -)
#	-$(RM) -f $(CSSGROUPDIR)/issues.html
#	-$(RM) $(CSSGROUPDIR)/css2-issues.html
#	$(LN) -s $(INSTALLDIR)/issues.html $(CSSGROUPDIR)/css2-issues.html

$(INSTALLDIR)/.htaccess:
	mkdir -p $(INSTALLDIR)
#	echo "DirectoryIndex Overview.html" >$@
	echo "<Files ~ \"\.html\">" >>$@
	echo "ForceType 'text/html; charset=utf-8'" >>$@
	echo "</Files>" >>$@
	echo "<Files ~ \"\.txt\">" >>$@
	echo "ForceType 'text/plain; charset=utf-8'" >>$@
	echo "</Files>" >>$@

link: install
	-$(RM) -f $(TR_DIR)/$(PERMANENT_NAME)
	(cd $(TR_DIR); $(LN) -s $(THE_LOC) $(PERMANENT_NAME))

install-ps: install css2.ps.gz
	$(CP) css2.ps.gz $(INSTALLDIR)

install-pdf: install css2.pdf
	$(CP) css2.pdf $(INSTALLDIR)

# install all (except for "make link")
install-all: install install-ps install-pdf css2.zip css2.txt
	$(CP) css2.zip css2.txt $(INSTALLDIR)

images/pngs.ok: images/*.idraw images/*.fig
	-@for f in images/*.idraw; do make images/`basename $$f .idraw`.gif; done
	-@for f in images/*.idraw; do make images/`basename $$f .idraw`.png; done
	-@for f in images/*.fig; do make images/`basename $$f .fig`.gif; done
	-@for f in images/*.fig; do make images/`basename $$f .fig`.png; done
	touch images/pngs.ok

translations.html : translations.src
	$(SED) -e "s|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g" \
	       -e "s|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g" $< > $@

errata.html : errata.src
	$(SED) -e "s|_THIS_VERSION_|$(THIS_VERSION)|g" \
	       -e "s|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g" \
	       -e "s|_THE_ID_|$(THE_ID)|g" \
	       -e "s|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g" $< > $@

#### Special section to build PS file and single plain text file

extras: css2.tgz

%.pdf: %.html style/default.css style/prince.css
	prince -s style/prince.css -o $@ $<
%.ps: %.pdf; $(PDF2PS) $< $@

# css2.pdf: $(SPECOBJS:.html=.pdf)
# 	pdftk $+ cat output $@
# css2.pdf: css2.html
# 	prince -o $@ $<

css2.ps.gz: css2.ps
	gzip <$< >$@

# # This requires Acrobat Distiller or equivalent
# css2.pdf: css2.ps
# 	$(DISTILL) css2.ps

#css2.pdf: css2.html
#	$(HTML2PDF) $< $@

css2.html html: $(SPECOBJS)
	$(HTMLCAT) - $(SPECOBJS) | \
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
	$(TAR) cf - $^ | gzip >$@

css2.zip: $(ALLOBJS)
	$(ZIP) $@ $(ALLOBJS)
#	$(ZIP) $@ $(ALLOBJS) `$(LS) -d images/*.png | $(GREP) -v "\."` 

#### Section generate property tables from property database.

build/blocks.ok: $(PROPBLKSDIR)/blocks.ok
	touch $@

$(PROPBLKSDIR)/blocks.ok: $(PROPSRC)
	@rm -rf $(PROPBLKSDIR)
	@mkdir -p $(PROPBLKSDIR)
	$(PEXTR) $(PROPSRC) $(PROPBLKSDIR)
	touch $@


Overview.srd: Overview.src build/contents.srb build/minicontents.srb
	@echo "=========== making" $@
	$(HIPP) $(INCLUDES) $<  |\
	$(ADDCITE) -r $(REFS) $(REFSRCS) >$@

Overview.html: Overview.srd Project.cfg build/meta-viewport build/fixup-js
	@echo "=========== making" $@
	$(ADDNAVBAR) -r $@ $< |\
	$(INSAFTER) - build/meta-viewport /TITLE - |\
	$(INSAFTER) - build/fixup-js /TITLE - |\
	$(MKCHAIN) -r $@ - |\
	$(SED) -e "s|_THIS_VERSION_|$(THIS_VERSION)|g" \
	       -e "s|_THE_PREVIOUS_VERSION_|$(THE_PREVIOUS_VERSION)|g" \
	       -e "s|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g" \
	       -e "s|_THE_STATUS_|$(THE_STATUS)|g" \
	       -e "s|_THE_STATUSNAME_|$(THE_STATUSNAME)|g" \
	       -e "s|_THE_STYLE_|$(THE_STYLE)|g" \
	       -e "s|_THE_DATE_|$(THE_DATE)|g" \
	       -e "s|_THE_WARNING_|$(THE_WARNING)|g" \
	       -e "s|_THE_YEAR_|$(THE_YEAR)|g" \
	       -e "s|_THE_ID_|$(THE_ID)|g" \
	       -e "s|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g" >$@

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

indexlist.html: indexlist.srd build/indexlist.srb Project.cfg build/warning build/meta-viewport build/fixup-js indexlist.subtoc
	@echo "=========== making" $@
	$(ADDNAVBAR) -r $@ $< |\
	$(INSAFTER) - build/meta-viewport /TITLE - |\
	$(INSAFTER) - build/fixup-js /TITLE - |\
	$(INSAFTER) - build/warning /H1 - |\
	$(INSAFTER) - $*.subtoc /H1 - |\
	$(MKCHAIN) -r $@ - |\
	$(SED) -e "s|_THIS_VERSION_|$(THIS_VERSION)|g" \
	       -e "s|_THE_PREVIOUS_VERSION_|$(THE_PREVIOUS_VERSION)|g" \
	       -e "s|_THE_LATEST_VERSION_|$(THE_LATEST_VERSION)|g" \
	       -e "s|_THE_STATUS_|$(THE_STATUS)|g" \
	       -e "s|_THE_STATUSNAME_|$(THE_STATUSNAME)|g" \
	       -e "s|_THE_STYLE_|$(THE_STYLE)|g" \
	       -e "s|_THE_DATE_|$(THE_DATE)|g" \
	       -e "s|_THE_WARNING_|$(THE_WARNING)|g" \
	       -e "s|_THE_YEAR_|$(THE_YEAR)|g" \
	       -e "s|_THE_ID_|$(THE_ID)|g" \
	       -e "s|_THE_UPDATE_DIR_|$(THE_UPDATE_DIR)|g" >$@

build/propidx.srb: $(PROPSRC)
	@echo "=========== making" $@
	$(MKPROPIDX) -r $@ $@ $(PROPSRC)

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

checkdoc: all
	-@echo "# Begin checking sgml."
	@for i in $(SPECOBJS) $(LONGDESCS); \
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
		cat $$i | $(SPELL) | sort -u;\
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
	$(LINKLINT) -doc linklint $(SPECOBJS)
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
	$(RM) $(SPECOBJS) $(PROPBLKSDIR)/* \
	$(SPECOBJS:.html=.srd) $(SPECOBJS:.html=.subtoc) \
        build/* css2.* linklint images/links.ok images/pngs.ok

realclean: clean

depend:
	$(HMKDEPEND) $(SPECOBJS) 

# Rules to make diff files relative to previous REC and WD.
# htmldiff returns >0 if there are differences, so we ignore the exit code.

PREVREC = ../../../TR/1998/REC-CSS2-19980512
PREVWD = ../../../TR/$(PREV_YEAR)/$(PREV_STATUS)-$(PREV_NAME)-$(PREV_DATE)
HTMLDIFF = htmldiff -i -w '<del>' -x '</del>' -y '<ins>' -z '</ins>'

diffs: $(SPECOBJS)
	-(cd diffs-rec;\
	 make PREV=../$(PREVREC) HTMLDIFF="$(HTMLDIFF)" $(SPECOBJS))
	-(cd diffs-wd;\
	 make PREV=../$(PREVWD) HTMLDIFF="$(HTMLDIFF)" $(SPECOBJS))


.PHONY: all install install-all clean realclean checkx diffs

##### The following is automatically generated. Do not edit!! ####
