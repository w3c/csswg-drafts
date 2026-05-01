/**
 * @param {number} red - Red component 0..1
 * @param {number} green - Green component 0..1
 * @param {number} blue - Blue component 0..1
 * @return {number} Hue as degrees 0..360
 */
function rgbToHue(red, green, blue) {
    // Similar to rgbToHsl, except that saturation and lightness are not calculated, and
    // potential negative saturation is ignored.
    let max = Math.max(red, green, blue);
    let min = Math.min(red, green, blue);
    let hue = NaN;
    let d = max - min;

    if (d !== 0) {
        switch (max) {
            case red:   hue = (green - blue) / d + (green < blue ? 6 : 0); break;
            case green: hue = (blue - red) / d + 2; break;
            case blue:  hue = (red - green) / d + 4;
        }

        hue *= 60;
    }

    if (hue >= 360) {
        hue -= 360;
    }

    return hue;
}

/**
 * @param {number} red - Red component 0..1
 * @param {number} green - Green component 0..1
 * @param {number} blue - Blue component 0..1
 * @return {number[]} Array of HWB values: Hue as degrees 0..360, Whiteness and Blackness in reference range [0,100]
 */
function rgbToHwb(red, green, blue) {
    let epsilon = 1 / 100000;  // account for multiply by 100
    var hue = rgbToHue(red, green, blue);
    var white = Math.min(red, green, blue);
    var black = 1 - Math.max(red, green, blue);
    if (white + black >= 1 - epsilon) {
        hue = NaN;
    }
    return([hue, white*100, black*100]);
}
