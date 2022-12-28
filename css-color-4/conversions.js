// Sample code for color conversions
// Conversion can also be done using ICC profiles and a Color Management System
// For clarity, a library is used for matrix multiplication (multiply-matrices.js)

// standard white points, defined by 4-figure CIE x,y chromaticities
const D50 = [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585];
const D65 = [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290];

// sRGB-related functions

function lin_sRGB(RGB) {
	// convert an array of sRGB values
	// where in-gamut values are in the range [0 - 1]
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	// Extended transfer function:
	// for negative values,  linear portion is extended on reflection of axis,
	// then reflected power function is used.
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs < 0.04045) {
			return val / 12.92;
		}

		return sign * (Math.pow((abs + 0.055) / 1.055, 2.4));
	});
}

function gam_sRGB(RGB) {
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	// Extended transfer function:
	// For negative values, linear portion extends on reflection
	// of axis, then uses reflected pow below that
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs > 0.0031308) {
			return sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055);
		}

		return 12.92 * val;
	});
}

function lin_sRGB_to_XYZ(rgb) {
	// convert an array of linear-light sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)

	var M = [
		[ 506752 / 1228815,  87881 / 245763,   12673 /   70218 ],
		[  87098 /  409605, 175762 / 245763,   12673 /  175545 ],
		[   7918 /  409605,  87881 / 737289, 1001167 / 1053270 ],
	];
	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_sRGB(XYZ) {
	// convert XYZ to linear-light sRGB

	var M = [
		[   12831 /   3959,    -329 /    214, -1974 /   3959 ],
		[ -851781 / 878810, 1648619 / 878810, 36519 / 878810 ],
		[     705 /  12673,   -2585 /  12673,   705 /    667 ],
	];

	return multiplyMatrices(M, XYZ);
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
	var M = [
		[ 608311 / 1250200, 189793 / 714400,  198249 / 1000160 ],
		[  35783 /  156275, 247089 / 357200,  198249 / 2500400 ],
		[      0 /       1,  32229 / 714400, 5220557 / 5000800 ],
	];

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_P3(XYZ) {
	// convert XYZ to linear-light P3
	var M = [
		[ 446124 / 178915, -333277 / 357830, -72051 / 178915 ],
		[ -14852 /  17905,   63121 /  35810,    423 /  17905 ],
		[  11844 / 330415,  -50337 / 660830, 316169 / 330415 ],
	];

	return multiplyMatrices(M, XYZ);
}

// prophoto-rgb functions

function lin_ProPhoto(RGB) {
	// convert an array of prophoto-rgb values
	// where in-gamut colors are in the range [0.0 - 1.0]
	// to linear light (un-companded) form.
	// Transfer curve is gamma 1.8 with a small linear portion
	// Extended transfer function
	const Et2 = 16/512;
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs <= Et2) {
			return val / 16;
		}

		return sign * Math.pow(abs, 1.8);
	});
}

function gam_ProPhoto(RGB) {
	// convert an array of linear-light prophoto-rgb  in the range 0.0-1.0
	// to gamma corrected form
	// Transfer curve is gamma 1.8 with a small linear portion
	// TODO for negative values, extend linear portion on reflection of axis, then add pow below that
	const Et = 1/512;
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs >= Et) {
			return sign * Math.pow(abs, 1/1.8);
		}

		return 16 * val;
	});
}

function lin_ProPhoto_to_XYZ(rgb) {
	// convert an array of linear-light prophoto-rgb values to CIE XYZ
	// using  D50 (so no chromatic adaptation needed afterwards)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = [
		[ 0.7977604896723027,  0.13518583717574031,  0.0313493495815248     ],
		[ 0.2880711282292934,  0.7118432178101014,   0.00008565396060525902 ],
		[ 0.0,                 0.0,                  0.8251046025104601     ]
	];

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_ProPhoto(XYZ) {
	// convert XYZ to linear-light prophoto-rgb
	var M = [
	  	[  1.3457989731028281,  -0.25558010007997534,  -0.05110628506753401 ],
	  	[ -0.5446224939028347,   1.5082327413132781,    0.02053603239147973 ],
	  	[  0.0,                  0.0,                   1.2119675456389454  ]
	];

	return multiplyMatrices(M, XYZ);
}

// a98-rgb functions

function lin_a98rgb(RGB) {
	// convert an array of a98-rgb values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// negative values are also now accepted
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

	  	return sign * Math.pow(abs, 563/256);
	});
}

