function objectify(array, key) {
	const output = {};
	array.forEach(item => {
		output[item[key]] = item;
	});
	return output;
}

function unmoustache(str) {
	return str.substring(
		str.lastIndexOf('{{') + 2,
		str.lastIndexOf('}}')
	);
}

function paramBuilder(parameters, url) {
	const out = {};
	parameters.forEach(parameter => {
		if (!url.includes(`{{parameters.${parameter.name}}}`)) {
			out[parameter.name] = `{{parameters.${parameter.name}}}`;
		}
	});
	return out;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getColorCode(r, g, b) {
	return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

function expandUrl(url) {
	if (url) {
		return url.replace(new RegExp('{{', 'g'), '{{parameters.');
	} else {
		return '';
	}
}

function isEmpty(object) {
	return (object && Object.keys(object).length === 0 && object.constructor === Object);
}

export { objectify, unmoustache, paramBuilder, getRandomInt, getColorCode, expandUrl, isEmpty };
