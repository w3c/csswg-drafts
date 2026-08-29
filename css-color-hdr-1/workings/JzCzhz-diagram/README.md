# Jzazbz primaries/secondaries diagram generator

Regenerates `css-color-hdr-1/images/2020-prim-sec-JzCzHz.svg`: a diagram
plotting the rec2020 primaries and secondaries on the Jzazbz az,bz plane,
with the sRGB gamut shown as a dashed comparison overlay and a Jz/Cz/hz
legend table below the plot. (This is the sibling of
`css-color-4/workings/oklch-prim-sec/`, which does the same thing for
Oklab, but Jzazbz isn't in colorjs.io so the source Jz/Cz/hz and az/bz
values are hardcoded in the script instead of computed live.)

## Usage

```
node generate.mjs
```

No dependencies — the Jz/Cz/hz and az,bz values were computed once (see
`../../jzazbz.js` for the conversion formulas) and are hardcoded at the
top of `generate.mjs`. This overwrites `../../images/2020-prim-sec-JzCzHz.svg`.
Diff/review before committing.

## Notes

- If the underlying Jz/Cz/hz values ever need recomputing (e.g. a change
  to the Jzazbz conversion), redo the conversion for rec2020 and sRGB's
  red/green/blue/cyan/magenta/yellow and update the `rec2020` / `srgb`
  tables in `generate.mjs`; the plot framing, legend layout, and axis
  labels are all generated automatically from those values.
- If the diagram's aspect ratio changes, update the `<img width height>`
  values wherever this file is referenced (currently not referenced from
  `Overview.bs`).
