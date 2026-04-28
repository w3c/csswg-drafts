# `font-palette` and `@font-palette-values`

## Authors

* Dominik Röttsches, [@drott](drott@chromium.org)

## Introduction ##

The `font-palette` CSS property allows selecting a palette
from a vector color font.
In combination with the `@font-palette-values` at-rule,
custom palettes can be defined.
`font-palette` can increase efficiency of color font uses,
as no server roundtrip is needed
for changing the colors of the font.
Use cases are listed below.

## Technical background

Color fonts in formats such as COLRv0 and COLRv1
allow control over their palette
by means of the [`CPAL` OpenType table](https://docs.microsoft.com/en-us/typography/opentype/spec/cpal),
from which the COLR paint tables reference colors.

CPAL specifies a set of palettes,
each with the same number of specified entries.
Each entry is an RGB color value in 8-bit BGRA in sRGB color space.
Individual palettes can be tagged to indicate
that they are usable for a light or dark background respectively.

A COLR/CPAL color font can be displayed in a different set of colors
by selecting a palette from the ones specified in the font,
or by providing a custom palette to the rasterization stage,
for example by starting from a defined palette and overriding
individual palette entries.

[OT-SVG has a mechanism](https://docs.microsoft.com/en-us/typography/opentype/otspec181/svg#color-palettes)
to populate `CPAL` color table color entries
into CSS custom variables
in the form of `--color0`, `--color1` etc..
This allows OT-SVG fonts to reference CPAL entries as well,
in addition to existing ways of specifying color in SVG.

# Use cases #

1. I want to select a color scheme of my color font that works well with light mode or dark mode.

2. I want to select one of the font designer provided color schemes that come with my font.

3. I want to adapt a color font to my page design and override colors so that colors in page and font harmonize.

# Non-Goals #

`font-palette` is not intended to work with bitmap color fonts.

# Proposed Syntax #

See
[9.1. Controlling Color Font Palettes: The font-palette property](https://www.w3.org/TR/css-fonts-4/#font-palette-prop)

# Examples #

## Use Case 1: Select light or dark-mode suitable palette ##


```CSS
@font-face {
  font-family: MyVectorColorFont;
  src: url(MyColorFont.woff2) tech(color-COLRv0);
}

@media (prefers-color-scheme: dark) {
  .font-colors: { font-palette: light; }
}

@media (prefers-color-scheme: light) {
  .font-colors: { font-palette: dark; }
}
```

## Use Case 2: Select available palette ##

```CSS
@font-face {
  font-family: MyVectorColorFont;
  src: url(MyColorFont.woff2) tech(color-COLRv0);
}

@font-palette-values --SelectedPalette {
  font-family: MyVectorColorFont;
  base-palette: 3;
}

.palette-selection {
  font-palette: --SelectedPalette;
}
```

## Use Case 3: Custom colors ##

```CSS
@font-face {
  font-family: MyVectorColorFont;
  src: url(MyColorFont.woff2) tech(color-COLRv0);
}

@font-palette-values --OverriddenColors {
  font-family: MyVectorColorFont;
  base-palette: 0;
  override-colors: 0 rgb(127, 63, 49),
                   1 rgb(70, 60, 50),
                   2 rgba(0, 30, 30, 30);
}

.palette-selection {
  font-palette: --OverriddenColors;
}
```
