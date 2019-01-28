import Parser from './ZapierImporter/Parser.mjs';
import Builder from './ZapierImporter/Builder.mjs';

export default {

	parseSource: (raw) => {
		return Builder.buildRequestTree(Parser.parseApp(raw));
	},

	parseRaw: (raw) => {
		return Parser.parseApp(raw);
	},

	buildRequests: (raw) => {
		return Builder.buildRequestTree(raw);
	}
};
