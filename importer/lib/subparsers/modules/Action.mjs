import camelCase from '../../updash/camelCase';

import { expandUrl, paramBuilder, isEmpty } from '../../common';
import ParseFunctions from '../ParseFunctions';
import ParseError from '../../ParseError';

export default {
	parse(source, app) {
		const action = {};
		action.type_id = 4;
		action.name = camelCase(source.key);
		action.label = source.label;
		action.description = source.help_text;
		if (app.connections.length !== 0) action.connection = app.name;
		action.expect = ParseFunctions.parseParameters(source.fields);
		action.api = [
			{
				method: 'POST',
				body: paramBuilder(action.expect, expandUrl(source.url)),
				url: expandUrl(source.url),
				response: '{{body}}'
			}
		];
		if (!isEmpty(action.api[0].qs)) {
			app.errors.push(new ParseError(
				'action.api.bodyImplicit',
				`The body for action ${action.label} was generated automatically. Should be reviewed.`,
				1
			));
		}
		action.parameters = [];
		if (source.action_fields_result_url) {
			app.errors.push(new ParseError(
				'action.interface.generated',
				`The interface for action ${action.label} is being generated using RPC.`,
				4
			));
			const rpc = {};
			if (app.connections.length !== 0) rpc.connection = app.name;
			rpc.label = `Interface for ${action.label}`;
			rpc.name = `generatedInterface${camelCase(source.key)}`;
			rpc.parameters = [];
			rpc.api = {
				url: expandUrl(source.action_fields_result_url),
				method: 'GET',
				response: '{{body}}'
			};
			app.rpcs.push(rpc);
			action.interface = [`rpc://${rpc.name}`];
		} else {
			action.interface = [];
		}
		action.samples = {};
		action.scope = [];
		return action;
	}
};
