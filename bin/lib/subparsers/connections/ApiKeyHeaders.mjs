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

		let authorizationKey = null;
		if (raw.auth_mapping.Authorization != null) {
			authorizationKey = 'Authorization';
		} else {
			app.errors.push(new ParseError(
				'connection/api-key/header-not-found',
				`Connection Authorization header was not found. Authorization template may be incorrect.`,
				3
			));
			authorizationKey = Object.keys(raw.auth_mapping)[0];
		}
		const authorizationValue = unmoustache(raw.auth_mapping[authorizationKey]);

		const headers = {};
		headers[authorizationKey] = `${raw.auth_mapping[authorizationKey].split('{{')[0]}{{parameters.${authorizationValue}}}`;

		if (raw.test_trigger != null) {
			const testTrigger = raw.triggers.find(trigger => {
				return trigger.id === raw.test_trigger;
			});
			connection.api = {
				url: `${expandUrl(testTrigger.url)}`,
				headers: headers,
				log: {
					sanitize: [`request.headers.${authorizationKey}`]
				}
			};
		} else {
			connection.api = {};
		}

		headers[authorizationKey] = `${raw.auth_mapping[authorizationKey].split('{{')[0]}{{connection.${authorizationValue}}}`;

		app.base.headers = headers;
		app.base.log = {
			sanitize: [`request.headers.${authorizationKey}`]
		};

		return connection;
	}
};
