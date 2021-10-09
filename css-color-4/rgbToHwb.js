function rgbToHwb(red, green, blue) {
    var hsl = rgbToHsl(red, green, blue);
    var white = Math.min(red, green, blue);
    var black = 1 - Math.max(red, green, blue);
    return([hsl[0], white*100, black*100]);
}