
function XYZ_to_ICtCp (XYZ) {
    // convert an array of D65 XYZ to ICtCp

    // The matrix below includes the 4% crosstalk components
    // and is from the procedure in the Dolby "What is ICtCp" paper"
    const M = [
        [  0.3592832590121217,  0.6976051147779502, -0.0358915932320290 ],
        [ -0.1920808463704993,  1.1004767970374321,  0.0753748658519118 ],
        [  0.0070797844607479,  0.0748396662186362,  0.8433265453898765 ],
    ];

    let LMS = multiplyMatrices(M, XYZ.map(v => v * Yw));
    return LMStoICtCp(LMS);
}

function LMStoICtCp (LMS) {

    const c1 = 3424 / 4096;
    const c2 = 2413 / 128;
    const c3 = 2392 / 128;
    const m1 = 2610 / 16384;
    const m2 = 2523 / 32;

    // This matrix includes the Ebner LMS coefficients,
    // the rotation, and the scaling to [-0.5,0.5] range
    // rational terms are from Fröhlich p.97
    // and ITU-R BT.2124-0 pp.2-3
    const M = [
        [  2048 / 4096,   2048 / 4096,       0      ],
        [  6610 / 4096, -13613 / 4096,  7003 / 4096 ],
        [ 17933 / 4096, -17390 / 4096,  -543 / 4096 ],
    ];

    // apply the PQ EOTF
    // values scaled so [0, 10,000] maps to [0, 1]
    // we can't ever be dividing by zero because of the "1 +" in the denominator
    let PQLMS = LMS.map (function (val) {
        let num = c1 + (c2 * ((val / 10000) ** m1));
        let denom = 1 + (c3 * ((val / 10000) ** m1));

        return (num / denom)  ** m2;
    });

    // LMS to IPT, with rotation for Y'C'bC'r compatibility
    return multiplyMatrices(M, PQLMS);
}

function ICtCp_to_XYZ (ICtCp) {
    // convert ICtCp to an array of absolute, D65 XYZ

    const M = [
        [  2.0701522183894223, -1.3263473389671563,  0.2066510476294053 ],
        [  0.3647385209748072,  0.6805660249472273, -0.0453045459220347 ],
        [ -0.0497472075358123, -0.0492609666966131,  1.1880659249923042 ],
    ];

    let LMS = ICtCptoLMS(ICtCp);
    return multiplyMatrices(M, LMS);
}

function ICtCptoLMS (ICtCp) {

    const c1 = 3424 / 4096;
    const c2 = 2413 / 128;
    const c3 = 2392 / 128;
    const im1 = 16384 / 2610;
    const im2 = 32 / 2523;

    const M = [
        [ 0.9999999999999998,  0.0086090370379328,  0.1110296250030260 ],
        [ 0.9999999999999998, -0.0086090370379328, -0.1110296250030259 ],
        [ 0.9999999999999998,  0.5600313357106791, -0.3206271749873188 ],
    ];

    let PQLMS = multiplyMatrices(M, ICtCp);

    // Undo PQ encoding, From BT.2124-0 Annex 2 Conversion 3
    let LMS = PQLMS.map (function (val) {
        let num  = Math.max((val ** im2) - c1, 0);
        let denom = (c2 - (c3 * (val ** im2)));
        return 10000 * ((num / denom) ** im1);
    });

    return LMS;
}