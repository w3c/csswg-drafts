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
* width
* height
* line-height

css-backgrounds-4
-----------------
* border-top-width
* border-left-width
* border-right-width
* border-bottom-width

css-break-3
-----------
* break-before
* orphans

css-fonts-3
-----------
* font
* font-size
* font-style
* font-variant
* font-weight

css-images-3
------------
* <image>

css-lists-3
-----------
* list-style-position

css-syntax-3
------------
* <integer>

css-text-3
----------
* text-align

css-writing-modes-3
-------------------
* direction
* unicode-bidi