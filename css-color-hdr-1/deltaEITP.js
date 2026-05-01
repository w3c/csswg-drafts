// Calculate deltaE ITP
// scaled root sum of squares
// ITU-R BT.2124-0 Annex 1
/**
 * @param {number[]} reference - Array of ICtCp: I as 0..1, Ct and Cp as -1..1
 * @param {number[]} sample -    Array of ICtCp: I as 0..1, Ct and Cp as -1..1
 * @return {number} How different a color sample is from reference
 */
function deltaEITP (reference, sample) {
    let [I1, Ct1, Cp1] = reference;
	let [I2, Ct2, Cp2] = sample;
	let ΔI = I1 - I2;
	let ΔT = 0.5 * (Ct1 - Ct2);
	let ΔP = Cp1 - Cp2;
	return 720 * Math.sqrt(ΔI ** 2 + ΔT ** 2 + ΔP ** 2);
}