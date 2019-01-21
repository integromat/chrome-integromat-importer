import camelCase from '../../updash/camelCase.mjs';

import { expandUrl, paramBuilder, isEmpty, reorder } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(source, app) {
		const trigger = {};
		if (app.connections.length !== 0) trigger.connection = app.name;
		trigger.type_id = 1;
		trigger.description = source.help_text;
		trigger.name = camelCase(source.key);
		trigger.label = source.label;

		trigger.parameters = ParseFunctions.parseZapierParameters(source.fields);
		trigger.api = {
			url: expandUrl(source.url),
			qs: paramBuilder(trigger.parameters, expandUrl(source.url)),
			method: 'GET',
			response: {
				iterate: '{{body}}',
				output: '{{item}}',
				trigger: {
					id: '{{item.id}}',
					type: 'id',
					order: 'desc'
				},
			}
		};
		trigger.api.response.trigger = reorder(trigger.api.response.trigger, ['order', 'type', 'id']);
		trigger.api.response = reorder(trigger.api.response, ['trigger', 'output', 'iterate']);
		trigger.api = reorder(trigger, ['response', 'method', 'qs', 'url']);

		trigger.epoch = {};
		trigger.interface = ParseFunctions.parseZapierInterface(source.associated_override);
		trigger.samples = {};

		app.errors.push(new ParseError(
			'trigger/iterate',
			`Implicitly iterating "{{body}}" in response of trigger ${trigger.name}.`,
			2
		));

		app.errors.push(new ParseError(
			'trigger/epoch',
			`Epoch for trigger ${trigger.name} can't be generated automatically.`,
			5
		));

		if (!isEmpty(trigger.api.qs)) {
			app.errors.push(new ParseError(
				'trigger/implicit-qs',
				`The query string for trigger ${trigger.name} was generated automatically. Should be reviewed.`,
				1
			));
		}
		return trigger;
	}
};
