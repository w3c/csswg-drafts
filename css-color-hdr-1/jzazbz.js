function XYZ_to_Jzazbz (XYZ) {
    // convert an array of D65 XYZ toJzAzBz
    // such that [0,0,0] is black and
    // media white is [0.2220, -0.00016, -0.0001]

    const Yw = 203; // absolute luminance of media white
    const M = [
        [  0.41478972, 0.579999,  0.0146480 ],
        [ -0.2015100,  1.120649,  0.0531008 ],
        [ -0.0166008,  0.264800,  0.6684799 ],
    ];
    const b = 1.15;
    const g = 0.66;

    // First make XYZ absolute, not relative to media white
    // Maximum luminance in PQ is 10,000 cd/m²
    // BT.2048 says media white Y=203  cd/m²
    let [Xa, Ya, Za] = XYZ.map(v => v * Yw);

    // then modify X and Y, to minimize blue curvature
    let Xm = b * Xa - (b - 1) * Za;
    let Ym = g * Ya - (g - 1) * Xa;

    // now move to LMS cone domain
    let LMS = multiplyMatrices(M, [Xm, Ym, Za]);
    return LMStoJzazbz(LMS);
}

function LMStoJzazbz(LMS) {

    const M = [
        [  0.5,       0.5,       0        ],
        [  3.524000, -4.066708,  0.542708 ],
        [  0.199076,  1.096799, -1.295875 ],
    ];
    const c1 = 3424 / 2 ** 12;
    const c2 = 2413 / 2 ** 7;
    const c3 = 2392 / 2 ** 7;
    const n = 2610 / 2 ** 14;
    const p = (1.7 * 2523) / 2 ** 5;    // compared to usual PQ, 1.7 scale
    const d = -0.56;
    const d0 = 1.6295499532821566e-11;  // tiny shift to move black back to 0


    // PQ-encode LMS
    let PQLMS = (
        LMS.map(function (val) {
            let num = c1 + c2 * spow((val / 10000), n);
            let denom = 1 + c3 * spow((val / 10000), n);

            return spow((num / denom), p);
        })
    );

    // calculate Iz az bz
    let [Iz, az, bz] = multiplyMatrices(M, PQLMS);
    // now Jz from Iz
    let Jz = ((1 + d) * Iz) / (1 + d * Iz) - d0;
    return [Jz, az, bz];
}

