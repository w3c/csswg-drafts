// Regenerates the Oklrab Lr / CIELab L* vs Oklab L diagram under
// css-color-4/images/oklab-Lr-vs-L.svg
//
// Usage:
//   cd css-color-4/workings/lightnesses
//   npm install
//   node generate.mjs
//
// Plots two lightness curves against Oklab L, both parametrized by a
// neutral gray (R=G=B, sRGB linear-light value v):
//   - Lr, the toe-adjusted lightness of the Oklrab color space
//     (Color.to("oklrab").coords[0] — same toe() as ΔEOKr2, see
//     ../../deltaEOKr2.js)
//   - CIELab L* (Color.to("lab").coords[0] / 100), which Lr is designed
//     to approximate
// against the identity line Lr = L, to show how closely the toe
// approximates CIELab lightness.

import Color from "colorjs.io";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, "..", "..", "images");
const OUT_FILE = join(IMAGES_DIR, "oklab-Lr-vs-L.svg");

// ---- sample the curves, evenly spaced in Oklab L ----

function oklabLFromGray(v) {
	return new Color("srgb-linear", [v, v, v]).to("oklab").coords[0];
}

// Binary search for the gray value v whose Oklab L equals `target`
// (Oklab L is monotonic in v for neutral grays).
function grayForOklabL(target) {
	let lo = 0, hi = 1;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (oklabLFromGray(mid) < target) lo = mid; else hi = mid;
	}
	return (lo + hi) / 2;
}

const N = 200;
const points = []; // { L, Lr, labL }
for (let i = 0; i <= N; i++) {
	const L = i / N;
	const v = (L === 0) ? 0 : (L === 1) ? 1 : grayForOklabL(L);
	const gray = new Color("srgb-linear", [v, v, v]);
	points.push({
		L,
		Lr: gray.to("oklrab").coords[0],
		labL: gray.to("lab").coords[0] / 100,
	});
}

// Point of largest gap between Lr and L* — used for the in-plot callout.
const largestGap = points.reduce((max, p) =>
	Math.abs(p.Lr - p.labL) > Math.abs(max.Lr - max.labL) ? p : max
);

// ---- plot geometry (fixed 0-1 axes, pixel space) ----

const x0 = 60, x1 = 500, y0 = 460, y1 = 70;
const toPx = (x, y) => [
	(x0 + x * (x1 - x0)).toFixed(2),
	(y0 + y * (y1 - y0)).toFixed(2),
];

const lrPolyline = points.map(p => toPx(p.L, p.Lr).join(",")).join(" ");
const labPolyline = points.map(p => toPx(p.L, p.labL).join(",")).join(" ");

const [gapLrX, gapLrY] = toPx(largestGap.L, largestGap.Lr);
const [gapLabX, gapLabY] = toPx(largestGap.L, largestGap.labL);
const calloutTextX = Number(gapLrX) + 65;
const calloutLrY = Number(gapLrY) - 26;
const calloutLabY = Number(gapLabY) - 22;

console.log(`Largest Lr/L* gap: ${Math.abs(largestGap.Lr - largestGap.labL).toFixed(4)} at L = ${largestGap.L.toFixed(3)}`);

// ---- SVG ----

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 520" width="560" height="520">
<desc>Line chart plotting Oklrab lightness Lr, and CIELab lightness L* (for
neutral grays), against Oklab lightness L, compared against the identity
line Lr = L. Both curves dip below the identity line and closely track
each other, showing that the toe function approximates CIELab lightness;
all three lines meet at (0,0) and (1,1).
</desc>

<rect x="0" y="0" width="560" height="520" fill="white"/>

<g font-family="sans-serif">
<text x="30" y="30" font-size="17" font-weight="bold" fill="black">Oklrab Lr and CIELab L* vs Oklab lightness L</text>
<text x="30" y="49" font-size="12" fill="#52514e">Lr = toe(L) approximates CIELab L* (computed here for neutral grays)</text>
</g>

