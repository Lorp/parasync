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
	if (attrs)
		Object.assign(el, attrs);
	return el;
}

function updateFvs (initialize) {

	let fvsA = [], fvsS;
	Qall("#sliders li").forEach(li => {
		let elRange = li.querySelector("input[type=range]");
		let elText = li.querySelector("input[type=text]");
		let tag = li.querySelector("label").textContent;
		if (initialize)
			elRange.value = axes[tag].default;
		fvsA.push(`"${tag}" ${elRange.value}`);
		elText.value = elRange.value;
	});
	fvsS = fvsA.join();
	for (let el of Qall(".sample"))
		el.style.fontVariationSettings = fvsS;
}

function newFontPanel(font) {

	let filename = font.filename || "";
	let fontBox = Q(".panel.fontbox").cloneNode(true); // deep clone
	fontBox.innerHTML = fontBox.innerHTML.replace("$FONTNAME$", font.name);

	if (typeof font.src == "string") {
		let match = font.src.match(/(\/|\()([^/(]+)\)$/);
		filename = match[2];
	}
	fontBox.innerHTML = fontBox.innerHTML.replace("$FILENAME$", filename);
	fontBox.style.display = "inline-block";
	let family = font.family || "DEFAULT-" + font.name;
	let webfontFace = new FontFace(family, font.src);

	webfontFace.load().then(webfontFace => {
		document.fonts.add(webfontFace);
		for (let el of fontBox.querySelectorAll(".sample"))
			el.style.fontFamily = `${webfontFace.family},AdobeBlank`;
	});

	Q("#container").insertBefore(fontBox, Q(".panel.dragdrop"));
}


// initialize things
let dragdropId = 0;

let fonts = [
	{ name: "Amstelvar", src: "url(fonts/AmstelvarA2-Roman_avar2.ttf)" },
	{ name: "RobotoFlex", src: "url(fonts/RobotoFlex[GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght].ttf)" },
	{ name: "ScienceGothic", src: "url(fonts/ScienceGothic[YOPQ,wdth,wght,slnt].ttf)" },
	{ name: "CaliperFlex", src: "url(fonts/CaliperFlex-VF.ttf)" },
	{ name: "Squeak", src: "url(fonts/Squeak-VF.ttf)" },
	{ name: "Mihuri", src: "url(fonts/Mihuri_Para.ttf)" },
];

let axes = {
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
for (let sample of Qall(".sample")) {
	sample.addEventListener("input", e => {
		
		let size;
		if (e.target.classList.contains("small"))
			size = "small";
		else if (e.target.classList.contains("medium"))
			size = "medium";
		else if (e.target.classList.contains("large"))
			size = "large";

		for (let el of Qall(`.${size}`)) {
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
			newFontPanel({name: name, family: family, src: this.result, filename: file.name});
			dragdropId++;
		};
		reader.readAsArrayBuffer(file);
	}
    Q(".panel.dragdrop form").reset();
}

// set axes to default locations
updateFvs(true);
