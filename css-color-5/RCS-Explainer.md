# Explainer: Relative Color Syntax

## Author

- Chris Lilley, W3C

## Participate
- [CSS Color 5 Issue tracker](https://github.com/w3c/csswg-drafts/issues?q=is%3Aopen+is%3Aissue+label%3Acss-color-5)

## Introduction

Create colors in CSS by starting from some other color, and modifying it.

## Motivating Use Cases

Creation of a range of colors, starting from a base color.
When the base color changes, the other colors update automatically.

## User research

Historically, this sort of color palette creation was performed server-side
using a CSS pre-processor such as **Sass**,
which provides functions to extract the HSL
hue, saturation and lightness components of a color
which can then be manipulated
before being re-combined in a new color.

Although popular there are a number of downsides:

- colors are statically generated server-side, so cannot react to animations or scripts
- manipulation is limited to the HSL color model, which is not perceptually uniform

## Relative Color Syntax

Specified as [part of CSS Color 5](https://drafts.csswg.org/css-color-5/#relative-colors),
RCS modifies the grammar of the various color syntaxes in CSS Color 4
to add an optional **origin color**
and **channel keywords** which are manipulated, using CSS
[mathematical functions](https://drafts.csswg.org/css-values-4/#math) such as `calc`
to create new colors.

Typically, the origin color uses **CSS variables**.

```css
--darker-accent: oklch(from var(--mycolor) calc(l / 2) c h);
--complement: oklch(from var(--mycolor) l c calc(h + 180));
```

- colors are dynamic, and react to changes in the origin color as it is animated or changed through script
- any color model from CSS can be used; perceptually uniform models such as **Oklab** and **Oklch** work well
- there is no need to make the origin color and the created relative color use the same color space; conversion happens on the fly

## Stakeholder Feedback / Opposition

The CSS WG [cleared RCS to ship before CR](https://github.com/w3c/csswg-drafts/issues/7978)

- [WebKit] : Positive, [shipping in Safari 16.4](https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes#New-Features) onwards
- [Gecko] : [Positive](https://mozilla.github.io/standards-positions/), and[Implementation for this will start soonish](https://github.com/mozilla/standards-positions/issues/841)
- [Chromium] : [Positive](https://chromestatus.com/feature/5205844613922816), implemented behind a flag

- [WPT results for RCS](https://wpt.fyi/results/css/css-color/?label=master&label=experimental&aligned&q=relative)
- [CanIUse relative colors](https://caniuse.com/css-relative-colors)

