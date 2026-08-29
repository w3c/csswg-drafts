// Calculate deltaE OKr2
// root sum of squares, lightness toe, scale a and b by 2
/**
 * @param {number[]} reference - Array of OKLab values: L as 0..1, a and b as -1..1
 * @param {number[]} sample - Array of OKLab values: L as 0..1, a and b as -1..1
 * @return {number} How different a color sample is from reference
 */
function deltaEOKr2 (reference, sample) {
    let [L1, a1, b1] = reference;
	let [L2, a2, b2] = sample;
	L1 = toe(L1);
	L2 = toe(L2);
	let ΔL = L1 - L2;
	let Δa = 2 * (a1 - a2);
	let Δb = 2 * (b1 - b2);
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
}

// Add a lightness toe
// https://bottosson.github.io/posts/colorpicker/#intermission---a-new-lightness-estimate-for-oklab
/**
 * @param {number} x - Oklab lightness
 * @return {number} Toed lightness
 */
function toe (x) {
	const K1 = 0.206;
	const K2 = 0.03;
	const K3 = (1.0 + K1) / (1.0 + K2);
	return 0.5 * (K3 * x - K1 + Math.sqrt((K3 * x - K1) * (K3 * x - K1) + 4 * K2 * K3 * x));
}