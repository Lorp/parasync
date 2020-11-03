// Parasync: script.js


// shorthands
function Q (selector) {
	return document.querySelector(selector);
}

function Qall (selector) {
	return document.querySelectorAll(selector);
}

function EL (tag) {
	return document.createElement(tag);
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

	{
		name: "Amstelvar-Roman",
		src: "url(fonts/Amstelvar-Roman[wdth,wght,opsz].ttf)",
	},

	{
		name: "RobotoFlex",
		src: "url(fonts/RobotoFlex[slnt,wdth,wght,opsz].ttf)",
	},

	{
		name: "ScienceGothic",
		src: "url(fonts/ScienceGothic[YOPQ,wdth,wght,slnt].ttf)",
	},

	{
		name: "CaliperFlex-VF",
		src: "url(fonts/CaliperFlex-VF.ttf)",
	},

	{
		name: "RL-VF",
		src: "url(fonts/RL-VF.ttf)",
	},

];


let axes = {

	XOPQ: {
		min: 1,
		max: 1000,
		default: 110,
	},
	XTRA: {
		min: 1,
		max: 1000,
		default: 500,
	},
	YOPQ: {
		min: 1,
		max: 1000,
		default: 75,
	},
	YTUC: {
		min: 1,
		max: 1000,
		default: 640,
	},
	YTSE: {
		min: 1,
		max: 1000,
		default: 90,
	},
	YOSE: {
		min: 1,
		max: 1000,
		default: 90,
	},
	YTLC: {
		min: 1,
		max: 1000,
		default: 500,
	},
	YTAS: {
		min: 1,
		max: 1000,
		default: 740,
	},
	YTDE: {
		min: -1000,
		max: 0,
		default: -200,
	},
};


Object.keys(axes).forEach(tag => {
	let axis = axes[tag];
	let row = EL("li");
	row.classList.add("axis-record");

	let label = EL("label");
	let input = EL("input");
	let numeric = EL("input");

	console.log(input);
	console.log(axis);

	input.setAttribute("type", "range");
	input.setAttribute("min", axis.min);
	input.setAttribute("max", axis.max);
	input.setAttribute("value", 5);
	label.textContent = tag;
	numeric.setAttribute("type", "text");

	console.log(Q("#sliders"));

	row.appendChild(label);
	row.appendChild(input);
	row.appendChild(numeric);

	Q("#sliders").appendChild(row);

	input.addEventListener("input", e => {
		updateFvs();
	})

});



fonts.forEach (font => {
	let fontBox = Q(".panel.fontbox").cloneNode(true); // deep clone
	fontBox.innerHTML = fontBox.innerHTML.replace("$FONTNAME$", font.name);
	fontBox.style.display = "inline-block";

	let fontFamily = "DEFAULT-" + font.name;
	let webfontFace = new FontFace(fontFamily, font.src);
	console.log(font.src);
	webfontFace.load().then(webfontFace => {
		document.fonts.add(webfontFace);
	});

	fontBox.querySelectorAll(".sample").forEach(el => { el.style.fontFamily = fontFamily} );

	Q("#container").appendChild(fontBox);

});


Q(".panel.title .reset").onclick = function () {
	updateFvs(true);
};


updateFvs(true);