<!-- legend -->
<g font-family="sans-serif" font-size="12" fill="black">
<line x1="76" y1="94"  x2="94" y2="94"  stroke="#2a78d6" stroke-width="2" stroke-linecap="round"/>
<text x="100" y="98">Oklrab lightness Lr</text>
<line x1="76" y1="116" x2="94" y2="116" stroke="#eb6834" stroke-width="2" stroke-linecap="round"/>
<text x="100" y="120">CIELab lightness L* (gray axis)</text>
</g>

<!-- gridlines -->
<g stroke="#e1e0d9" stroke-width="1">
<line x1="60"  y1="460" x2="60"  y2="70"/>
<line x1="148" y1="460" x2="148" y2="70"/>
<line x1="236" y1="460" x2="236" y2="70"/>
<line x1="324" y1="460" x2="324" y2="70"/>
<line x1="412" y1="460" x2="412" y2="70"/>
<line x1="500" y1="460" x2="500" y2="70"/>

<line x1="60" y1="460" x2="500" y2="460"/>
<line x1="60" y1="382" x2="500" y2="382"/>
<line x1="60" y1="304" x2="500" y2="304"/>
<line x1="60" y1="226" x2="500" y2="226"/>
<line x1="60" y1="148" x2="500" y2="148"/>
<line x1="60" y1="70"  x2="500" y2="70"/>
</g>

<!-- axis baselines -->
<line x1="60" y1="460" x2="500" y2="460" stroke="#c3c2b7" stroke-width="1"/>
<line x1="60" y1="460" x2="60"  y2="70"  stroke="#c3c2b7" stroke-width="1"/>

<!-- x tick labels -->
<g font-family="sans-serif" font-size="11" fill="#898781" text-anchor="middle">
<text x="60"  y="478">0</text>
<text x="148" y="478">0.2</text>
<text x="236" y="478">0.4</text>
<text x="324" y="478">0.6</text>
<text x="412" y="478">0.8</text>
<text x="500" y="478">1.0</text>
</g>

<!-- y tick labels -->
<g font-family="sans-serif" font-size="11" fill="#898781" text-anchor="end">
<text x="50" y="464">0</text>
<text x="50" y="386">0.2</text>
<text x="50" y="308">0.4</text>
<text x="50" y="230">0.6</text>
<text x="50" y="152">0.8</text>
<text x="50" y="74">1.0</text>
</g>

<!-- axis titles -->
<text x="280" y="504" font-family="sans-serif" font-size="12" fill="#52514e" text-anchor="middle">Oklab lightness L</text>
<text x="20" y="265" font-family="sans-serif" font-size="12" fill="#52514e" text-anchor="middle" transform="rotate(-90 20 265)">Lightness (Lr or L*)</text>

<!-- identity reference line Lr = L -->
<line x1="60" y1="460" x2="500" y2="70" stroke="#898781" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>
<text x="430" y="118" font-family="sans-serif" font-size="12" fill="#898781" text-anchor="middle" transform="rotate(-41 430 118)">Lr = L</text>

<!-- Lr = toe(L) curve -->
<polyline fill="none" stroke="#2a78d6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
points="${lrPolyline}"/>

<!-- CIELab L* curve (neutral grays), parametrized to align with Oklab L on the x-axis -->
<polyline fill="none" stroke="#eb6834" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
points="${labPolyline}"/>

<!-- callout at the point of largest gap between Lr and L* -->
<line x1="${gapLrX}" y1="${gapLrY}" x2="${calloutTextX - 5}" y2="${calloutLrY + 4}" stroke="#2a78d6" stroke-width="1"/>
<line x1="${gapLabX}" y1="${gapLabY}" x2="${calloutTextX - 5}" y2="${calloutLabY + 4}" stroke="#eb6834" stroke-width="1"/>
<text x="${calloutTextX}" y="${calloutLrY + 8}" font-family="sans-serif" font-size="11" fill="#52514e">largest gap, L &#8776; ${largestGap.L.toFixed(2)}</text>

</svg>
`;

writeFileSync(OUT_FILE, svg);
console.log(`Wrote ${OUT_FILE}`);
