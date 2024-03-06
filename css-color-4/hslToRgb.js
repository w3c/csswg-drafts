/**
 * @param {number} hue - Hue as degrees 0..360
 * @param {number} sat - Saturation in reference range [0,100]
 * @param {number} light - Lightness in reference range [0,100]
 * @return {number[]} Array of sRGB components; in-gamut colors in range [0..1]
 */
function hslToRgb(hue, sat, light) {
    hue = hue % 360;

    if (hue < 0) {
        hue += 360;
    }

    sat /= 100;
    light /= 100;

    function f(n) {
        let k = (n + hue/30) % 12;
        let a = sat * Math.min(light, 1 - light);
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }

    return [f(0), f(8), f(4)];
}