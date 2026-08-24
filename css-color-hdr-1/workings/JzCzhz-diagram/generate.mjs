// Regenerates images/2020-prim-sec-JzCzHz.svg: a diagram plotting the
// rec2020 primaries and secondaries on the Jzazbz az,bz plane, with the
// sRGB gamut shown as a dashed comparison overlay and a legend table
// (Jz, Cz, hz) below the plot.
//
// Usage:
//   node generate.mjs
//
// The underlying Jz/Cz/hz and az/bz values are hardcoded below (computed
// once from the Jzazbz conversion — see ../../jzazbz.js for the formulas).
// If those source values ever need recomputing, redo the conversion for
// rec2020 and sRGB red/green/blue/cyan/magenta/yellow and update the
// `rec2020` / `srgb` tables here; the rest of the layout (plot framing,
// legend columns, axis labels) is generated automatically.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "..", "images", "2020-prim-sec-JzCzHz.svg");

const names = ["red", "green", "blue", "cyan", "magenta", "yellow"];
const fillFor = {
	red: "red", green: "green", blue: "blue",
	cyan: "cyan", magenta: "magenta", yellow: "yellow",
};
const dashedFillFor = {
	red: "#FF000040", green: "#00FF0040", blue: "#0000FF40",
	cyan: "#00FFFF40", magenta: "#FF00FF40", yellow: "#FFFF0040",
};

// (Jz, Cz, hz) and (az*1000, -bz*1000) for plotting; az,bz scaled by 1000
// for convenient plotting, and bz negated for a y-down coordinate system.
const rec2020 = {
	red:     { Jz: 0.135595, Cz: 0.197156, hz: 39.0981,  cx: 151.845,  cy: -122.326 },
	green:   { Jz: 0.138687, Cz: 0.222759, hz: 143.3325, cx: -189.870, cy: -133.545 },
	blue:    { Jz: 0.067736, Cz: 0.186105, hz: 249.6552, cx: -67.992,  cy: 187.641 },
	cyan:    { Jz: 0.149670, Cz: 0.137087, hz: 188.0807, cx: -139.162, cy: 44.498 },
	magenta: { Jz: 0.148128, Cz: 0.163382, hz: 343.4944, cx: 146.719,  cy: 75.255 },
	yellow:  { Jz: 0.184104, Cz: 0.156390, hz: 97.8016,  cx: -31.377,  cy: -154.000 },
};
const srgb = {
	red:     { cx: 108.286, cy: -100.872 },
	green:   { cx: -100.540, cy: -109.282 },
	blue:    { cx: -35.468, cy: 170.257 },
	cyan:    { cx: -65.203, cy: 28.685 },
	magenta: { cx: 101.807, cy: 82.845 },
	yellow:  { cx: -26.227, cy: -124.525 },
};

const f = (n, d = 4) => n.toFixed(d);
const r2 = n => Math.round(n * 100) / 100;

