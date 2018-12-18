import Parser from './lib/Parser.mjs';
import Builder from './lib/Builder.mjs';

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