function gam_a98rgb(RGB) {
	// convert an array of linear-light a98-rgb  in the range 0.0-1.0
	// to gamma corrected form
	// negative values are also now accepted
	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		return sign * Math.pow(abs, 256/563);
	});
}

function lin_a98rgb_to_XYZ(rgb) {
	// convert an array of linear-light a98-rgb values to CIE XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// has greater numerical precision than section 4.3.5.3 of
	// https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
	// but the values below were calculated from first principles
	// from the chromaticity coordinates of R G B W
	// see matrixmaker.html
	var M = [
		[ 573536 /  994567,  263643 / 1420810,  187206 /  994567 ],
		[ 591459 / 1989134, 6239551 / 9945670,  374412 / 4972835 ],
		[  53769 / 1989134,  351524 / 4972835, 4929758 / 4972835 ],
	];

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_a98rgb(XYZ) {
	// convert XYZ to linear-light a98-rgb
	var M = [
		[ 1829569 /  896150, -506331 /  896150, -308931 /  896150 ],
		[ -851781 /  878810, 1648619 /  878810,   36519 /  878810 ],
		[   16779 / 1248040, -147721 / 1248040, 1266979 / 1248040 ],
	];

	return multiplyMatrices(M, XYZ);
}

//Rec. 2020-related functions

function lin_2020(RGB) {
	// convert an array of rec2020 RGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// ITU-R BT.2020-2 p.4

	const α = 1.09929682680944 ;
	const β = 0.018053968510807;

	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs < β * 4.5 ) {
			return val / 4.5;
		}

		return sign * (Math.pow((abs + α -1 ) / α, 1/0.45));
	});
}

function gam_2020(RGB) {
	// convert an array of linear-light rec2020 RGB  in the range 0.0-1.0
	// to gamma corrected form
	// ITU-R BT.2020-2 p.4

	const α = 1.09929682680944 ;
	const β = 0.018053968510807;


	return RGB.map(function (val) {
		let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs > β ) {
			return sign * (α * Math.pow(abs, 0.45) - (α - 1));
		}

		return 4.5 * val;
	});
}

function lin_2020_to_XYZ(rgb) {
	// convert an array of linear-light rec2020 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var M = [
		[ 63426534 / 99577255,  20160776 / 139408157,  47086771 / 278816314 ],
		[ 26158966 / 99577255, 472592308 / 697040785,   8267143 / 139408157 ],
		[        0 /        1,  19567812 / 697040785, 295819943 / 278816314 ],
	];
	// 0 is actually calculated as  4.994106574466076e-17

	return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_2020(XYZ) {
	// convert XYZ to linear-light rec2020
	var M = [
		[  30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100 ],
		[ -19765991 / 29648200, 47925759 / 29648200,   467509 / 29648200 ],
		[    792561 / 44930125, -1921689 / 44930125, 42328811 / 44930125 ],
	];

	return multiplyMatrices(M, XYZ);
}

// Chromatic adaptation

function D65_to_D50(XYZ) {
	// Bradford chromatic adaptation from D65 to D50
	// The matrix below is the result of three operations:
	// - convert from XYZ to retinal cone domain
	// - scale components from one reference white to another
	// - convert back to XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
	var M =  [
		[  1.0479298208405488,    0.022946793341019088,  -0.05019222954313557 ],
		[  0.029627815688159344,  0.990434484573249,     -0.01707382502938514 ],
		[ -0.009243058152591178,  0.015055144896577895,   0.7518742899580008  ]
	];

	return multiplyMatrices(M, XYZ);
}

function D50_to_D65(XYZ) {
	// Bradford chromatic adaptation from D50 to D65
	var M = [
		[  0.9554734527042182,   -0.023098536874261423,  0.0632593086610217   ],
		[ -0.028369706963208136,  1.0099954580058226,    0.021041398966943008 ],
		[  0.012314001688319899, -0.020507696433477912,  1.3303659366080753   ]
	];

	return multiplyMatrices(M, XYZ);
}

// CIE Lab and LCH

function XYZ_to_Lab(XYZ) {
	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	var ε = 216/24389;  // 6^3/29^3
	var κ = 24389/27;   // 29^3/3^3

	// compute xyz, which is XYZ scaled relative to reference white
	var xyz = XYZ.map((value, i) => value / D50[i]);

	// now compute f
	var f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);

	return [
		(116 * f[1]) - 16, 	 // L
		500 * (f[0] - f[1]), // a
		200 * (f[1] - f[2])  // b
	];
	// L in range [0,100]. For use in CSS, add a percent
}

