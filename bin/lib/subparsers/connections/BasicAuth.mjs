import { unmoustache, expandUrl } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';

export default {
	parse(raw, app) {
		const connection = {};
		connection.type = 'basic';
		connection.label = `${raw.title}`;
		connection.name = app.name;
		connection.parameters = ParseFunctions.parseZapierParameters(raw.auth_fields);
		connection.common = {};
		connection.scope = [];
		connection.scopes = {};
		const usernameKey = unmoustache(raw.auth_mapping.username);
		const passwordKey = unmoustache(raw.auth_mapping.password);

		if (raw.test_trigger != null) {
			const testTrigger = raw.triggers.find(trigger => {
				return trigger.id === raw.test_trigger;
			});
			connection.api = {
				url: `${expandUrl(testTrigger.url)}`,
				headers: {
					authorization: `Basic {{base64(parameters.${usernameKey}+':'+parameters.${passwordKey})}}`
				},
				log: {
					sanitize: ['request.headers.authorization']
				}
			};
		} else {
			connection.api = {};
		}

		app.base.headers = {
			authorization: `Basic {{base64(connection.${usernameKey}+':'+connection.${passwordKey})}}`
		};
		app.base.log = {
			sanitize: ['request.headers.authorization']
		};

		return connection;
	}
};
