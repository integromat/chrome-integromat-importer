import { expandUrl } from '../../common.mjs';
import ParseFunctions from '../ParseFunctions.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(raw, app) {
		app.errors.push(new ParseError(
			'connection.oauth1.register',
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
		].concat(ParseFunctions.parseParameters(raw.auth_fields.filter(field => {
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
			'connection.oauth1.scopeNames',
			'Human readable scope names should be provided.',
			1
		));

		if (raw.oauth_data && raw.oauth_data.access_token_placement !== 'header') {
			app.errors.push(new ParseError(
				'connection.oauth1.tokenNotInHeaders',
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
		}

		app.base = {
			oauth: {
				token: `{{connection.token}}`,
				token_secret: `{{connection.token_secret}}`
			}
		};

		return connection;
	}
};