function Lab_to_XYZ(Lab) {
	// Convert Lab to D50-adapted XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	var κ = 24389/27;   // 29^3/3^3
	var ε = 216/24389;  // 6^3/29^3
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
	return xyz.map((value, i) => value * D50[i]);
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

// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484

function XYZ_to_OKLab(XYZ) {
	// Given XYZ relative to D65, convert to OKLab
	var XYZtoLMS = [
		[ 0.8190224432164319,    0.3619062562801221,   -0.12887378261216414  ],
		[ 0.0329836671980271,    0.9292868468965546,     0.03614466816999844 ],
		[ 0.048177199566046255,  0.26423952494422764,    0.6335478258136937  ]
	];
	var LMStoOKLab = [
		[  0.2104542553,   0.7936177850,  -0.0040720468 ],
		[  1.9779984951,  -2.4285922050,   0.4505937099 ],
		[  0.0259040371,   0.7827717662,  -0.8086757660 ]
	];

	var LMS = multiplyMatrices(XYZtoLMS, XYZ);
	return multiplyMatrices(LMStoOKLab, LMS.map(c => Math.cbrt(c)));
	// L in range [0,1]. For use in CSS, multiply by 100 and add a percent
}

function OKLab_to_XYZ(OKLab) {
	// Given OKLab, convert to XYZ relative to D65
	var LMStoXYZ =  [
		[  1.2268798733741557,  -0.5578149965554813,   0.28139105017721583 ],
		[ -0.04057576262431372,  1.1122868293970594,  -0.07171106666151701 ],
		[ -0.07637294974672142, -0.4214933239627914,   1.5869240244272418  ]
	];
	var OKLabtoLMS = [
        [ 0.99999999845051981432,  0.39633779217376785678,   0.21580375806075880339  ],
        [ 1.0000000088817607767,  -0.1055613423236563494,   -0.063854174771705903402 ],
        [ 1.0000000546724109177,  -0.089484182094965759684, -1.2914855378640917399   ]
    ];

	var LMSnl = multiplyMatrices(OKLabtoLMS, OKLab);
	return multiplyMatrices(LMStoXYZ, LMSnl.map(c => c ** 3));
}

function OKLab_to_OKLCH(OKLab) {
	var hue = Math.atan2(OKLab[2], OKLab[1]) * 180 / Math.PI;
	return [
		OKLab[0], // L is still L
		Math.sqrt(OKLab[1] ** 2 + OKLab[2] ** 2), // Chroma
		hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
	];
}

function OKLCH_to_OKLab(OKLCH) {
	return [
		OKLCH[0], // L is still L
		OKLCH[1] * Math.cos(OKLCH[2] * Math.PI / 180), // a
		OKLCH[1] * Math.sin(OKLCH[2] * Math.PI / 180)  // b
	];
}

// Premultiplied alpha conversions

function rectangular_premultiply(color, alpha) {
// given a color in a rectangular orthogonal colorspace
// and an alpha value
// return the premultiplied form
	return color.map((c) => c * alpha)
}

function rectangular_un_premultiply(color, alpha) {
// given a premultiplied color in a rectangular orthogonal colorspace
// and an alpha value
// return the actual color
	if (alpha === 0) {
		return color; // avoid divide by zero
	}
	return color.map((c) => c / alpha)
}

function polar_premultiply(color, alpha, hueIndex) {
	// given a color in a cylindicalpolar colorspace
	// and an alpha value
	// return the premultiplied form.
	// the index says which entry in the color array corresponds to hue angle
	// for example, in OKLCH it would be 2
	// while in HSL it would be 0
	return color.map((c, i) => c * (hueIndex === i? 1 : alpha))
}

function polar_un_premultiply(color, alpha, hueIndex) {
	// given a color in a cylindicalpolar colorspace
	// and an alpha value
	// return the actual color.
	// the hueIndex says which entry in the color array corresponds to hue angle
	// for example, in OKLCH it would be 2
	// while in HSL it would be 0
	if (alpha === 0) {
		return color; // avoid divide by zero
	}
	return color.map((c, i) => c / (hueIndex === i? 1 : alpha))
}

// Convenience functions can easily be defined, such as
function hsl_premultiply(color, alpha) {
	return polar_premultiply(color, alpha, 0);
}
