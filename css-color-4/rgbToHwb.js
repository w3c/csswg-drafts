/**
 * @param {number} red - Red component 0..1
 * @param {number} green - Green component 0..1
 * @param {number} blue - Blue component 0..1
 * @return {number[]} Array of HWB values: Hue as degrees 0..360, Whiteness and Blackness as percentages 0..100
 */
function rgbToHwb(red, green, blue) {
    var hsl = rgbToHsl(red, green, blue);
    var white = Math.min(red, green, blue);
    var black = 1 - Math.max(red, green, blue);
    return([hsl[0], white*100, black*100]);
}