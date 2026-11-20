/**
 * Change powerless components to missing components.
 *
 * A missing component is represented by null.
 *
 * @param {Array<number|null>} color - Three color components.
 * @param {string} space - One of "hsl", "hwb", "lch", or "oklch".
 * @return {Array<number|null>} A copy of color with powerless components
 *   changed to null.
 */
function powerlessToMissing (color, space) {
	let out = [...color];

	switch (space) {
		case "hsl": {
			// https://drafts.csswg.org/css-color-4/#prr-hsl
			let sat = out[1] === null ? 0 : out[1];

			if (sat <= 0.001) {
				out[0] = null;

				if (out[1] !== null && out[1] > 0) {
					out[1] = 0;
				}
			}
			break;
		}

		case "hwb": {
			// https://drafts.csswg.org/css-color-4/#prr-hwb
			let white = out[1] === null ? 0 : out[1];
			let black = out[2] === null ? 0 : out[2];

			if (white + black >= 99.999) {
				out[0] = null;

				if (white + black < 100) {
					if (out[1] === null) {
						out[2] = 100;
					} else if (out[2] === null) {
						out[1] = 100;
					} else {
						out[2] = 100 - out[1];
					}
				}
			}
			break;
		}

		case "lch": {
			// https://drafts.csswg.org/css-color-4/#prr-lch
			let chroma = out[1] === null ? 0 : out[1];

			if (chroma <= 0.0015) {
				out[2] = null;

				if (out[1] !== null && out[1] > 0) {
					out[1] = 0;
				}
			}
			break;
		}

		case "oklch": {
			// https://drafts.csswg.org/css-color-4/#prr-oklch
			let chroma = out[1] === null ? 0 : out[1];

			if (chroma <= 0.000004) {
				out[2] = null;

				if (out[1] !== null && out[1] > 0) {
					out[1] = 0;
				}
			}
			break;
		}
	}

	return out;
}
