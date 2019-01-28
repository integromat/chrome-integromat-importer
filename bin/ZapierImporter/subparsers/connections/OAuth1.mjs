import { expandUrl, reorder } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(raw, app) {
		app.errors.push(new ParseError(
			'connection/oauth-1/register',
			'The app is using OAuth 1 connection. A Consumer Key and Consumer Secret have to be generated for the app.',
			6
		));

		const connection = {};
		connection.type = 'oauth-1';
		connection.label = `${raw.title}`;
		connection.name = app.name;

		connection.parameters = [
			{
				name: `consumerKey`,
				type: `text`,
				label: `Consumer Key`,
				advanced: true
			},
			{
				name: `consumerKey`,
				type: `text`,
				label: `Consumer Secret`,
				advanced: true
			}
		].concat(ParseFunctions.parseZapierParameters(raw.auth_fields.filter(field => {
			return (!['oauth_token', 'oauth_token_secret'].includes(field.key));
		})));

		connection.common = {
			consumerKey: `ENTER_CUSTOMER_KEY_HERE`,
			consumerSecret: `ENTER_CUSTOMER_SECRET_HERE`
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
			'connection/oauth-1/scope-names',
			'Human readable scope names should be provided.',
			1
		));

		if (raw.oauth_data && raw.oauth_data.access_token_placement !== 'header') {
			app.errors.push(new ParseError(
				'connection/oauth-1/token-not-in-headers',
				'Access token isn\'t being sent in request headers. The connection should be reviewed.',
				5
			));
		}

		connection.api = {
			oauth: {
				consumer_key: `{{ifempty(parameters.consumerKey, common.consumerKey)}}`,
				consumer_secret: `{{ifempty(parameters.consumerSecret, common.consumerSecret)}}`
			},
			requestToken: {
				url: `${expandUrl(raw.oauth_data__request_token_url)}`,
				method: `POST`,
				response: {
					temp: {
						token: `{{body.oauth_token}}`,
						token_secret: `{{body.oauth_token_secret}}`
					},
					type: `urlencoded`
				}
			},
			authorize: {
				url: `${expandUrl(raw.oauth_data__authorization_url)}`,
				oauth: {
					token: `{{temp.token}}`
				},
				response: {
					temp: {
						token: `{{query.oauth_token}}`,
						verifier: `{{query.oauth_verifier}}`
					},
					type: `urlencoded`
				}
			},
			accessToken: {
				url: `${expandUrl(raw.oauth_data__access_token_url)}`,
				type: `urlencoded`,
				oauth: {
					token: `{{temp.token}}`,
					verifier: `{{temp.verifier}}`,
					token_secret: `{{temp.token_secret}}`
				},
				method: `POST`,
				response: {
					data: {
						token: `{{body.oauth_token}}`,
						token_secret: `{{body.oauth_token_secret}}`
					},
					type: `urlencoded`
				}
			}
		};

		if (raw.test_trigger != null) {
			const testTrigger = raw.triggers.find(trigger => {
				return trigger.id === raw.test_trigger;
			});
			connection.api.info = {
				url: `${expandUrl(testTrigger.url)}`,
				oauth: {
					token: `{{connection.token}}`,
					token_secret: `{{connection.token_secret}}`
				}
			};

			connection.api.info.oauth = reorder(connection.api.info.oauth, ['token_secret', 'token']);
			connection.api.info = reorder(connection.api.info, ['oauth', 'url'])

		}

		connection.api.oauth = reorder(connection.api.oauth, ['consumer_secret', 'consumer_key']);
		connection.api.requestToken.response.temp = reorder(connection.api.requestToken.response.temp, ['token_secret', 'token']);
		connection.api.requestToken.response = reorder(connection.api.requestToken.response, ['type', 'temp']);
		connection.api.requestToken = reorder(connection.api.requestToken, ['response', 'method', 'url']);
		connection.api.authorize.response.temp = reorder(connection.api.authorize.response.temp, ['verifier', 'token']);
		connection.api.authorize.response = reorder(connection.api.authorize.response, ['type', 'temp']);
		connection.api.authorize = reorder(connection.api.authorize, ['response', 'oauth', 'url']);
		connection.api.accessToken.response.data = reorder(connection.api.accessToken.response.data, ['token_secret', 'token']);
		connection.api.accessToken.response = reorder(connection.api.accessToken.response, ['type', 'data']);
		connection.api.accessToken.oauth = reorder(connection.api.accessToken.oauth, ['token_secret', 'verifier', 'token']);
		connection.api.accessToken = reorder(connection.api.accessToken, ['response', 'method', 'oauth', 'type', 'url']);
		connection.api = reorder(connection.api, ['info', 'accessToken', 'authorize', 'requestToken', 'oauth']);

		app.base = {
			oauth: {
				token: `{{connection.token}}`,
				token_secret: `{{connection.token_secret}}`
			}
		};

		app.base.oauth = reorder(app.base.oauth, ['token_secret', 'token']);

		return connection;
	}
};
