// Calculate deltaE OK
// simple root sum of squares

function deltaEOK (reference, sample) {
// Given reference and sample are both in OKLab
    let [L1, a1, b1] = reference;
	let [L2, a2, b2] = sample;
	let ΔL = L1 - L2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
}