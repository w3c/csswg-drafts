(document.body.oninput = evt => {

let θ1 = +theta1.value;
let θ2 = +theta2.value;

let range = normalizeAngleRange(θ1, θ2);

theta1n.textContent = range[0];
theta2n.textContent = range[1];

let colors = interpolate(range[0], range[1], 10).map(θ => `hsl(${θ}, 100%, 50%)`);
gradient.style.background = `linear-gradient(to right, ${colors.join(", ")})`;

})();

function normalizeAngle (θ) {
	return (θ % 360 + 360) % 360;
}

function normalizeAngleRange(θ1, θ2) {
	let algorithm = document.querySelector("input[name=algorithm]:checked").value;

	if (algorithm === "current-spec") {
		θ1 = normalizeAngle(θ1);
		θ2 = normalizeAngle(θ2);
	}
	else {
		let θmax = Math.max(θ1, θ2);
		let θmin = Math.min(θ1, θ2);
		let Δ = θmax - θmin;

		// Min common number of turns
		let T = Math.floor(θmin / 360);

		// Cap Δ at 360
		if (Δ > 360) {
			Δ = Δ % 360;
			if (Δ === 0) {
				Δ = 360;
			}
		}
		if (θmax === θ1) {
			θ1 = θ2 + Δ;
		}
		else {
			θ2 = θ1 + Δ;
		}

		// Subtract min common number of turns from both
		θ1 -= T * 360;
		θ2 -= T * 360;
	}

	return [θ1, θ2];
}

function interpolate (start, end, steps) {
	let ret = [];
	let step = (end - start) / steps;
	for (let i = 0; i < steps; i++) {
		ret.push(start + step * i);
	}
	return ret;
}