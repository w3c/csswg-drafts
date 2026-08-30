// Regenerates the Oklab a,b-plane primaries/secondaries diagrams under
// css-color-4/images/*-prim-sec-oklch.svg
//
// Usage:
//   cd css-color-4/workings/oklch-prim-sec
//   npm install
//   node generate.mjs
//
// Each diagram plots the RGB primaries (red/green/blue) and secondaries
// (cyan/magenta/yellow) of a predefined color space on the Oklab a,b
// plane (a,b values from colorjs.io, scaled by 100 and with b negated
// for a y-down coordinate system). Every space except sRGB also shows
// the sRGB gamut as a dashed comparison overlay, matching the existing
// sRGB/P3/a98/prophoto/rec2020-prim-sec.svg (CIE Lab) diagrams. An
// 8-column legend table (red/green/blue + L/C/H, cyan/magenta/yellow +
// L/C/H) is drawn below the plot.

import Color from "colorjs.io";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, "..", "..", "images");

const names = ["red", "green", "blue", "cyan", "magenta", "yellow"];
const rgbValues = {
	red: [1, 0, 0], green: [0, 1, 0], blue: [0, 0, 1],
	cyan: [0, 1, 1], magenta: [1, 0, 1], yellow: [1, 1, 0],
};
const fillFor = {
	red: "red", green: "green", blue: "blue",
	cyan: "cyan", magenta: "magenta", yellow: "yellow",
};
const dashedFillFor = {
	red: "#FF000040", green: "#00FF0040", blue: "#0000FF40",
	cyan: "#00FFFF40", magenta: "#FF00FF40", yellow: "#FFFF0040",
};

const SCALE = 100; // scale oklab a,b by 100 for convenient plotting

function computeFor(space) {
	const out = {};
	for (const name of names) {
		const c = new Color(space, rgbValues[name]);
		const [L, C, H] = c.to("oklch").coords;
		const [, a, b] = c.to("oklab").coords;
		out[name] = { L, C, H, cx: a * SCALE, cy: -b * SCALE };
	}
	return out;
}

const srgb = computeFor("srgb");
const f = (n, d = 4) => n.toFixed(d);
const r2 = n => Math.round(n * 100) / 100;

