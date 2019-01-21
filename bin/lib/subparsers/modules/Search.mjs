import camelCase from '../../updash/camelCase.mjs';

import { expandUrl, paramBuilder, isEmpty, reorder } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(source, app) {
		const search = {};
		search.type_id = 9;
		search.name = camelCase(source.key);
		search.label = source.label;
		search.description = source.help_text;
		if (app.connections.length !== 0) search.connection = app.name;
		search.expect = ParseFunctions.parseZapierParameters(source.fields);
		search.api = [
			{
				qs: paramBuilder(search.expect, expandUrl(source.url)),
				method: 'GET',
				url: expandUrl(source.url),
				response: '{{body}}'
			}
		];

		if (!isEmpty(search.api[0].qs)) {
			app.errors.push(new ParseError(
				'search/implicit-qs',
				`The query string for search ${search.label} was generated automatically. Should be reviewed.`,
				1
			));
		}
		search.api = reorder(search.api, ['response', 'qs', 'method', 'url']);
		search.parameters = [];
		if (source.search_fields_result_url) {
			app.errors.push(new ParseError(
				'search/generated-interface',
				`The interface for search ${search.label} is being generated using RPC.`,
				4
			));
			const rpc = {};
			if (app.connections.length !== 0) rpc.connection = app.name;
			rpc.label = `Interface for ${search.label}`;
			rpc.name = `generatedInterface${camelCase(source.key)}`;
			rpc.parameters = [];
			rpc.api = {
				url: expandUrl(source.action_fields_result_url),
				method: 'GET',
				response: {
					output: '{{parseZapierParameters(body)}}'
				}
			};
			rpc.api = reorder(rpc.api, ['response', 'method', 'url']);
			app.rpcs.push(rpc);
			search.interface = [`rpc://${rpc.name}`];
		} else {
			search.interface = [];
		}
		search.samples = {};
		search.scope = [];
		return search;
	}
};
