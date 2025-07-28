function hdrColor(col1, H1, col2, H2, H) {

    // col1, col2 are arrays representing two colors, in Absolute XYZ
    // H1 and H2 are the headroom for each color (in stops, ie log scale, 0 = SDR)
    // H is available headroom

    // first check the headrooms are distinct
    if (H1 == H2) return 0;

    let w1 = clamp((H - H2) / (H1 - H2), 0, 1);
    let w2 = clamp((H - H1) / (H2 - H1), 0, 1);
    let eps = 0.001;
    let cxyz = Array(3);
    for (let i=0; i<3; i++) {
        cxyz[i] = Math.pow(c1xyz[i] + eps, w1) * Math.pow(c2xyz[i] + eps, w2) - eps;
    }
    return cxyz;
}

const clamp = (n, min, max) =>
  Math.min(Math.max(n, min), max)
