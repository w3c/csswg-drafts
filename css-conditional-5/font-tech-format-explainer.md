# `font-tech()` and `font-format()` `<supports-feature>` Extensions to CSS `@supports`

## Authors

* Dominik Röttsches, [@drott](drott@chromium.org)
* Chris Lilley, [@svgeesus](chris@w3.org)
* Jonathan Kew, [@jfkthame](jfkthame@gmail.com)

## Introduction

`font-tech()` and `font-format()` are extensions to the `@supports` rule CSS
Conditional Syntax.  As such they enable declarative syntax for applying a
different set of style rules depending on font format support. When used through
the `CSS.supports()` method, they also enable programmatic feature detection of
capabilities of the font stack. The latter covers a lack of functionality in web
platform APIs because most JS APIs and DOM functionality can be easily feature
detected, but the abilities of the font stack could not be queried in that way
so far.

The proposed syntax was introduced following discussion in [TAG review
#666](https://github.com/w3ctag/design-reviews/issues/666) on a previous syntax
for the `src:` descriptor on `@font-face`, and subsequent [resolutions in the
CSS WG](https://github.com/w3c/csswg-drafts/issues/6520#issuecomment-947810568)
to harmonize functionality between the `src:` descriptor parsing, and CSS
Conditional behavior with respect to font feature detection. This had been a
[request of the
TAG](https://github.com/w3ctag/design-reviews/issues/666#issuecomment-901220221)
review. The syntax between the `src:` line and the `font-*()` conditional
functions differs insofar as in the `src:` descriptor it is clear that the
context is font-related, so the `font-` prefix is dropped, compare `font-tech()`
vs `tech()`, and `font-format()` vs. `format()`. But the single keyword
arguments to these functions are kept in sync between the two specifications.

The intention of such a syntax and feature detection is to be able to determine
whether a UA supports the different technologies that may be required by a
specific font file.

From a mime type and file signature point of view [OpenType font
files](https://docs.microsoft.com/en-us/typography/opentype/spec/otff#table-directory)
all appear the same. However, because the OpenType font file is a container
format, such a font file can make use a number of different font technologies
that have evolved over the years (
[history](https://github.com/w3c/csswg-drafts/blob/main/css-fonts-4/src-explainer.md#history-of-font-technologies).
So the file signature or mime type for font files is not sufficient to identify
whether a UA's font stack would support it. Instead it is necessary to
distinguish what text layout (OpenType, AAT, Graphite) or rasterization
technologies (TrueType contours, variations, bitmap color font formats, vector
color font formats etc.) are used by the respective font file.

## Use cases

Background: The use cases listed below are very similar to the `tech()` and
`format()` extensions to parsing the `src:` line of the `@font-face`
declaration, [see
here](https://github.com/w3c/csswg-drafts/blob/main/css-fonts-4/src-explainer.md#use-cases). There,
in the src: descriptor, the focus is on resource loading on the `@font-face`
level. Here the focus is more on more general feature detection for progressive
enhancement through style rule or programmatic detection of feature support.

1. I want to progressively enhance my site depending on font format capabilities
of the UA. Examples: If OpenType variations are supported, I want to use a set
of different style rules than when variations are not available. If color font
support is available, I want to enhance my site with a color fonts plus style
rules affecting other parts of my page.

2. I want to know programmatically on the client side in my script code what
   level of font support is available.

Where 2. is in line in line with the TAG design principles, which recommend
[detectability of a feature](https://w3ctag.github.io/design-principles/#feature-detect).

## Non-Goals

This proposal is not intended as a server-side content negotiation solution. In
many cases, third-party font providers currently choose based on User Agent
which resources they deliver to clients at the time of the request to the
included CSS. This is a different content negotiation mechanism from what is
discussed in this proposal.

## Proposed Syntax

See "2. Extensions to the `@supports` rule" in [CSS Conditionals
5](https://www.w3.org/TR/css-conditional-5/#at-supports-ext).

Examples:

### Use Case 1 - Progressive Enhancement with color fonts

By default, use a monochromatic icon font for icons. Only when font support for
colored layers—such as in a COLRv0—font is available, upgrade to a COLRv0 font
with multi-colored glyphs.

Without feature detection, sending a COLRv0 font to a UA with an incompatible
font stack will lead to unexpected and potentially illegible results. Detecting
the feature allows progressive enhancement.

```
.icons {
  font-family: monochromatic_icons;
}

@supports font-tech(color-COLRv0) {
  .icons {
    font-family: colored_icons;
  }
}
```


### Use Case 2 - Programmatic font support detection

If a page wants to dynamically include additional stylesheets or content, it is
desirable to select those based on font technology support to minimize download
size. For example, if vector color font support and palette support is
available, a stylesheet with palette information plus a vector color font may
be loaded. If palette support is missing the stylesheet containing palette
overrides is not needed.

```
if (CSS.supports("font-tech(palettes)") {
  // Load palette stylesheet here.
  if (CSS.supports("font-tech(color-COLRv1)")) {
    // Load COLRv1 font here.
  } else if (CSS.supports("font-tech(color-COLRv0)) {
    // Load COLRv0 font here.
  }
} else {
  // Don't include palette override stylesheet, load monochromatic font here.
}
```