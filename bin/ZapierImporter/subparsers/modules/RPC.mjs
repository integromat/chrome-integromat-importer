import camelCase from '../../updash/camelCase.mjs';

import { expandUrl, paramBuilder, isEmpty, reorder } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(source, app, raw) {
		if (source.paging !== false) {
			app.errors.push(new ParseError(
				'rpc/paging',
				`The RPC ${source.label} is using pagination. This has to be implemented manually.`,
				4
			));
		}

		const rpc = {};
		if (app.connections.length !== 0) rpc.connection = app.name;
		rpc.label = source.label;
		rpc.name = camelCase(source.key);
		rpc.parameters = ParseFunctions.parseZapierParameters(source.fields);
		rpc.api = {
			qs: paramBuilder(rpc.parameters, expandUrl(source.url)),
			url: expandUrl(source.url),
			method: 'GET'
		};

		if (!isEmpty(rpc.api.qs)) {
			app.errors.push(new ParseError(
				'rpc/implicit-qs',
				`The query string for RPC ${rpc.name} was generated automatically. Should be reviewed.`,
				1
			));
		}

		// Try to find prefill pattern
		let pattern = undefined;
		['triggers', 'searches', 'actions'].forEach(group => {
			if (pattern === undefined) {
				raw[group].find(item => {
					return item.fields.find(field => {
						if (field.prefill != null && field.prefill.match(rpc.name)) {
							pattern = field.prefill;
							return true;
						}
					});
				});
			}
		});
		if (pattern === undefined) {
			app.errors.push(new ParseError(
				'rpc/usage-not-found',
				`Usage of RPC "${rpc.name}" was not found! Response couldn\'t be generated.`,
				4
			));
		} else {
			const crumbs = pattern.split('.');
			app.errors.push(new ParseError(
				'rpc/iterate',
				`Implicitly iterating "{{body}}" in response of RPC ${rpc.name}.`,
				3
			));
			rpc.api.response = {
				iterate: '{{body}}',
				output: {
					label: `{{item.${crumbs[2]}}}`,
					value: `{{item.${crumbs[1]}}}`
				}
			};
		}
		rpc.api = reorder(rpc.api, ['response', 'qs', 'method', 'url'])
		return rpc;
	}
};