function genDiagram() {
	const target = rec2020;
	const spaceLabel = "rec2020";
	const legendLabel = "rec2020";

	// ---- plot area: tight around the data, fixed small padding ----
	const PAD = 15;
	let xs = [], ys = [];
	for (const n of names) {
		xs.push(target[n].cx, srgb[n].cx);
		ys.push(target[n].cy, srgb[n].cy);
	}
	const PLOT_X_MIN = r2(Math.min(...xs) - PAD);
	const PLOT_X_MAX = r2(Math.max(...xs) + PAD);
	const PLOT_Y_MIN = r2(Math.min(...ys) - PAD);
	const PLOT_Y_MAX = r2(Math.max(...ys) + PAD);

	const TICK_STEP = 20;
	function ticksBetween(lo, hi) {
		const out = [];
		for (let v = Math.ceil(lo / TICK_STEP) * TICK_STEP; v <= hi; v += TICK_STEP) {
			if (v !== 0) out.push(v);
		}
		return out;
	}
	const xTicks = ticksBetween(PLOT_X_MIN, PLOT_X_MAX);
	const yTicks = ticksBetween(PLOT_Y_MIN, PLOT_Y_MAX);
	const TICK = 3;
	const yAxisTicks = yTicks.map(y => `M-${TICK},${f(y,0)} h${TICK*2}`).join(" ");
	const xAxisTicks = xTicks.map(x => `M${f(x,0)},-${TICK} v${TICK*2}`).join(" ");

	const POINT_R = 3.9;

	function radialLines(pointsObj) {
		return names.map(n => `<polyline points="0,0 ${f(pointsObj[n].cx,3)},${f(pointsObj[n].cy,3)}"/>`).join("\n");
	}
	function dashedCircles() {
		return names.map(n =>
			`  <circle r="${POINT_R}" cx="${f(srgb[n].cx,3)}" cy="${f(srgb[n].cy,3)}" fill="${dashedFillFor[n]}"/>`
		).join("\n");
	}
	function solidCircles() {
		return names.map(n =>
			`  <circle r="${POINT_R}" cx="${f(target[n].cx,3)}" cy="${f(target[n].cy,3)}" fill="${fillFor[n]}"/>`
		).join("\n");
	}

	// ---- legend table: 8 columns, 3 rows, placed BELOW the plot ----
	// col groups: [swatch+name, Jz, Cz, hz] x2  ->  red/green/blue on the
	// left, cyan/magenta/yellow on the right (paired row-wise).
	const LEGEND_FONT = 4.8;
	const CHAR_W = LEGEND_FONT * 0.62; // approx average glyph advance for sans-serif
	const COL_GAP = 6;
	const GROUP_GAP = 16;
	const ROW_H = LEGEND_FONT * 2;
	const SWATCH_R = LEGEND_FONT * 0.675;
	const SWATCH_COL_W = SWATCH_R * 2 + COL_GAP;

	const leftNames = ["red", "green", "blue"];
	const rightNames = ["cyan", "magenta", "yellow"];

	function rowData(n) {
		const p = target[n];
		return {
			name: n,
			Jz: f(p.Jz, 6),
			Cz: f(p.Cz, 6),
			hz: f(p.hz, 4),
		};
	}
	const leftData = leftNames.map(rowData);
	const rightData = rightNames.map(rowData);

	function colWidth(rows, key, header) {
		const maxLen = Math.max(header.length, ...rows.map(row => row[key].length));
		return maxLen * CHAR_W + COL_GAP;
	}

	const nameColWLeft = colWidth(leftData, "name", legendLabel);
	const jColWLeft = colWidth(leftData, "Jz", "Jz");
	const cColWLeft = colWidth(leftData, "Cz", "Cz");
	const hColWLeft = colWidth(leftData, "hz", "hz");
	const nameColWRight = colWidth(rightData, "name", "");
	const jColWRight = colWidth(rightData, "Jz", "Jz");
	const cColWRight = colWidth(rightData, "Cz", "Cz");
	const hColWRight = colWidth(rightData, "hz", "hz");

	const groupLeftW = SWATCH_COL_W + nameColWLeft + jColWLeft + cColWLeft + hColWLeft;
	const groupRightW = SWATCH_COL_W + nameColWRight + jColWRight + cColWRight + hColWRight;
	const TABLE_W = groupLeftW + GROUP_GAP + groupRightW;

	// center the table (and the plot) around x=0
	const TABLE_X0 = r2(-TABLE_W / 2);
	const colSwatchL = TABLE_X0;
	const colNameL = r2(colSwatchL + SWATCH_COL_W);
	const colJ_L = r2(colNameL + nameColWLeft);
	const colC_L = r2(colJ_L + jColWLeft);
	const colH_L = r2(colC_L + cColWLeft);
	const colSwatchR = r2(colH_L + hColWLeft + GROUP_GAP);
	const colNameR = r2(colSwatchR + SWATCH_COL_W);
	const colJ_R = r2(colNameR + nameColWRight);
	const colC_R = r2(colJ_R + jColWRight);
	const colH_R = r2(colC_R + cColWRight);

	const TABLE_Y0 = r2(PLOT_Y_MAX + 20); // top of legend, below the plot

	function legendRows() {
		const header = `  <text x="${colJ_L}" y="${TABLE_Y0}" font-weight="bold">Jz</text>
  <text x="${colC_L}" y="${TABLE_Y0}" font-weight="bold">Cz</text>
  <text x="${colH_L}" y="${TABLE_Y0}" font-weight="bold">hz</text>
  <text x="${colJ_R}" y="${TABLE_Y0}" font-weight="bold">Jz</text>
  <text x="${colC_R}" y="${TABLE_Y0}" font-weight="bold">Cz</text>
  <text x="${colH_R}" y="${TABLE_Y0}" font-weight="bold">hz</text>`;
		const rows = [0, 1, 2].map(i => {
			const y = r2(TABLE_Y0 + (i + 1) * ROW_H);
			const l = leftData[i], rt = rightData[i];
			return `  <circle r="${SWATCH_R}" cx="${r2(colSwatchL + SWATCH_R)}" cy="${r2(y - LEGEND_FONT * 0.35)}" fill="${fillFor[l.name]}"/>
  <text x="${colNameL}" y="${y}">${l.name}</text>
  <text x="${colJ_L}" y="${y}">${l.Jz}</text>
  <text x="${colC_L}" y="${y}">${l.Cz}</text>
  <text x="${colH_L}" y="${y}">${l.hz}</text>
  <circle r="${SWATCH_R}" cx="${r2(colSwatchR + SWATCH_R)}" cy="${r2(y - LEGEND_FONT * 0.35)}" fill="${fillFor[rt.name]}"/>
  <text x="${colNameR}" y="${y}">${rt.name}</text>
  <text x="${colJ_R}" y="${y}">${rt.Jz}</text>
  <text x="${colC_R}" y="${y}">${rt.Cz}</text>
  <text x="${colH_R}" y="${y}">${rt.hz}</text>`;
		}).join("\n");
		return header + "\n" + rows;
	}

	const TABLE_BOTTOM = TABLE_Y0 + 4 * ROW_H;

	// extra right/left margin sized to fit the "+az"/"-az" axis-end labels
	const AXIS_LABEL_W = "az".length + 1; // "+az" / "-az" -> 3 chars
	const AXIS_MARGIN = 6 + AXIS_LABEL_W * (6.8 * 0.62) + 4;

	const VB_X_MIN = r2(Math.min(PLOT_X_MIN - AXIS_MARGIN, TABLE_X0 - 10));
	const VB_X_MAX = r2(Math.max(PLOT_X_MAX + AXIS_MARGIN, TABLE_X0 + TABLE_W + 10));
	const VB_Y_MIN = r2(PLOT_Y_MIN - 20);
	const VB_Y_MAX = r2(TABLE_BOTTOM + 8);
	const VB_WIDTH = r2(VB_X_MAX - VB_X_MIN);
	const VB_HEIGHT = r2(VB_Y_MAX - VB_Y_MIN);

	const comparisonBlock = `
<g stroke-dasharray="1 2" stroke="#bbb">
<!-- radial lines for sRGB hue angle and chroma -->
${radialLines(srgb)}
</g>`;

	const comparisonCircles = `
<!-- sRGB primaries and secondaries -->
<g stroke-dasharray="1 2" stroke="#bbb" stroke-width="0.7" fill="white">
${dashedCircles()}
</g>
`;

	const desc = `<desc>Show a top-down view of the Jzazbz color space.
      The rec2020 primaries and secondaries are shown,
      with a legend giving the Jz, Cz and hz values.
      For comparison, the sRGB primaries and secondaries are also shown (dashed lines).
</desc>`;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB_X_MIN} ${VB_Y_MIN} ${f(VB_WIDTH,0)} ${f(VB_HEIGHT,0)}" overflow="visible" width="700" height="${Math.round(700*VB_HEIGHT/VB_WIDTH)}">
${desc}
<!-- az,bz values multiplied by 1000 for convenient plotting,
     and bz negated for a y-down coordinate system -->
<rect x="${VB_X_MIN}" y="${VB_Y_MIN}" width="100%" height="100%" fill="white" />
<g fill="none" stroke="black" stroke-width="0.7">

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

<circle r="5.4"/>
<circle r="3.9" fill="#777"/>
<circle r="2.4" fill="#fff"/>
<g font-family="sans-serif" font-size="6.8pt">
<!-- haha not really 6.8pt but a unit is required per CSS -->
  <text x="${PLOT_X_MAX+4}" y="2">+az</text>
  <text x="${PLOT_X_MIN-4}" y="2" text-anchor="end">-az</text>
  <text x="4" y="${PLOT_Y_MAX+10}">-bz</text>
  <text x="4" y="${PLOT_Y_MIN-6}">+bz</text>
</g>

<g font-family="sans-serif" font-size="${LEGEND_FONT}pt">
${legendRows()}
</g>
</svg>
`;
	return { svg, VB_WIDTH, VB_HEIGHT };
}

const { svg, VB_WIDTH, VB_HEIGHT } = genDiagram();
writeFileSync(OUT_PATH, svg);
console.log("wrote", OUT_PATH, "width=700", "height=" + Math.round(700 * VB_HEIGHT / VB_WIDTH));
