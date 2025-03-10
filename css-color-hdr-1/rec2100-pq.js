function XYZ_to_pq_2100(XYZ) {
    // convert an array of D65 XYZ to PQ-encoded BT.2100 RGB
    // such that [0,0,0] is black and [1,1,1] is 10,000 cd/m^2 white;
    // media white is at [0.5807,0.5807,0.5807] (to four significant figures).

    let linRGB = XYZ_to_lin_2100(XYZ);
    return pq_encode(linRGB);
}

function pq_2100_to_XYZ(RGB) {
    // convert an array of PQ-encoded BT.2100 RGB values
    // to D65 XYZ

    let linRGB = pq_decode(RGB);
    return lin_2100_to_XYZ(linRGB);
}

function pq_encode(RGB) {

    const Yw = 203;    // absolute luminance of media white, cd/m²
    const n = 2610 / (2 ** 14);
    const m = 2523 / (2 ** 5);
    const c1 = 3424 / (2 ** 12);
    const c2 = 2413 / (2 ** 7);
    const c3 = 2392 / (2 ** 7);

    // given PQ encoded component in range [0, 1]
    // return media-white relative linear-light
    return RGB.map(function (val) {
        let x = Math.max(val * Yw / 10000, 0);     // absolute luminance of peak white is 10,000 cd/m².
        let num = (c1 + (c2 * (x ** n)));
        let denom = (1 + (c3 * (x ** n)));

        return ((num / denom)  ** m);
    });
}

function pq_decode(RGB) {

    const Yw = 203;    // absolute luminance of media white, cd/m²
    const ninv = (2 ** 14) / 2610;
    const minv = (2 ** 5) / 2523;
    const c1 = 3424 / (2 ** 12);
    const c2 = 2413 / (2 ** 7);
    const c3 = 2392 / (2 ** 7);

    // given PQ encoded component in range [0, 1]
    // return media-white relative linear-light
    return RGB.map(function (val) {
        let x = ((Math.max(((val ** minv) - c1), 0) / (c2 - (c3 * (val ** minv)))) ** ninv);
        return (x * 10000 / Yw);     // luminance relative to diffuse white, [0, 70 or so].
    });
}