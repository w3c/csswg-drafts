/**
 * @param {number} hue -  Hue as degrees 0..360
 * @param {number} white -  Whiteness as percentage 0..100
 * @param {number} black -  Blackness as percentage 0..100
 * @return {number[]} Array of RGB components 0..1
 */
function hwbToRgb(hue, white, black) {
    white /= 100;
    black /= 100;
    if (white + black >= 1) {
        let gray = white / (white + black);
        return [gray, gray, gray];
    }
    let rgb = hslToRgb(hue, 100, 50);
    for (let i = 0; i < 3; i++) {
        rgb[i] *= (1 - white - black);
        rgb[i] += white;
    }
    return rgb;
}