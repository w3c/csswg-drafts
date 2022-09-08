# `font-tech()` and `font-format()` `<supports-feature>` Extensions to CSS `@supports`

## Authors

* Dominik Röttsches, [@drott](drott@chromium.org)
* Chris Lilley, [@svgeesus](chris@w3.org)
* Jonathan Kew, [@jfkthame](jfkthame@gmail.com)

## Introduction

`font-tech()` and `font-format()` are extensions to the CSS Conditional Syntax
which enable declarative syntax to use a different set of style rules depending
on font format support, as well as programmatic feature detection of
capabilities of the font stack. The latter covers a lack of functionality in web
platform APIs, as most JS APIs and DOM functionality can be easily feature
detected, but the abilities of the font stack could not be queried in that way
so far.

The proposed syntax was introduced following discussion in [TAG review
#666](https://github.com/w3ctag/design-reviews/issues/666) on a previous syntax
for the `src:` descriptor, and subsequent [resolutions in the CSS
WG](https://github.com/w3c/csswg-drafts/issues/6520#issuecomment-947810568) to
harmonize functionality between the `src:` descriptor parsing, and CSS
Conditional behavior with respect to font feature detection. This had been a
[request of the
TAG](https://github.com/w3ctag/design-reviews/issues/666#issuecomment-901220221)
review.

## Use cases

Background: The use cases listed below for are very similar to the `tech()` and
`format()` extensions to parsing the `src:` line of the `@font-face`
declaration, [see
here](https://github.com/w3c/csswg-drafts/blob/main/css-fonts-4/src-explainer.md#use-cases). There,
the focus is on resource loading on the `@font-face` level. Here the focus is
more on more general feature detection outside the `src:` line for progressive
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

See "2. Extensions to the the `@supports` rule" in [CSS Conditionals
5](https://www.w3.org/TR/css-conditional-5/#at-supports-ext).

Examples:

### Use Case 1 - Progressive Enhancement with color fonts

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

```
let vectorColorFontsAvailable = CSS.supports("font-tech(color-COLRv1)") || 
                                CSS.supports("font-tech(color-COLRv0)") || 
                                CSS.supports("font-tech(color-SVG)");

```
