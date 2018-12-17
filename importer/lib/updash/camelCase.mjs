export default camelCase;

const wordSeparatorsRegEx = /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/;

const basicCamelRegEx = /^[a-z\u00E0-\u00FCA-Z\u00C0-\u00DC][\d|a-z\u00E0-\u00FCA-Z\u00C0-\u00DC]*$/;
const fourOrMoreConsecutiveCapsRegEx = /([A-Z\u00C0-\u00DC]{4,})/g;
const allCapsRegEx = /^[A-Z\u00C0-\u00DC]+$/;

function camelCase(str, options) {
	const words = str.split(wordSeparatorsRegEx);
	const len = words.length;
	const mappedWords = new Array(len);
	for (let i = 0; i < len; i++) {
		let word = words[i];
		if (word === '') {
			continue;
		}
		const isCamelCase = basicCamelRegEx.test(word) && !allCapsRegEx.test(word);
		if (isCamelCase) {
			word = word.replace(fourOrMoreConsecutiveCapsRegEx, (match, p1, offset) => {
				return deCap(match, word.length - offset - match.length == 0);
			});
		}
		let firstLetter = word[0];
		firstLetter = i > 0 ? firstLetter.toUpperCase() : firstLetter.toLowerCase();
		mappedWords[i] = firstLetter + (!isCamelCase ? word.slice(1).toLowerCase() : word.slice(1));
	}
	return mappedWords.join('');
}

function deCap(match, endOfWord) {
	const arr = match.split('');
	const first = arr.shift().toUpperCase();
	const last = endOfWord ? arr.pop().toLowerCase() : arr.pop();
	return first + arr.join('').toLowerCase() + last;
}
