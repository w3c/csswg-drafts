// Find minimum bt dept to retain all 256 gamma-encoded sRGB values in srgb-linear
// lin8: 183
// lin10: 238
// lin12: 256 = OK
// lin14: 256
// lin16: 256

let lin8 = new Set();
let lin10 = new Set();
let lin12 = new Set();
let lin14 = new Set();
let lin16 = new Set();

for (let i=0; i<=255; i++) {
    let gam = i / 255;
    let lin = toLin(gam);
    lin8.add(Math.round(lin * 255));
    lin10.add(Math.round(lin * 1023));
    lin12.add(Math.round(lin * 4095));
    lin14.add(Math.round(lin * 16383));
    lin16.add(Math.round(lin * 65535));
}

console.log(lin8.size);
console.log(lin10.size);
console.log(lin12.size);
console.log(lin14.size);
console.log(lin16.size);

function toLin(val) {
    let sign = val < 0? -1 : 1;
		let abs = Math.abs(val);

		if (abs < 0.04045) {
			return val / 12.92;
		}

		return sign * (Math.pow((abs + 0.055) / 1.055, 2.4));
}