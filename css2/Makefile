# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 1.3 1997-07-30 17:37:15 lehors Exp $

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
$(ROOT)/cover.src

SRCS1 = \
about.src\
introtop.src\
tutorial.src\
cssdesgn.src\
convent.src\
syndata.src\
doctree.src\
selector.src\
cascade.src\
media.src\
flowobj.src\
colors.src\
fonts.src\
text.src\
boxmodel.src\
ui.src\
conform.src \
refs.src

INDEXSRCS= \
index.src

APPSRCS = \
sample.src\
changes.src\
notes.src\
grammar.src

MAINSRCS = $(SRCS1)

MAINOBJS = \
cover.html\
about.html\
introtop.html\
tutorial.html\
cssdesgn.html\
convent.html\
syndata.html\
doctree.html\
selector.html\
cascade.html\
media.html\
flowobj.html\
colors.html\
fonts.html\
text.html\
boxmodel.html\
ui.html\
conform.html\
refs.html

INDEXES= \
index.html

APPENDIXES= \
sample.html\
changes.html\
notes.html\
grammar.html

SPECSRCS= $(SRCS0) $(MAINSRCS) $(APPSRCS)
SPECOBJS= $(MAINOBJS) $(APPENDIXES)

IMAGES= images/*.gif
STYLESHEETS= style/*.css

ALLOBJS= $(SPECOBJS) $(INDEXES) $(IMAGES) $(STYLESHEETS) translations.html

PSDIR=../css2-ps

INSTALLDIR= /afs/w3.org/pub/WWW/Style/Group/css2

# dbase for property name anchors
PROPERTYDB= build/property.db
# dbase for value types
VALUEDB= build/value.db
# dbase for heading dbase
HEADINGDB= build/headings.db

PERL= perl5

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

# utility to generate the PostScript version
HTML2PSARGS= -n -D -R
HTML2PS= $(PERL) html2ps

# include paths
INCLUDES= -Ibuild

RM= rm -fr
CP= cp
TAR= tar
ZIP= zip
LN= ln

.SUFFIXES: .src .html .srb 

.src.html:
	@if [ ! -d build/index ]; then mkdir -p build/index;fi
	$(HIPP) $(INCLUDES) $< - | $(ADDHANCH) -r $< - - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDNAVBAR) - "cover.html#toc" index.html $@

all: $(PROPERTYDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES)

install: all css20.tgz css20.zip $(PSDIR)/css20.ps $(PSDIR)/css20.txt
	@if [ ! -d $(INSTALLDIR) ]; then mkdir -p $(INSTALLDIR);fi
	$(CP) css20.tgz css20.zip $(PSDIR)/css20.ps $(PSDIR)/css20.txt \
	       Overview.html $(INSTALLDIR)
	(cd $(INSTALLDIR); $(TAR) xvzf css20.tgz)

#### Special section to build PS file and single plain text file

ps $(PSDIR)/css20.ps: $(PSDIR)
	(cd $(PSDIR); \
          $(MAKE) css20.ps PERL="$(PERL)" \
            HTML2PS="$(HTML2PS)" ADDNAVBAR="$(PERL) ./bin/fakenavbar")

$(PSDIR):
	if [ ! -d $(PSDIR) ]; then \
	   mkshadowdir . $(PSDIR); \
	   (cd $(PSDIR); $(MAKE) clean); fi

css20.ps: $(PROPERTYDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES)
	$(HTML2PS) $(HTML2PSARGS) $(MAINOBJS) $(INDEXES) $(APPENDIXES) > $@

txt $(PSDIR)/css20.txt: $(PSDIR)
	(cd $(PSDIR); $(MAKE) css20.txt ADDNAVBAR="$(PERL) ./bin/fakenavbar")

css20.html: $(PROPERTYDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES) 
	$(HTMLCAT) $@ $(MAINOBJS) $(INDEXES) $(APPENDIXES)

# the following requires to be on unix and have Netscape running...
css20.txt: css20.html
	$(RM) css20.txt; \
        netscape -remote "openFile(`pwd`/css20.html)" -remote "saveAs(`pwd`/css20.txt,Text)"

####

css20.tgz:
	$(TAR) czf $@ $(ALLOBJS)

css20.zip:
	$(ZIP) $@ $(ALLOBJS)

$(PROPERTYDB): $(SPECSRCS)
	@if [ ! -d build ]; then mkdir build;fi
	$(MKANCHDB) index-def - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

$(VALUEDB): $(SPECSRCS)
	$(MKANCHDB) value-def - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

index.html: build/index.srb
build/index.srb: $(SPECOBJS)
	$(MKIDX) $@ build/index/*

cover.html: cover.src build/contents.srb
	$(HIPP) $(INCLUDES) $< $@

build/contents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS)
	$(MKTOC) $@ $(HEADINGDB) $(MAINSRCS) $(INDEXSRCS) $(APPSRCS)
$(HEADINGDB): build/contents.srb

# simpler rules for special pages
index.html: index.src
	$(HIPP) $(INCLUDES) $< - | \
	$(ADDNAVBAR) -r $@ - "cover.html#toc" index.html $@

clean:
	$(RM) $(SPECOBJS) $(SPECIALOBJS) $(INDEXES) build/* css20.*

realclean: clean
	$(RM) -rf $(PSDIR)

depend:
	$(HMKDEPEND) $(SPECOBJS) $(SPECIALOBJS) 

##### The following is automatically generated. Do not edit!! ####