function genDiagram({ spaceId, spaceLabel, legendLabel, showComparison }) {
	const target = computeFor(spaceId);

	// ---- plot area: tight around the data, fixed small padding ----
	const PAD = 6;
	let xs = [], ys = [];
	for (const n of names) {
		xs.push(target[n].cx);
		ys.push(target[n].cy);
		if (showComparison) { xs.push(srgb[n].cx); ys.push(srgb[n].cy); }
	}
	const PLOT_X_MIN = r2(Math.min(...xs) - PAD);
	const PLOT_X_MAX = r2(Math.max(...xs) + PAD);
	const PLOT_Y_MIN = r2(Math.min(...ys) - PAD);
	const PLOT_Y_MAX = r2(Math.max(...ys) + PAD);

	const TICK_STEP = 10;
	function ticksBetween(lo, hi) {
		const out = [];
		for (let v = Math.ceil(lo / TICK_STEP) * TICK_STEP; v <= hi; v += TICK_STEP) {
			if (v !== 0) out.push(v);
		}
		return out;
	}
	const xTicks = ticksBetween(PLOT_X_MIN, PLOT_X_MAX);
	const yTicks = ticksBetween(PLOT_Y_MIN, PLOT_Y_MAX);
	const TICK = 1.5;
	const yAxisTicks = yTicks.map(y => `M-${TICK},${f(y,0)} h${TICK*2}`).join(" ");
	const xAxisTicks = xTicks.map(x => `M${f(x,0)},-${TICK} v${TICK*2}`).join(" ");

	function radialLines(pointsObj) {
		return names.map(n => `<polyline points="0,0 ${f(pointsObj[n].cx)},${f(pointsObj[n].cy)}"/>`).join("\n");
	}
	function dashedCircles() {
		return names.map(n =>
			`  <circle r="1.3" cx="${f(srgb[n].cx)}" cy="${f(srgb[n].cy)}" fill="${dashedFillFor[n]}"/>`
		).join("\n");
	}
	function solidCircles() {
		return names.map(n =>
			`  <circle r="1.3" cx="${f(target[n].cx)}" cy="${f(target[n].cy)}" fill="${fillFor[n]}"/>`
		).join("\n");
	}

	// ---- legend table: 8 columns, 3 rows, placed BELOW the plot ----
	// col groups: [swatch+name, L, C, H] x2  ->  red/green/blue on the left,
	// cyan/magenta/yellow on the right (paired row-wise).
	const LEGEND_FONT = 2.4;
	const CHAR_W = LEGEND_FONT * 0.62; // approx average glyph advance for sans-serif
	const COL_GAP = 3;
	const GROUP_GAP = 8;
	const ROW_H = LEGEND_FONT * 2;
	const SWATCH_R = LEGEND_FONT * 0.45;
	const SWATCH_COL_W = SWATCH_R * 2 + COL_GAP;

	const leftNames = ["red", "green", "blue"];
	const rightNames = ["cyan", "magenta", "yellow"];

	function rowData(n) {
		const p = target[n];
		return {
			name: n,
			L: `${(p.L * 100).toFixed(2)}%`,
			C: f(p.C, 5),
			H: f(p.H, 2),
		};
	}
	const leftData = leftNames.map(rowData);
	const rightData = rightNames.map(rowData);

	function colWidth(rows, key, header) {
		const maxLen = Math.max(header.length, ...rows.map(row => row[key].length));
		return maxLen * CHAR_W + COL_GAP;
	}

	const nameColWLeft = colWidth(leftData, "name", legendLabel);
	const lColWLeft = colWidth(leftData, "L", "L");
	const cColWLeft = colWidth(leftData, "C", "C");
	const hColWLeft = colWidth(leftData, "H", "H");
	const nameColWRight = colWidth(rightData, "name", "");
	const lColWRight = colWidth(rightData, "L", "L");
	const cColWRight = colWidth(rightData, "C", "C");
	const hColWRight = colWidth(rightData, "H", "H");

	const groupLeftW = SWATCH_COL_W + nameColWLeft + lColWLeft + cColWLeft + hColWLeft;
	const groupRightW = SWATCH_COL_W + nameColWRight + lColWRight + cColWRight + hColWRight;
	const TABLE_W = groupLeftW + GROUP_GAP + groupRightW;

	// center the table (and the plot) around x=0
	const TABLE_X0 = r2(-TABLE_W / 2);
	const colSwatchL = TABLE_X0;
	const colNameL = r2(colSwatchL + SWATCH_COL_W);
	const colL_L = r2(colNameL + nameColWLeft);
	const colC_L = r2(colL_L + lColWLeft);
	const colH_L = r2(colC_L + cColWLeft);
	const colSwatchR = r2(colH_L + hColWLeft + GROUP_GAP);
	const colNameR = r2(colSwatchR + SWATCH_COL_W);
	const colL_R = r2(colNameR + nameColWRight);
	const colC_R = r2(colL_R + lColWRight);
	const colH_R = r2(colC_R + cColWRight);

	const TABLE_Y0 = r2(PLOT_Y_MAX + 10); // top of legend, below the plot

	function legendRows() {
		const header = `  <text x="${colL_L}" y="${TABLE_Y0}" font-weight="bold">L</text>
  <text x="${colC_L}" y="${TABLE_Y0}" font-weight="bold">C</text>
  <text x="${colH_L}" y="${TABLE_Y0}" font-weight="bold">H</text>
  <text x="${colL_R}" y="${TABLE_Y0}" font-weight="bold">L</text>
  <text x="${colC_R}" y="${TABLE_Y0}" font-weight="bold">C</text>
  <text x="${colH_R}" y="${TABLE_Y0}" font-weight="bold">H</text>`;
		const rows = [0, 1, 2].map(i => {
			const y = r2(TABLE_Y0 + (i + 1) * ROW_H);
			const l = leftData[i], rt = rightData[i];
			return `  <circle r="${SWATCH_R}" cx="${r2(colSwatchL + SWATCH_R)}" cy="${r2(y - LEGEND_FONT * 0.35)}" fill="${fillFor[l.name]}"/>
  <text x="${colNameL}" y="${y}">${l.name}</text>
  <text x="${colL_L}" y="${y}">${l.L}</text>
  <text x="${colC_L}" y="${y}">${l.C}</text>
  <text x="${colH_L}" y="${y}">${l.H}</text>
  <circle r="${SWATCH_R}" cx="${r2(colSwatchR + SWATCH_R)}" cy="${r2(y - LEGEND_FONT * 0.35)}" fill="${fillFor[rt.name]}"/>
  <text x="${colNameR}" y="${y}">${rt.name}</text>
  <text x="${colL_R}" y="${y}">${rt.L}</text>
  <text x="${colC_R}" y="${y}">${rt.C}</text>
  <text x="${colH_R}" y="${y}">${rt.H}</text>`;
		}).join("\n");
		return header + "\n" + rows;
	}

	const TABLE_BOTTOM = TABLE_Y0 + 4 * ROW_H;

	const VB_X_MIN = r2(Math.min(PLOT_X_MIN - 12, TABLE_X0 - 6));
	const VB_X_MAX = r2(Math.max(PLOT_X_MAX + 6, TABLE_X0 + TABLE_W + 6));
	const VB_Y_MIN = r2(PLOT_Y_MIN - 8);
	const VB_Y_MAX = r2(TABLE_BOTTOM + 4);
	const VB_WIDTH = r2(VB_X_MAX - VB_X_MIN);
	const VB_HEIGHT = r2(VB_Y_MAX - VB_Y_MIN);

	const comparisonBlock = showComparison ? `
<g stroke-dasharray="0.6 1.2" stroke="#bbb">
<!-- radial lines for sRGB hue angle and chroma -->
${radialLines(srgb)}
</g>` : "";

	const comparisonCircles = showComparison ? `
<!-- sRGB primaries and secondaries -->
<g stroke-dasharray="0.6 1.2" stroke="#bbb" stroke-width="0.3" fill="white">
${dashedCircles()}
</g>
` : "";

	const desc = showComparison
		? `<desc>Show a top-down view of the OKLab color space.
      The ${spaceLabel} primaries and secondaries are shown,
      with a legend giving the OKLCH L, C and H values.
      For comparison, the sRGB primaries and secondaries are also shown (dashed lines).
</desc>`
		: `<desc>Show a top-down view of the OKLab color space.
      The ${spaceLabel} primaries and secondaries are shown,
      with a legend giving the OKLCH L, C and H values.
</desc>`;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB_X_MIN} ${VB_Y_MIN} ${f(VB_WIDTH,0)} ${f(VB_HEIGHT,0)}" overflow="visible" width="700" height="${Math.round(700*VB_HEIGHT/VB_WIDTH)}">
${desc}
<!-- OKLab a,b values multiplied by 100 for convenient plotting,
     and b negated for a y-down coordinate system -->
