$.ready().then(() => {

let steps = {
	h: 30,
	s: 20,
	l: 10
};

let hues = {
	"0": "Reds",
	"30": "Reds-Yellows (=Oranges)",
	"60": "Yellows",
	"90": "Yellow-Greens",
	"120": "Greens",
	"150": "Green-Cyans",
	"180": "Cyans",
	"210": "Cyan-Blues",
	"240": "blues",
	"270": "Blue-Magentas",
	"300": "Magentas",
	"330": "Magenta-Reds",
};

let container = $.create("div");

for (let h = 0; h < 360; h += steps.h ) {
	let table = $.create("table", {
		innerHTML: `<thead>
			<tr>
				<th colspan="10">${h}° ${hues[h]}</th>
			</tr>
			<tr>
				<th></th>
			</tr>
		</thead>`,
		inside: container
	});
	let satHeader = $("thead tr:last-of-type", table);

	for (let s = 100; s >= 0; s -= steps.s) {
		$.create("th", {
			textContent: `${s}%`,
			inside: satHeader
		});
	}

	for (let l = 100; l >= 0; l -= steps.l) {
		// One row
		let tr = $.create("tr", {
			innerHTML: `<th>${l}%</th>`
		});

		//
		for (let s = 100; s >= 0; s -= steps.s) {
			let color = new Color("hsl", [h, s, l]);
			let td = $.create("td", {
				// style: {
				// 	"background-color": `hsl(${h} ${s}% ${l}%)`
				// },
				style: {
					"background-color": color.to("srgb")
				},
				inside: tr
			});
		}

		table.append(tr);
	}
}

document.body.append(container);

});