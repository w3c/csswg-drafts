let Color = await import("https://colorjs.io/dist/color.js").then(m => m.default);

const clamp = (n, min, max) =>
  Math.min(Math.max(n, min), max)

function hdrColor (col1, H1, col2, H2, H) {

    // https://drafts.csswg.org/css-color-hdr/#headroom-interpolation
    // col1, col2 are colors
    // H1 and H2 are headroom for each color (in stops, ie log scale, 0 = SDR)
    // H is available headroom

    // first check the headrooms are distinct
    if (H1 == H2) return 0;

    let c1xyz = col1.to("xyz-abs-d65").coords;
    let c2xyz = col2.to("xyz-abs-d65").coords;
    console.log(c1xyz);
    console.log(c2xyz);
    let w1 = clamp((H - H2) / (H1 - H2), 0, 1);
    let w2 = clamp((H - H1) / (H2 - H1), 0, 1);
    console.log(w1, w2);
    let eps = 0.001;
    let cxyz = Array(3);
    for (let i=0; i<3; i++) {
        cxyz[i] = Math.pow(c1xyz[i] + eps, w1) * Math.pow(c2xyz[i] + eps, w2) - eps;
    }
    return new Color("xyz-abs-d65", cxyz);
}

let c1 = new Color("slategray");
let c2 = new Color("color(rec2100-pq 0.8 0.8 0.8)");
let h1 = 0;
let h2 = 2;
let h = 1;
let result=hdrColor(c1, h1, c2, h2, h);
console.log(result.coords);