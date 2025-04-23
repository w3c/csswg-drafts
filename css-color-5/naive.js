function naive(cmyk) {
  // naively convert an array of CMYK values
  // to sRGB
  let [cyan, magenta, yellow, black] = cmyk;
    let red = 1 - Math.min(1, cyan * (1 - black) + black);
    let green = 1 - Math.min(1, magenta * (1 - black) + black);
    let blue = 1 - Math.min(1, yellow * (1 - black) + black);
    return [red, green, blue];
}
