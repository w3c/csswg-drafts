// These functions use the color conversion functions from CSS Color 4

function XYZ_to_lin_2100(XYZ) {
    // convert an array of D65 XYZ to linear-light BT.2100 RGB
    // such that [0,0,0] is black and [1,1,1] is media white.
    // component values greater than 1 indicate HDR colors

    return  XYZ_to_lin_2020(XYZ);
}

function lin_2100_to_XYZ(RGB) {
    // convert an array of linear-light BT.2100 RGB values
    // to D65 XYZ

    return lin_2020_to_XYZ(RGB);
}