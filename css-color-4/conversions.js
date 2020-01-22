// Sample code for color conversions
// Conversion can also be done using ICC profiles and a Color Management System
// For clarity, a library is used for matrix manipulations

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

//  display-p3-related functions


function lin_P3(RGB) {
	// convert an array of display-p3 RGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.

	return lin_sRGB(RGB);	// same as sRGB
}

function gam_P3(RGB) {
	// convert an array of linear-light display-p3 RGB  in the range 0.0-1.0
	// to gamma corrected form

	return gam_sRGB(RGB);	// same as sRGB
}

function lin_P3_to_XYZ(rgb) {
	// convert an array of linear-light display-p3 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = math.matrix([
		[0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
		[0.2289745640697488, 0.6917385218365064,  0.079286914093745],
		[0.0000000000000000, 0.04511338185890264, 1.043944368900976]
	]);
	// 0 was computed as -3.972075516933488e-17

	return math.multiply(M, rgb).valueOf();
}

function XYZ_to_lin_P3(XYZ) {
	// convert XYZ to linear-light P3
	var M = math.matrix([
		[ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684],
		[-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
		[ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
	]);

	return math.multiply(M, XYZ).valueOf();
}

// prophoto-rgb functions

function lin_ProPhoto(RGB) {
	// convert an array of prophoto-rgb values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// Transfer curve is gamma 1.8 with a small linear portion
	return RGB.map(function (val) {
		if (val < 0.031248) {
			return val / 16;
		}

		return Math.pow(val, 1.8);
	});
}

function gam_ProPhoto(RGB) {
	// convert an array of linear-light prophoto-rgb  in the range 0.0-1.0
	// to gamma corrected form
	// Transfer curve is gamma 1.8 with a small linear portion
	return RGB.map(function (val) {
		if (val > 0.001953) {
			return Math.pow(val, 1/1.8);
		}

		return 16 * val;
	});
}

function lin_ProPhoto_to_XYZ(rgb) {
	// convert an array of linear-light prophoto-rgb values to CIE XYZ
	// using  D50 (so no chromatic adaptation needed afterwards)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = math.matrix([
	[ 0.7977604896723027,  0.13518583717574031,  0.0313493495815248     ],
	[ 0.2880711282292934,  0.7118432178101014,   0.00008565396060525902 ],
	[ 0.0,                 0.0,                  0.8251046025104601     ]
	]);

	return math.multiply(M, rgb).valueOf();
}

function XYZ_to_lin_ProPhoto(XYZ) {
	// convert XYZ to linear-light prophoto-rgb
	var M = math.matrix([
  	[  1.3457989731028281,  -0.25558010007997534,  -0.05110628506753401 ],
  	[ -0.5446224939028347,   1.5082327413132781,    0.02053603239147973 ],
  	[  0.0,                  0.0,                   1.2119675456389454  ]
	]);

	return math.multiply(M, XYZ).valueOf();
}

// a98-rgb functions

function lin_a98rgb(RGB) {
	// convert an array of a98-rgb values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	return RGB.map(function (val) {
	  return Math.pow(val, 563/256);
	});
}

function gam_a98rgb(RGB) {
	// convert an array of linear-light a98-rgb  in the range 0.0-1.0
	// to gamma corrected form
	return RGB.map(function (val) {
		return Math.pow(val, 256/563);
	});
}

function lin_a98rgb_to_XYZ(rgb) {
	// convert an array of linear-light a98-rgb values to CIE XYZ
	// using  D50 (so no chromatic adaptation needed afterwards)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// which has greater numerical precsion than section 4.3.5.3 of
	// https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
	var M = math.matrix([
	[ 0.5766690429101305,   0.1855582379065463,   0.1882286462349947  ],
	[ 0.29734497525053605,  0.6273635662554661,   0.07529145849399788 ],
	[ 0.02703136138641234,  0.07068885253582723,  0.9913375368376388  ]
	]);

	return math.multiply(M, rgb).valueOf();
}

function XYZ_to_lin_a98rgb(XYZ) {
	// convert XYZ to linear-light a98-rgb
	var M = math.matrix([
	[  2.0415879038107465,    -0.5650069742788596,   -0.34473135077832956 ],
	[ -0.9692436362808795,     1.8759675015077202,    0.04155505740717557 ],
	[  0.013444280632031142,  -0.11836239223101838,   1.0151749943912054  ]
	]);

	return math.multiply(M, XYZ).valueOf();
}

//Rec. 2020-related functions

function lin_2020(RGB) {
	// convert an array of rec2020 RGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	const α = 1.09929682680944 ;
	const β = 0.018053968510807;

	return RGB.map(function (val) {
		if (val < β * 4.5 ) {
			return val / 4.5;
		}

		return Math.pow((val + α -1 ) / α, 2.4);
	});
}
//check with standard this really is 2.4 and 1/2.4, not 0.45 was wikipedia claims

function gam_2020(RGB) {
	// convert an array of linear-light rec2020 RGB  in the range 0.0-1.0
	// to gamma corrected form
	const α = 1.09929682680944 ;
	const β = 0.018053968510807;

	return RGB.map(function (val) {
		if (val > β ) {
			return α * Math.pow(val, 1/2.4) - (α - 1);
		}

		return 4.5 * val;
	});
}

function lin_2020_to_XYZ(rgb) {
	// convert an array of linear-light rec2020 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = math.matrix([
		[0.6369580483012914, 0.14461690358620832,  0.1688809751641721],
		[0.2627002120112671, 0.6779980715188708,   0.05930171646986196],
		[0.000000000000000,  0.028072693049087428, 1.060985057710791]
	]);
	// 0 is actually calculated as  4.994106574466076e-17

	return math.multiply(M, rgb).valueOf();
}

function XYZ_to_lin_2020(XYZ) {
	// convert XYZ to linear-light rec2020
	var M = math.matrix([
		[1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
		[-0.6666843518324892,   1.6164812366349395,   0.01576854581391113],
		[0.017639857445310783, -0.042770613257808524, 0.9421031212354738]
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
	var white = [0.96422, 1.00000, 0.82521]; // D50 reference white

	// compute xyz, which is XYZ scaled relative to reference white
	var xyz = XYZ.map((value, i) => value / white[i]);

	// now compute f
	var f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);

	return [
		(116 * f[1]) - 16, 	 // L
		500 * (f[0] - f[1]), // a
		200 * (f[1] - f[2])  // b
	];
}

function Lab_to_XYZ(Lab) {
	// Convert Lab to D50-adapted XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var κ = 24389/27;   // 29^3/3^3
	var ε = 216/24389;  // 6^3/29^3
	var white = [0.96422, 1.00000, 0.82521]; // D50 reference white
	var f = [];

	// compute f, starting with the luminance-related term
	f[1] = (Lab[0] + 16)/116;
	f[0] = Lab[1]/500 + f[1];
	f[2] = f[1] - Lab[2]/200;

	// compute xyz
	var xyz = [
		Math.pow(f[0],3) > ε ?   Math.pow(f[0],3)            : (116*f[0]-16)/κ,
		Lab[0] > κ * ε ?         Math.pow((Lab[0]+16)/116,3) : Lab[0]/κ,
		Math.pow(f[2],3)  > ε ?  Math.pow(f[2],3)            : (116*f[2]-16)/κ
	];

	// Compute XYZ by scaling xyz by reference white
	return xyz.map((value, i) => value * white[i]);
}

function Lab_to_LCH(Lab) {
	// Convert to polar form
	var hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;
	return [
		Lab[0], // L is still L
		Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)), // Chroma
		hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
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


