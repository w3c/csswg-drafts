// utility functions for color conversions
import "conversions.js";

function sRGB_to_luminance(RGB) {
    // convert an array of gamma-corrected sRGB values
    // in the 0.0 to 1.0 range
    // to linear-light sRGB, then to CIE XYZ
    // and return luminance (the Y value)

    var XYZ = lin_sRGB_to_XYZ(lin_sRGB(RGB));
    return XYZ[1];
}

function contrast(RGB1, RGB2) {
    // return WCAG 2.1 contrast ratio
    // https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
    // for two sRGB values
    // given as arrays of 0.0 to 1.0

    var L1 = sRGB_to_luminance(RGB1);
    var L2 = sRGB_to_luminance(RGB2);

    if L1 > L2 return (L1 + 0.05) / (L2 + 0.05);
    return (L2 + 0.05) / (L1 + 0.05);
}

function sRGB_to_LCH(RGB) {
    // convert an array of gamma-corrected sRGB values
    // in the 0.0 to 1.0 range
    // to linear-light sRGB, then to CIE XYZ,
    // then adapt from D65 to D50,
    // then convert XYZ to CIE Lab
    // and finally, convert to CIE LCH

    return lin_sRGB_to_XYZ(lin_sRGB(RGB));
}