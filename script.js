// Parasync: script.js


// shorthands
function Q (selector) {
	return document.querySelector(selector);
}

function Qall (selector) {
	return document.querySelectorAll(selector);
}

function EL (tag, attrs) {
	let el = document.createElement(tag);
	if (attrs) {
		Object.keys(attrs).forEach(property => {
			el[property] = attrs[property];
		});
	}
	return el;
}

function updateFvs (initialize) {

	let fvsA = [];
	Qall("#sliders li").forEach(li => {
		let elRange = li.querySelector("input[type=range]");
		let elText = li.querySelector("input[type=text]");
		let tag = li.querySelector("label").textContent;
		if (initialize)
			elRange.value = axes[tag].default;
		fvsA.push(`"${tag}" ${elRange.value}`);
		elText.value = elRange.value;

	});
	Qall(".sample").forEach(el => { el.style.fontVariationSettings = fvsA.join(); });	
}

let fonts = [
	{ name: "Amstelvar-Roman", src: "url(fonts/Amstelvar-Roman[wdth,wght,opsz].ttf)" },
	{ name: "RobotoFlex", src: "url(fonts/RobotoFlex[slnt,wdth,wght,opsz].ttf)" },
	{ name: "ScienceGothic", src: "url(fonts/ScienceGothic[YOPQ,wdth,wght,slnt].ttf)" },
	{ name: "CaliperFlex", src: "url(fonts/CaliperFlex-VF.ttf)" },
	{ name: "Squeak", src: "url(fonts/Squeak-VF.ttf)" },
];

let axes = {
	XOPQ: { min: 1, max: 1000, default: 110 },
	XTRA: { min: 1, max: 1000, default: 500 },
	YOPQ: { min: 1, max: 1000, default: 75 },
	YTUC: { min: 1, max: 1000, default: 640 },
	YTSE: { min: 1, max: 1000, default: 90 },
	YOSE: { min: 1, max: 1000, default: 90 },
	YTLC: { min: 1, max: 1000, default: 500 },
	YTAS: { min: 1, max: 1000, default: 740 },
	YTDE: { min: -1000, max: 0, default: -200 },
};


Object.keys(axes).forEach(tag => {
	let axis = axes[tag];
	let row = EL("li");
	let label = EL("label", {textContent: tag});
	let input = EL("input", {type: "range", min: axis.min, max: axis.max, value: 5});
	let numeric = EL("input", {type: "text"});

	input.addEventListener("input", e => updateFvs() );
	row.classList.add("axis-record");
	row.append(label, input, numeric);
	Q("#sliders").append(row);
});


fonts.forEach (font => {
	let fontBox = Q(".panel.fontbox").cloneNode(true); // deep clone
	fontBox.innerHTML = fontBox.innerHTML.replace("$FONTNAME$", font.name);
	let match = font.src.match(/(\/|\()([^/(]+)\)$/);
	fontBox.innerHTML = fontBox.innerHTML.replace("$FILENAME$", match[2]);
	fontBox.style.display = "inline-block";
	let fontFamily = "DEFAULT-" + font.name;
	let webfontFace = new FontFace(fontFamily, font.src);
	webfontFace.load().then(webfontFace => {
		document.fonts.add(webfontFace);
	});

	fontBox.querySelectorAll(".sample").forEach(el => { el.style.fontFamily = fontFamily} );

	Q("#container").insertBefore(fontBox, Q(".panel.dragdrop"));

});


// handle reset
Q(".panel.title .reset").onclick = function () {
	updateFvs(true);
};

// handle text entry in the editable fields: copy it to all other fields of that size
Qall(".sample").forEach(sample => {
	sample.addEventListener("input", e => {
		
		let size;
		if (e.target.classList.contains("small"))
			size = "small";
		else if (e.target.classList.contains("medium"))
			size = "medium";
		else if (e.target.classList.contains("large"))
			size = "large";

		Qall(`.${size}`).forEach(el => {
			if (el != e.target)
				el.textContent = e.target.textContent;
		});
	});
});


updateFvs(true);

