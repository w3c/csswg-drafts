# The @font-face src descriptor

## Authors

* Chris Lilley, [@svgeesus](chris@w3.org)
* Dominik Röttsches, [@drott](drott@chromium.org)

## Introduction

The `@font-face` rule is used
to automatically download Web Fonts on demand,
and use them for rendering
without the user having to install them.
The fonts are discarded after use,
and do not become installed fonts.

The `src` descriptor contains the url of the font to be downloaded,
plus additional metadata so that unsuitable or
unusable fonts are not wastefully downloaded.

Other descriptors include the font family name,
the range of font weights supported,
the range of Unicode characters supported by the font,
and so on.
These are used for matching styling requests (properties)
to available Web Fonts.

For example,

    @font-face {
        font-family: "Foo";
        src: url(https://example.org/Foo.baz);
    }
    h1 {
        font-family: "Foo", serif;
    }


## History of @font-face

Originally [introduced in 1997](https://www.w3.org/TR/WD-font-970721)
and then [merged into CSS2](https://www.w3.org/TR/2008/REC-CSS2-20080411/fonts.html#referencing),
@font-face was implemented as far back as
Internet Explorer 3 (with the EOT font format).

Although consensus was reached on the CSS syntax,
there was no consensus on the font format to use.
Embedded OpenType (from Microsoft and AGFA),
Truedoc Portable Font Resource (from Bitstream and Netscape),
and SVG Fonts (W3C)
were all used by early implementations.
It was therefore necessary for the src descriptor to indicate
the font format, in addition to the url.

At the time there were no MIME types for fonts,
and significant resistance at IETF and IANA to adding a font top-level type.

> I initially planned to use MIME types there, but given significant resistance to the idea of a font/* top level type we went with the 'format' string as a temporary workaround. Temporary meaning two decades or so. [source](https://github.com/w3c/csswg-drafts/issues/633#issuecomment-340527309)

Relying on filename extensions would also have been fragile,
so the original proposal used string-based
[format hints](https://www.w3.org/TR/WD-font-970721#src).

    @font-face {
        font-family: "Foo";
        src: url(https://example.org/Foo.pfr) format("truedoc-pfr");
    }

Lack of a common format crippled interoperability
and resulted in minimal uptake of this feature.
When development of CSS 2.1 began in 2002,
@font-face (and its associated descriptors)
were dropped from the specification.

In 2010, the [FPWD of WOFF 1.0](https://www.w3.org/TR/2010/WD-WOFF-20100727/)
heralded convergence on a Web font format,
and @font-face was re-introduced with
[CSS Fonts 3 in 2011](https://www.w3.org/TR/2011/WD-css3-fonts-20111004/).

By 2018, when CSS Fonts 3
[became a Recommendation](https://www.w3.org/TR/2018/REC-css-fonts-3-20180920/),
support for [@font-face with a src descriptor](https://www.w3.org/TR/2018/REC-css-fonts-3-20180920/#src-desc)
and a defined set of format strings was universal
in Web browsers and in CSS to PDF converters.

In parallel, WOFF 1.0 was being smoothly replaced by
[WOFF 2.0](https://www.w3.org/TR/2021/REC-WOFF2-20210706/),
fallback being provided by multiple urls and format hints
in the src descriptor:

    /* load WOFF 2.0 font if possible, otherwise use WOFF 1.0 font */
    @font-face {
      font-family: something;
      src: url(example.woff2) format("woff2"),
           url(example.woff) format("woff");
    }

Usage of WebFonts has taken off,
from near-zero in 2011
to 80% of all websites in 2020.

![Growth in Web Font usage](https://www.w3.org/TR/2020/NOTE-PFE-evaluation-20201015/images/2020-07-22_Web_Font_Usage.png)

This success has enabled the use of fonts on the web
to be further refined and improved,
but also poses a significant long-tail Web-compatibility issue
if any changes are made to this src descriptor.

_Further historical background may be found in the
introductory sections of the
[Progressive Font Enrichment Evaluation Report](https://www.w3.org/TR/2020/NOTE-PFE-evaluation-20201015/)_

## History of font technologies

Early fonts contained raster bitmaps at various sizes.
These were soon improved by adding vector outlines of the glyphs,
although sadly with multiple, competing, non-interoperable technologies.
PostScript™ Type 1 outlines, from Adobe,
were soon joined by TrueType™ outlines, from Apple
(to say nothing of less successful vector outlines such as Speedo or Intellifont).

The typographic and layout capabilities of fonts were also improved,
with TrueType GX and AApple Advanced Typography from Apple,
OpenType from Microsoft,
and Graphite from SIL.
At first, these were used in print
and in native applications,
but the Web lagged behind in typographic richness.

CSS Fonts 3
[opened up these font features to CSS](https://www.w3.org/TR/css-fonts-3/#font-rend-props),
primarily focussing on OpenType.
That specification sadly notes the limitation of the format hint
in ensuring a downloaded font has the desired features:

> Given the overlap in common usage between TrueType and OpenType [OPENTYPE], the format hints "truetype" and "opentype" must be considered as synonymous; a format hint of "opentype" does not imply that the font contains Postscript CFF style glyph data or that it contains OpenType layout information

Font formats continued to evolve;
OpenType 1.7 added
[color font support](https://docs.microsoft.com/en-us/typography/opentype/otspec170/)
although sadly, as implementation largely preceded standardization,
there were four different ways
each largely tied to a single vendor, OS, or browser.
OpenType 1.8, with rather more coordination, added
[font variations](https://docs.microsoft.com/en-us/typography/opentype/otspec180/)
which was rapidly adopted at both the OS and browser level.

The [FPWD of CSS Fonts 4](https://www.w3.org/TR/2017/WD-css-fonts-4-20170711/)
in 2017
continued to refine font features
and added support for [variable fonts](https://www.w3.org/TR/css-fonts-4/#font-variation-props)
and [color fonts](https://www.w3.org/TR/css-fonts-4/#color-font-support).
It was becoming clear, however,
that the format hint was insufficient by itself
and that combinatorial explosion would result
(formats such as "opentype-variation" were briefly specified,
but "opentype-variation-SVG-Graphite" would become
unwieldy and error-prone).

With the upcoming [COLRv1 color font format](https://github.com/googlefonts/colr-gradients-spec/),
selection of the right font resource and detectability are once again
important use cases which have been requested by early adopters of COLRv1,
similar to the need to detect availability and prefer such font resources at the time
when variable fonts were introduced.

## Use cases

1. I want to use color fonts,
but browser A supports only color font format X,
while browser B supports color font format Y
in older versions
and both X and Y in newer versions.
However, color fonts are large,
so putting both X and Y in one font increases download size unacceptably.
All fonts are in "opentype" format,
so the font format by itself cannot be used to make the choice.

  ![Please work](https://www.w3.org/TR/css-fonts-4/images/please.png)

2. A minority language is best supported by Graphite features,
but Graphite is only implemented in Firefox.
For Chrome and Safari, I want to fall back to OpenType features.
Both fonts are in "opentype" format,
so again the font format by itself cannot be used to make the choice.

3. I want to know programmatically in my script code what level of font support is available.

Where 3. is in line in line with the TAG design principles, which recommend
[detectability of a feature](https://w3ctag.github.io/design-principles/#feature-detect).

## Non-Goals

This proposal is not intended as a server-side content negotiation solution. In
many cases, third-party font providers currently choose based on User Agent
which resources they deliver to clients at the time of the request to the
included CSS. This is a different content negotiation mechanism from what is
discussed in this proposal.

## Design constraints & alternative solutions

### Backwards compatibility

The largest constraint is that older browsers must continue
to successfully parse the src descriptor,
and to end up ignoring links to fonts containing unsupported features,
while following the desired link to the fallback.

This was discussed in 2016, in Issue 663 [@font-family src: should accept a specifier which lists font requirements](https://github.com/w3c/csswg-drafts/issues/633)
and again in 2018, in Issue 2540 [Content authors want to modify style based on the presence of color fonts](https://github.com/w3c/csswg-drafts/issues/2540)

There were various proposals, such as an additional "features" function using OpenType table names:

    @font-face {
      font-family: heading-font;
      src: url(fancy-font.woff2) format("woff2") features("CPAL,FVAR"),
            url(fallback-font.woff2) format("woff2"),
            url(fallback-fallback-font.woff) format("woff"),
            url(how-old-is-your-browser-font.ttf) format("ttf");
    }

but that was unacceptable because of backwards compatibility
(older browsers would drop the _entire_ src descriptor,
not just the first element in the comma-separated list),
and also a desire to avoid microsyntaxes which:

> wreak havoc on object models [source](https://github.com/w3c/csswg-drafts/issues/633#issuecomment-372928475)

Thus, it was [resolved](https://github.com/w3c/csswg-drafts/issues/633#issuecomment-380469287) in 2018 to put the extra "supports" requirements inside the parentheses of the format hint, but without string concatenation.

### Strings vs. Keywords

There was also Issue 6340 [Drop bracket matching step from @font-face src: line parsing](https://github.com/w3c/csswg-drafts/issues/6340), resolved in June 2021,
about whether to do parenthesis matching before splitting the value of the src descriptor on commas.

The original format hints were strings, although limited to a defined set.
In CSS Fonts 4, either strings or keywords may be used for the format.
The new font technology specifiers are keywords.
There is an open Issue 6328 [@font-face src: url() format() keywords vs. strings ambiguous in spec](https://github.com/w3c/csswg-drafts/issues/6328) regarding how to serialize this.

An alternative solution to putting supports inside format is proposed in Issue 6520 [Nesting of @supports inside @font-face](https://github.com/w3c/csswg-drafts/issues/6520).

### Detectability

Detecting font capabilities of the UA programmatically proves difficult due to
no direct mapping of font technologies to `CSS.supports()`.

Testing of font capabilities is possible through probing for rendered pixels on
a 2D canvas and testing for RGB color values, as done in @RoelN's
[Chromacheck](https://pixelambacht.nl/chromacheck/) tool. However, this is an
extremely wasteful approach, requiring canvas resources for something that can
be returned by the UA and detected more efficiently.

## Proposed Syntax

See
[4.3.1 Parsing the src descriptor of the CSS Fonts Level 4 spec](https://drafts.csswg.org/css-fonts-4/#font-face-src-parsing)

## Examples

With the introduction of the `supports` part, the use cases 1 and 2 are then solved
using [the current syntax](https://drafts.csswg.org/css-fonts-4/#src-desc)
as follows:

### Use Case 1: Color Fonts


```CSS
/* 1. prefer COLRv1, then SVG-in-OpenType, then COLRv0 */
@font-face {
  font-family: jewel;
  src: url(jewel-v1.woff2) format("woff2" supports COLRv1),
        url(jewel-svg.woff2) format("woff2" supports SVG),
        url(jewel-v0.woff2) format("woff2" supports COLRv0),
        url(boring.ttf) format("woff2");
}
```

### Use Case 2: Graphite Preference

```CSS
/* 2. prefer Graphite over OpenType layout, if supported */
@font-face {
  font-family: rare;
  src: url(rare-graphite.otf) format("opentype" supports features(graphite)),
        url(rare.otf) format("opentype" supports features(opentype)),
        url(fallback.ttf) format("truetype");
}
```

### Use Case 3: Detectability

The wording of the current specification currently reads:

> If a component value is parsed correctly and is of a format and font
> technology that the UA supports, add it to the list of supported sources. If
> parsing a component value results in a parsing error or its format or
> technology are unsupported, do not add it to the list of supported sources.

Using this rule, availability of a particular font technology
can be programmatically tested for
by evaluating a `@font-face` rule and
accessing its result `src:` descriptor value.
Without downloading any font resources,
knowledge about technology support can be retrieved.

```HTML
<style>
  @font-face {
    font-family: a;
    src: url(/FEATURETESTVAR) format(woff2 supports variations);
  }
</style>
<script>
  window.onload = () => {
    var variations_supported = document.styleSheets[0].cssRules[0].cssText.includes("FEATURETESTVAR")
        ? "Variations supported." : "Variations NOT supported.")
    console.log("Variations supported: " + variations);
  }
</script>
```
