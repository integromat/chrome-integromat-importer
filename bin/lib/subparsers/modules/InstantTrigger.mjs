import camelCase from '../../updash/camelCase.mjs';

import ParseFunctions from '../ParseFunctions.mjs';

export default {
	parse(source, webhook) {
		const instantTrigger = {};
		instantTrigger.type_id = 10;
		instantTrigger.webhook = webhook;
		instantTrigger.label = source.label;
		instantTrigger.description = source.help_text;
		instantTrigger.name = camelCase(source.key);

		instantTrigger.api = {};
		instantTrigger.parameters = ParseFunctions.parseZapierParameters(source.fields);
		instantTrigger.interface = ParseFunctions.parseZapierInterface(source.associated_override);
		instantTrigger.samples = {};
		return instantTrigger;
	}
};
