function XYZ_to_hlg_2100(XYZ) {
    // convert an array of D65 XYZ to HLG-encoded BT.2100 RGB
    // such that [0,0,0] is black and [0.75,0.75,0.75] is media white

    let linRGB = XYZ_to_lin_2100(XYZ);
    return hlg_encode(linRGB);
}

function hlg_2100_to_XYZ(RGB) {
    // convert an array of PQ-encoded BT.2100 RGB values
    // to D65 XYZ

    let linRGB = hlg_decode(RGB);
    return lin_2100_to_XYZ(linRGB);
}

function hlg_encode(RGB) {

    const a = 0.17883277;
    const b = 0.28466892; // 1 - (4 * a)
    const c = 0.55991073; // 0.5 - a * Math.log(4 *a)
    const scale = 3.7743;    // Place 18% grey at HLG 0.38, so media white at 0.75

    return RGB.map(function (val) {
        // first scale to put linear-light media white at 1/3
        val /= scale;
        // now the HLG OETF
        // ITU-R BT.2390-10 p.23
        // 6.1 The hybrid log-gamma opto-electronic transfer function (OETF)
        if (val <= 1 / 12) {
            return spow(3 * val, 0.5);
        }
        return a * Math.log(12 * val - b) + c;
    });
}

function hlg_decode(RGB) {

    const a = 0.17883277;
    const b = 0.28466892; // 1 - (4 * a)
    const c = 0.55991073; // 0.5 - a * Math.log(4 *a)
    const scale = 3.7743;    // Place 18% grey at HLG 0.38, so media white at 0.75

    return RGB.map(function (val) {
        // first the HLG EOTF
        // ITU-R BT.2390-10 p.30 section
        // 6.3 The hybrid log-gamma electro-optical transfer function (EOTF)
        // Then scale by 3 so media white is 1.0
        if (val <= 0.5) {
            return (val ** 2) / 3 * scale;
        }
        return ((Math.exp((val - c) / a) + b) / 12) * scale;
    });
}

function spow (base, exp) {
    let sign = base < 0? -1 : 1;
    return sign * (Math.abs(base) ** exp);
}