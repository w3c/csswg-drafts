// sRGB-related functions

function lin_sRGB(RGB) {
	// convert an array of sRGB values in the range 0.0 - 1.0 
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	return RGB.map(function (val) {
		if (val < 0.04045) {
			return val / 12.92;
		}
		
		return Math.pow((val + 0.055) / 1.055, 2.4);
	});
}

function gam_sRGB(RGB) {
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	return RGB.map(function (val) {
		if (val > 0.0031308) {
			return 1.055 * Math.pow(val, 1/2.4) - 0.055;
		}
		
		return 12.92 * val;
	});
}
 
function lin_sRGB_to_XYZ(rgb) {
	// convert an array of linear-light sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = math.matrix([
		[0.4124564,  0.3575761,  0.1804375],
		[0.2126729,  0.7151522,  0.0721750],
		[0.0193339,  0.1191920,  0.9503041]
	]);
	
	return math.multiply(M, rgb).valueOf();
}

function XYZ_to_lin_sRGB(XYZ) {
	// convert XYZ to linear-light sRGB
	var M = math.matrix([
		[ 3.2404542, -1.5371385, -0.4985314],
		[-0.9692660,  1.8760108,  0.0415560],
		[ 0.0556434, -0.2040259,  1.0572252]
	]);
	
	return math.multiply(M, XYZ).valueOf();
}

// Chromatic adaptation

function D65_to_D50(XYZ) {
	// Bradford chromatic adaptation from D65 to D50
	// The matrix below is the result of three operations:
	// - convert from XYZ to retinal cone domain
	// - scale components from one reference white to another
	// - convert back to XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
	var M = math.matrix([
		[ 1.0478112,  0.0228866, -0.0501270],
		[ 0.0295424,  0.9904844, -0.0170491],
		[-0.0092345,  0.0150436,  0.7521316]
	 ]);
	
	return math.multiply(M, XYZ).valueOf();
}

function D50_to_D65(XYZ) {
	// Bradford chromatic adaptation from D50 to D65
	var M = math.matrix([
		[ 0.9555766, -0.0230393,  0.0631636],
		[-0.0282895,  1.0099416,  0.0210077],
		[ 0.0122982, -0.0204830,  1.3299098]
	 ]);
	 
	return math.multiply(M, XYZ).valueOf();
}

// Lab and LCH

function XYZ_to_Lab(XYZ) {
	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	var ε = 216/24389;  // 6^3/29^3
	var κ = 24389/27;   // 29^3/3^3
	var white = [0.9642, 1.0000, 0.8249]; // D50 reference white
	
	// compute xyz, which is XYZ scaled relative to reference white
	var xyz = XYZ.map((value, i) => value / white[i]);
	
	// now compute f
	var f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);
	
	return [
		(116 * f[1]) - 16, // L
		500 * (f[0] - f[1]), // a
		200 * (f[1] - f[2]) // b
	];
}

function Lab_to_XYZ(Lab) {
	// Convert Lab to D50-adapted XYZ
	var κ = 24389/27;   // 29^3/3^3
	var ε = 216/24389;  // 6^3/29^3
	var white = [0.9642, 1.0000, 0.8249]; // D50 reference white
	var f = [];
	
	// compute f, starting with the luminance-related term
	f[1] = (Lab[0] + 16)/116;
	f[0] = Lab[1]/500 + f[1];
	f[2] = f[1] - Lab[2]/200;
	
	// compute xyz
	var xyz = [
		f[0] > ε       ? Math.pow(f[0],3)            : (116*f[0]-16)/κ,
		Lab[0] > κ * ε ? Math.pow((Lab[0]+16)/116,3) : Lab[0]/κ,
		f[2] > ε       ? Math.pow(f[2],3)            : (116*f[2]-16)/κ
	];
	
	// Compute XYZ by scaling xyz by reference white  
	return xyz.map((value, i) => value * white[i]);
}

function Lab_to_LCH(Lab) {
	// Convert to polar form
	return [
		Lab[0], // L is still L
		Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)), // Chroma 
		Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI // Hue, in degrees
	];
}

function LCH_to_Lab(LCH) {
	// Convert from polar form
	return [
		LCH[0], // L is still L
		LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
		LCH[1] * Math.sin(LCH[2] * Math.PI / 180) // b
	];
}

// DCI P3 functions

