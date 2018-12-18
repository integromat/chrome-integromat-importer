import { unmoustache, expandUrl } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(raw, app) {
		const connection = {};
		connection.type = 'apikey';
		connection.label = `${raw.title}`;
		connection.name = app.name;
		connection.parameters = ParseFunctions.parseParameters(raw.auth_fields);
		connection.common = {};
		connection.scope = [];
		connection.scopes = {};

		let connectionKey = null;
		if (raw.auth_mapping.api_key != null) {
			connectionKey = 'api_key';
		} else {
			app.errors.push(new ParseError(
				'connection.api.apiKeyNotFound',
				'Field "api_key" was not found during the connection generation. The authorization template may be incorrect.',
				3
			));
			connectionKey = Object.keys(raw.auth_mapping)[0];
		}
		const connectionValue = unmoustache(raw.auth_mapping[connectionKey]);

		const qs = {};
		qs[connectionKey] = `{{parameters.${connectionValue}}}`;

		if (raw.test_trigger != null) {
			const testTrigger = raw.triggers.find(trigger => {
				return trigger.id === raw.test_trigger;
			});
			connection.api = {
				url: `${expandUrl(testTrigger.url)}`,
				qs: qs,
				log: {
					sanitize: [`request.qs.${connectionKey}`]
				}
			};
		} else {
			connection.api = {};
		}

		qs[connectionKey] = `{{connection.${connectionValue}}}`;
		app.base.qs = qs;
		app.base.log = {
			sanitize: [`request.qs.${connectionKey}`]
		};

		return connection;
	}
};
