# Makefile to generate the CSS2 document based on its "source files"
# Arnaud Le Hors - lehors@w3.org
# $Id: Makefile,v 1.10 1997-08-14 00:32:48 ian Exp $

ROOT = .

# the following files are part of the CSS specification
SRCS0 = \
$(ROOT)/cover.src\
$(ROOT)/cover-short.src

SRCS1 = \
about.src\
tutorial.src\
cssdesgn.src\
convent.src\
syndata.src\
doctree.src\
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
conform.src \
refs.src

APPSRCS = \
sample.src\
changes.src\
notes.src\
grammar.src

INDEXSRCS= \
index.src

MAINSRCS = $(SRCS1)

MAINOBJS = \
cover.html\
cover-short.html\
about.html\
tutorial.html\
cssdesgn.html\
convent.html\
syndata.html\
doctree.html\
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
conform.html\
refs.html

APPENDIXES= \
sample.html\
changes.html\
notes.html\
grammar.html

INDEXES= \
index.html

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
ADDHANCH= $(PERL) ./bin/addhanch -n -ml 4
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
# make sub table of contents
MKSUBTOC= $(PERL) ./bin/mksubtoc
# insert subtoc
INSAFTER= $(PERL) ./bin/insafter
# add link
ADDLINKS= $(PERL) ./bin/addlinks

# utility to generate the PostScript version
HTML2PSARGS= -n -D -R
HTML2PS= $(PERL) html2ps

# include paths
INCLUDES= -Ibuild -I.

RM= rm -fr
CP= cp
TAR= tar
ZIP= zip
LN= ln

.SUFFIXES: .src .html .srb 

.src.html:
	@if [ ! -d build/index ]; then mkdir -p build/index; fi
	echo "<div class=\"subtoc\"><p><strong>Contents</strong>" \
		> build/subtoc.$$$$; \
	$(MKSUBTOC) -r $@ -l 2 - $(HEADINGDB) $< >> build/subtoc.$$$$; \
	echo "</div>" >> build/subtoc.$$$$; \
	$(HIPP) $(INCLUDES) $< - | $(ADDHANCH) -r $< - - $(HEADINGDB) | \
	$(ADDIDXANCH) -r $< - - build/index/$<.db | \
	$(ADDLINKS) -r $< - - propinst $(PROPERTYDB) value-inst $(VALUEDB) | \
	$(ADDNAVBAR) -r $@ - - contents "cover.html#toc" index index.html| \
	$(INSAFTER) - build/subtoc.$$$$ /H1 $@; \
	$(RM) build/subtoc.$$$$


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
	$(HTML2PS) $(HTML2PSARGS) $(MAINOBJS) $(APPENDIXES) $(INDEXES) > $@

txt $(PSDIR)/css20.txt: $(PSDIR)
	(cd $(PSDIR); $(MAKE) css20.txt ADDNAVBAR="$(PERL) ./bin/fakenavbar")

css20.html: $(PROPERTYDB) $(VALUEDB) $(HEADINGDB) $(SPECOBJS) $(INDEXES) 
	$(HTMLCAT) $@ $(MAINOBJS) $(APPENDIXES) $(INDEXES) 

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
	$(MKANCHDB) propdef - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

$(VALUEDB): $(SPECSRCS)
	$(MKANCHDB) value-def - $(SPECSRCS) | sed 's/\.src/\.html/' > $@

index.html: build/index.srb
build/index.srb: $(SPECOBJS)
	$(MKIDX) $@ build/index/*

cover.html: cover.src cover-info.src build/contents.srb
	$(HIPP) $(INCLUDES) $< - | \
 $(ADDNAVBAR) -bottom -hr -next -r $@ - $@ "Go to the table of contents" "#toc"

cover-short.html: cover-short.src cover-info.src build/contents-short.srb
	$(HIPP) $(INCLUDES) $< - | \
 $(ADDNAVBAR) -bottom -hr -next -r $@ - $@ "Go to the table of contents" "#toc"

build/contents.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS)
	$(MKTOC) 5 $@ $(HEADINGDB) $(MAINSRCS) $(APPSRCS) $(INDEXSRCS) 
$(HEADINGDB): build/contents.srb

build/contents-short.srb: $(MAINSRCS) $(INDEXSRCS) $(APPSRCS)
	$(MKTOC) 4 $@ $(HEADINGDB) $(MAINSRCS) $(APPSRCS) $(INDEXSRCS) 


# simpler rules for special pages
index.html: index.src
	$(HIPP) $(INCLUDES) $< - | \
	$(ADDNAVBAR) -r $@ - $@ contents "cover.html#toc" 

clean:
	$(RM) $(SPECOBJS) $(SPECIALOBJS) $(INDEXES) build/* css20.*

realclean: clean
	$(RM) -rf $(PSDIR)

depend:
	$(HMKDEPEND) $(SPECOBJS) $(SPECIALOBJS) 

##### The following is automatically generated. Do not edit!! ####
