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

function Jzazbz_to_XYZ (Jzazbz) {
    // convert an array of JzAzBz to D65 XYZ
    // such that [0,0,0] is black and
    // media white is [0.2220, -0.00016, -0.0001]

    const b = 1.15;
    const g = 0.66;
    const M = [
        [  1.9242264357876067,  -1.0047923125953657,  0.037651404030618   ],
        [  0.35031676209499907,  0.7264811939316552, -0.06538442294808501 ],
        [ -0.09098281098284752, -0.3127282905230739,  1.5227665613052603  ],
    ];

    let LMS = Jzazbz_to_LMS (Jzazbz);
    // modified absolute XYZ
	let [Xm, Ym, Za] = multiplyMatrices(LMS, M);

    // un-modify X and Y to get D65 XYZ, relative to media white
    let Xa = (Xm + (b - 1) * Za) / b;
    let Ya = (Ym + (g - 1) * Xa) / g;
    return [Xa, Ya, Za];
}

function Jzazbz_to_LMS (Jzazbz) {

    const d = -0.56;
    const d0 = 1.6295499532821566e-11;
    const c1 = 3424 / 2 ** 12;
    const c2 = 2413 / 2 ** 7;
    const c3 = 2392 / 2 ** 7;
    const pinv = 2 ** 5 / (1.7 * 2523);
    const M = [
        [ 1,  0.13860504327153927,   0.05804731615611883  ],
        [ 1, -0.1386050432715393,   -0.058047316156118904 ],
        [ 1, -0.09601924202631895,  -0.81189189605603900  ],
    ];

    let [Jz, az, bz] = Jzazbz;
	let Iz = (Jz + d0) / (1 + d - d * (Jz + d0));

    // bring into LMS cone domain
	let PQLMS = multiplyMatrices([Iz, az, bz], M);

    // convert from PQ-coded to linear-light LMS
    let LMS = (
        PQLMS.map(function (val) {
            let num = c1 - spow(val, pinv);
            let denom = c3 * spow(val, pinv) - c2;
            let x = 10000 * spow(num / denom, ninv);

            return x; // luminance relative to diffuse white, [0, 70 or so].
        })
    );
    return LMS;
}
