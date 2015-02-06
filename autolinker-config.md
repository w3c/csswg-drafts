Autolinker Config File
======================

This is the autolinker config file,
which provides the base defaults for where to link certain terms to.
You can override these defaults on a per-spec basis by adding a "Link Defaults" metadata entry to your spec,
or on a per-link basis by specifying `for` and/or `spec` attributes on the link.
(See the [documentation](https://github.com/tabatkins/css-preprocessor/blob/master/docs/definitions-autolinks.md) for more details.)

As you can see, this config file is also a valid Markdown file.
It hijacks certain Markdown constructs for its own purposes.

Any second-level heading (written either with a leading/trailing `##` or a line of dashes on the following line)
must be the versioned shortname of a spec.

Inside each section, bulleted lists give the terms that should default to linking to the given spec.
This uses the same automatic type detection as the `for=''` attribute on autolinks:
`<foo>` is a type, `@foo` is an at-rule, `@foo/bar` is a descriptor (the 'bar' descriptor for @foo), and a plain word is a property.

To give default definition targets for any other type of definition,
you can provide a third-level heading (written with a leading/trailing `###`)
containing the name of a definition type.
The terms in the bulleted lists in these subsections do not use auto-detection.

For types that require `for=''` attributes on their definitions,
you must also provide this information in their heading.
Just follow the type name with "for foo",
like `### value for width` or `### method for CSSKeyframeRule`.

Any other Markdown besides these constructs
(second and third-level headings, bulleted lists)
will be ignored, and can be used for documentation purposes,
as this introduction is doing.

Some final notes:

1. There is no need to add everything to this file. This file only needs to be augmented when a definition appears in multiple specs, and there's a single generally correct place that *all* specs should link to.
2. Please keep the specs in alphabetical order, so it's easier to add to.
3. If you're augmenting this to fix the spec you're working on, you need to first commit this file to the repo, then update the preprocessor with `preprocess --update` so it picks up the new config file.

css21
-----
* display
* width
* height
* line-height

css-align-3
-----------
* align-self
* align-content
* align-items
* justify-self
* justify-content
* justify-items

css-break-3
-----------
* break-before
* orphans

css-color-3
-----------
* <color>

css-content-3
-------------
* content

css-fonts-3
-----------
* font
* font-family
* font-size
* font-style
* font-variant
* font-weight

css-images-3
------------
* <image>

css-lists-3
-----------
* list-style
* list-style-image
* list-style-position
* list-style-type

css-syntax-3
------------
* <integer>

css-text-3
----------
* text-align

css-values-3
------------
* <url>
* <string>
* <integer>
* <number>
* <percentage>
* <length>
* <angle>
* <resolution>

css-writing-modes-3
-------------------
* direction
* unicode-bidi


Specialized Data
================

Below this section are some specialized data sections that use the same constructs as the above,
but mean something slightly different.
Each one has slightly different rules.

Ignored Specs
-------------

List in this section specs which should be removed from lists when there's a conflict -
they'll only be linked to when you specify it explicitly,
or they're the sole definition of the term.

* css-backgrounds-4
* css-box-3
* css-text-4
* css-inline-3
* css-page-4
* css-template-1
* css3-tables
* css1

CSS 2.1 Replacements
--------------------

List in here specs which are fully replacing 2.1 -
if there's a conflict, and one of these specs are in the list,
2.1 will be removed from the list.
Just list the earliest version of each module that fully replaces 2.1.

* css-backgrounds-3
* css-break-3
* css-color-3
* css-counter-styles-3
* css-display-3
* css-fonts-3
* css-images-3
* css-images-4
* css-lists-3
* css-overflow-3
* css-position-3
* css-syntax-3
* css-text-3
* css-text-decor-3
* css-ui-3
* css-writing-modes-3


"Fake Spec" Linking Data
========================

Use headings like "Custom [spec-name]  [spec-url]" to set up custom (non-Shepherd) links.
The [spec-name] is only used to disambiguate;
the important bit is the url.

Follow each by a list of links, of the form "[term]  ([type])  [hash]".


Custom css-fake-spec-1 http://dev.w3.org/csswg/css-fake-spec
------------------------------------------------------------
* foo bar (dfn) #foobar

Custom respimg-usecases-1 http://usecases.responsiveimages.org/
---------------------------------------------------------------
* art direction (dfn) #art-direction
