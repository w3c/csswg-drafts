# Oklch primaries/secondaries diagram generator

Regenerates `css-color-4/images/{sRGB,P3,a98,prophoto,2020}-prim-sec-oklch.svg`:
diagrams plotting each predefined RGB color space's primaries and secondaries
on the Oklab a,b plane, using [colorjs.io](https://colorjs.io) for the
conversions. These are the Oklch counterparts of the existing CIE Lab
`*-prim-sec.svg` diagrams.

## Usage

```
npm install
node generate.mjs
```

This overwrites the SVG files in `../../images/`. Diff/review before committing.

## Notes

- Every space except sRGB also plots the sRGB gamut as a dashed comparison
  overlay, matching the existing CIE Lab diagrams.
- A legend table (red/green/blue + L/C/H, then cyan/magenta/yellow + L/C/H)
  is drawn below the plot.
- If a diagram's aspect ratio changes (e.g. from adding/removing a very
  saturated primary), update the corresponding `<img width height>` values
  in `Overview.bs` to match — the script prints each file's computed
  width/height when it runs.
