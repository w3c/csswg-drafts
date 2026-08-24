# Lightness comparison diagram generator

Regenerates `css-color-4/images/oklab-Lr-vs-L.svg`: a diagram plotting
Oklrab lightness Lr, and CIELab lightness L* (for neutral grays), against
Oklab lightness L — using [colorjs.io](https://colorjs.io) for the
conversions — to show how closely the Oklrab toe function approximates
CIELab lightness.

## Usage

```
npm install
node generate.mjs
```

This overwrites the SVG file in `../../images/`. Diff/review before committing.

## Notes

- Both curves are sampled at points evenly spaced in Oklab L, found by
  binary search over the gray value (R=G=B, sRGB linear-light) whose
  Oklab L matches each sample point.
- Lr comes from `Color.to("oklrab").coords[0]`, which applies the same
  toe() constants (K1=0.206, K2=0.03, K3=(1+K1)/(1+K2)) as
  `../../deltaEOKr2.js`.
- The script finds the point of largest gap between Lr and L* itself and
  prints it (also used to place the in-plot callout) — no magic numbers
  to keep in sync by hand.