<rect x="${VB_X_MIN}" y="${VB_Y_MIN}" width="100%" height="100%" fill="white" />
<g fill="none" stroke="black" stroke-width="0.3">

<!-- axes -->
<polyline points="0 ${PLOT_Y_MIN} 0 ${PLOT_Y_MAX}"/>
<polyline points="${PLOT_X_MIN} 0 ${PLOT_X_MAX} 0"/>

<!-- tic marks -->
<g stroke="#888">
<path d="${yAxisTicks}"/>
<path d="${xAxisTicks}"/>
</g>
${comparisonBlock}
<!-- radial lines for ${spaceLabel} hue angle and chroma -->
${radialLines(target)}
</g>
${comparisonCircles}
<!-- ${spaceLabel} primaries and secondaries -->
<!-- the fill colors are sRGB, *not the ${spaceLabel} colors* -->
<g stroke="none">
${solidCircles()}
</g>

<circle r="1.8" fill="black"/>
<circle r="1.3" fill="#777"/>
<circle r="0.8" fill="#fff"/>
<g font-family="sans-serif" font-size="3.4pt">
<!-- haha not really 3.4pt but a unit is required per CSS -->
  <text x="${PLOT_X_MAX+2}" y="1">+a</text>
  <text x="${PLOT_X_MIN-2}" y="1" text-anchor="end">-a</text>
  <text x="2" y="${PLOT_Y_MAX+5}">-b</text>
  <text x="2" y="${PLOT_Y_MIN-3}">+b</text>
</g>

<g font-family="sans-serif" font-size="${LEGEND_FONT}pt">
${legendRows()}
</g>
</svg>
`;
	return { svg, VB_WIDTH, VB_HEIGHT };
}

const jobs = [
	{ spaceId: "srgb", spaceLabel: "sRGB", legendLabel: "sRGB", showComparison: false, outFile: "sRGB-prim-sec-oklch.svg" },
	{ spaceId: "p3", spaceLabel: "display-p3", legendLabel: "display-p3", showComparison: true, outFile: "P3-prim-sec-oklch.svg" },
	{ spaceId: "a98rgb", spaceLabel: "a98-rgb", legendLabel: "a98-rgb", showComparison: true, outFile: "a98-prim-sec-oklch.svg" },
	{ spaceId: "prophoto", spaceLabel: "prophoto-rgb", legendLabel: "prophoto-rgb", showComparison: true, outFile: "prophoto-prim-sec-oklch.svg" },
	{ spaceId: "rec2020", spaceLabel: "rec2020", legendLabel: "rec2020", showComparison: true, outFile: "2020-prim-sec-oklch.svg" },
];

for (const job of jobs) {
	const { svg, VB_WIDTH, VB_HEIGHT } = genDiagram(job);
	writeFileSync(join(IMAGES_DIR, job.outFile), svg);
	console.log(job.outFile, "width=700", "height=" + Math.round(700 * VB_HEIGHT / VB_WIDTH));
}
