import { expandUrl, reorder } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(raw, app) {
		app.errors.push(new ParseError(
			'connection/oauth-2/register',
			'The app is using OAuth 2 connection. A Client ID and Client Secret have to be generated for the app.',
			6
		));

		const connection = {};
		connection.type = 'oauth';
		connection.label = `${raw.title}`;
		connection.name = app.name;
		connection.parameters = [
			{
				name: `clientId`,
				type: `text`,
				label: `Client ID`,
				advanced: true
			},
			{
				name: `clientSecret`,
				type: `text`,
				label: `Client Secret`,
				advanced: true
			}
		].concat(ParseFunctions.parseZapierParameters(raw.auth_fields.filter(field => {
			return (!['access_token', 'refresh_token'].includes(field.key));
		})));
		connection.common = {
			clientId: 'ENTER_CLIENT_ID_HERE',
			clientSecret: 'ENTER_CLIENT_SECRET_HERE'
		};
		if (raw.oauth_data__scope) {
			if (raw.oauth_data__scope.includes(',')) {
				connection.scope = raw.oauth_data__scope.split(',');
			} else {
				connection.scope = raw.oauth_data__scope.split(' ');
			}
		} else {
			connection.scope = [];
		}
		connection.scopes = {};
		app.errors.push(new ParseError(
			'connection/oauth-2/scope-names',
			'Human readable scope names should be provided.',
			1
		));

		if (raw.oauth_data__access_token_placement !== 'header') {
			app.errors.push(new ParseError(
				'connection/oauth-2/token-not-in-headers',
				'Access token isn\'t being sent in request headers. The connection should be reviewed.',
				5
			));
		}

		connection.api = {
			authorize: {
				qs: {
					scope: `{{join(oauth.scope, ',')}}`,
					client_id: `{{ifempty(parameters.clientId, common.clientId)}}`,
					redirect_uri: `{{oauth.redirectUri}}`,
					response_type: `code`
				},
				url: `${expandUrl(raw.oauth_data__authorization_url)}`,
				response: {
					temp: {
						code: `{{query.code}}`
					}
				}
			},
			token: {
				url: `${expandUrl(raw.oauth_data__access_token_url)}`,
				body: {
					code: `{{temp.code}}`,
					client_id: `{{ifempty(parameters.clientId, common.clientId)}}`,
					grant_type: `authorization_code`,
					redirect_uri: `{{oauth.redirectUri}}`,
					client_secret: `{{ifempty(parameters.clientSecret, common.clientSecret)}}`
				},
				type: `urlencoded`,
				method: `POST`,
				response: {
					data: {
						accessToken: `{{body.access_token}}`
					}
				},
				log: {
					sanitize: [`request.body.code`, `request.body.client_secret`, `response.body.access_token`]
				}
			}
		};

		if (raw.test_trigger != null) {
			const testTrigger = raw.triggers.find(trigger => {
				return trigger.id === raw.test_trigger;
			});
			connection.api.info = {
				url: `${expandUrl(testTrigger.url)}`,
				headers: {
					authorization: 'Bearer {{connection.accessToken}}'
				},
				log: {
					sanitize: [`request.headers.authorization`]
				}
			};

			connection.api.info = reorder(connection.api.info, ['log', 'headers', 'url'])

		}

		connection.api.authorize.qs = reorder(connection.api.authorize.qs, ['response_type', 'redirect_uri', 'client_id', 'scope']);
		connection.api.authorize = reorder(connection.api.authorize, ['response', 'url', 'qs']);
		connection.api.token.body = reorder(connection.api.token.body, ['client_secret', 'redirect_uri', 'grant_type', 'client_id', 'code']);
		connection.api.token = reorder(connection.api.token, ['log', 'response', 'method', 'type', 'body', 'url']);
		connection.api = reorder(connection.api, ['info', 'token', 'authorize']);

		app.base = {
			headers: {
				authorization: 'Bearer {{connection.accessToken}}'
			},
			log: {
				sanitize: ['request.headers.authorization']
			}
		};

		app.base = reorder(app.base, ['log', 'headers']);

		return connection;
	}
};