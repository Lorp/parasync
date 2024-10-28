// Parasync: script.js

import { SamsaFont, SamsaBuffer } from "./samsa-core.js";

// shorthands
function Q (selector, root=document) {
	return root.querySelector(selector);
}

function QA (selector, root=document) {
	return root.querySelectorAll(selector);
}

function EL (tag, attrs) {
	let el = document.createElement(tag);
	if (attrs)
		Object.assign(el, attrs);
	return el;
}

function updateFvs (initialize) {

	let fvsA = [], fvsS;
	QA("#sliders li").forEach(li => {
		let elRange = li.querySelector("input[type=range]");
		let elText = li.querySelector("input[type=text]");
		let tag = li.querySelector("label").textContent;
		if (initialize)
			elRange.value = axes[tag].default;
		fvsA.push(`"${tag}" ${elRange.value}`);
		elText.value = elRange.value;
	});

	// go thru each font
	for (const font of fonts) {
		const thisFvsA = [...fvsA];

		// set any axes other than the editable parametric axes to their default values, to avoid the browser overriding defaults
		if (font?.fvar?.axes) {
			for (const axis of font.fvar.axes) {
				if (!Object.keys(axes).includes(axis.axisTag)) {
					thisFvsA.push(`"${axis.axisTag}" ${axis.defaultValue}`);
				}
			}
			// set all font sample elements to the new FVS
			const thisFvsS = thisFvsA.join();
			for (const sampleEl of QA(".sample", font.node)) {
				sampleEl.style.fontVariationSettings = thisFvsS;
			}
		}
	}
}

function newFontPanel(font) {

	let fontBox = Q(".panel.fontbox").cloneNode(true); // deep clone
	font.node = fontBox;
	fontBox.innerHTML = fontBox.innerHTML.replace("$FONTNAME$", font.name);

	// get the fvar table via Samsa
	if (typeof font.src == "string") {
		let match = font.src.match(/[^/]+$/);
		font.filename = match[0] ?? "unknown";
		fetch(font.src)
		.then(response => response.arrayBuffer())
		.then(arrayBuffer => {
			const samsaFont = new SamsaFont(new SamsaBuffer(arrayBuffer));
			font.fvar = samsaFont.fvar;
			updateFvs(true);
		});
	}
	else {
		const samsaFont = new SamsaFont(new SamsaBuffer(font.src));
		font.fvar = samsaFont.fvar;
		updateFvs(true);
	}

	fontBox.innerHTML = fontBox.innerHTML.replace("$FILENAME$", font.filename);
	fontBox.style.display = "inline-block";
	let family = font.family || "DEFAULT-" + font.name;

	// load the font as a webfont
	let fontSource;
	if (typeof font.src == "string")
		fontSource = `url(${font.src})`;
	else if (font.src instanceof ArrayBuffer)
		fontSource = font.src;
	else
		console.error("Unknown font source type", font.src);
	if (fontSource) {
		let webfontFace = new FontFace(family, fontSource);
		webfontFace.load().then(webfontFace => {
			document.fonts.add(webfontFace);
			for (let sampleEl of fontBox.querySelectorAll(".sample"))
				sampleEl.style.fontFamily = `${webfontFace.family},AdobeBlank`;
			updateFvs(true);
		});

		Q("#container").insertBefore(fontBox, Q(".panel.dragdrop"));
	}

	// reset any parametric axes that are in this font to this font’s defaults
	Q(".reset", fontBox).onclick = () => {
		if (font.fvar) {
			QA(".axis-record").forEach (axisEl => {
				const axisTag = axisEl.querySelector("label").textContent;
				const axis = font.fvar.axes.find(a => a.axisTag == axisTag);
				if (axis) {
					Q("input[type=range]", axisEl).value = 
					Q("input[type=text]", axisEl).value = axis.defaultValue;;
				}
			});
			updateFvs();
		}
	};
}


// initialize things
let dragdropId = 0;

let fonts = [
	{ name: "Amstelvar", src: "fonts/AmstelvarA2-Roman_avar2.ttf" },
	{ name: "RobotoFlex", src: "fonts/RobotoFlex[GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght].ttf" },
	{ name: "ScienceGothic", src: "fonts/ScienceGothic[YOPQ,wdth,wght,slnt].ttf" },
	{ name: "CaliperFlex", src: "fonts/CaliperFlex-VF.ttf" },
	{ name: "Squeak", src: "fonts/Squeak-VF.ttf" },
	{ name: "Mihuri", src: "fonts/Mihuri_Para.ttf" },
];

// these are the editable parametric axes
const axes = {
	XOPQ: { min: 1, max: 1000, default: 110 },
	XTRA: { min: 1, max: 1000, default: 340 },
	YOPQ: { min: 1, max: 1000, default: 75 },
	YTUC: { min: 1, max: 1000, default: 640 },
	YTSE: { min: 1, max: 1000, default: 90 },
	YOSE: { min: 1, max: 1000, default: 90 },
	YTLC: { min: 1, max: 1000, default: 500 },
	YTAS: { min: 1, max: 1000, default: 740 },
	YTDE: { min: -1000, max: 0, default: -200 },
};

// add axis ui
Object.keys(axes).forEach(tag => {
	let axis = axes[tag];
	let row = EL("li");
	let label = EL("label", {textContent: tag});
	let input = EL("input", {type: "range", min: axis.min, max: axis.max, value: 5});
	let numeric = EL("input", {type: "text", readOnly: true});

	input.addEventListener("input", e => updateFvs() );
	row.classList.add("axis-record");
	row.append(label, input, numeric);
	Q("#sliders").append(row);
});

// add fontbox panels for all the default fonts
for (let font of fonts)
	newFontPanel(font);

// handle reset
Q(".panel.title .reset").onclick = () => {
	updateFvs(true);
};

// handle text entry in the editable fields: copy it to all other fields of that size
for (let sample of QA(".sample")) {
	sample.addEventListener("input", e => {
		
		let size;
		if (e.target.classList.contains("small"))
			size = "small";
		else if (e.target.classList.contains("medium"))
			size = "medium";
		else if (e.target.classList.contains("large"))
			size = "large";

		for (let el of QA(`.${size}`)) {
			if (el != e.target)
				el.textContent = e.target.textContent;
		}
	});
}

// handle dragdrop (multiple is ok)
Q("#dropzone").onchange = e => {
	for (let file of e.target.files) {
	    const reader = new FileReader();
	    reader.onload = function (e) {
	    	let family = `DRAGDROP-${dragdropId}`;
	    	let name = file.name.replace(/\.ttf$/, "");
			let font = {name: name, family: family, filename: file.name, src: this.result}; // this.result is an ArrayBuffer
			newFontPanel(font);
			fonts.push(font);
			dragdropId++;
		};
		reader.readAsArrayBuffer(file);
	}
    Q(".panel.dragdrop form").reset();
}

