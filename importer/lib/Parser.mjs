import kebabCase from './updash/kebabCase';

import { getColorCode, getRandomInt } from './common';
import ParseError from './ParseError.mjs';

import BasicAuth from './subparsers/connections/BasicAuth';
import ApiKeyQS from './subparsers/connections/ApiKeyQS';
import ApiKeyHeaders from './subparsers/connections/ApiKeyHeaders';
import OAuth1 from './subparsers/connections/OAuth1';
import OAuth2 from './subparsers/connections/OAuth2';
import OAuth2REF from './subparsers/connections/OAuth2REF';

import Action from './subparsers/modules/Action';
import Search from './subparsers/modules/Search';
import RPC from './subparsers/modules/RPC';
import Trigger from './subparsers/modules/Trigger';
import InstantTrigger from './subparsers/modules/InstantTrigger';
import Webhook from './subparsers/modules/Webhook';

class Parser {

	static parseApp(raw) {
		console.log('Parsing source JSON');
		const app = {};
		app.countries = [];
		app.private = true;
		app.language = 'en';
		app.theme = getColorCode(getRandomInt(128, 255), getRandomInt(128, 255), getRandomInt(128, 255));
		app.label = raw.title;
		app.name = raw.slug || kebabCase(raw.title);
		app.errors = [];
		/**
		 * PARSE MODULES
		 */
		app.base = {};
		app.connections = [];
		app.rpcs = [];
		app.webhooks = [];
		app.modules = [];

		if (raw.js !== null) {
			app.errors.push(new ParseError(
				'app.usingCustomJs',
				'The app is using custom scripting. Sadly, this is unimportable feature and the code has to be imported manually.',
				6
			));
		}

		console.debug('Parsing connection');

		if (raw.test_trigger === null) {
			app.errors.push(new ParseError(
				'connection.noInfo',
				'Connection test was not found. That means there\'s no way how to validate the connection. Info request should be added.',
				3
			));
		}

		switch (raw.auth_type) {

			// No Auth
			case 0:
				console.debug('App has no connection specified.');
				break;

			// Basic Auth
			case 1:
				console.debug('Recognized "Basic Auth" connection type.');
				app.connections.push(BasicAuth.parse(raw, app));
				break;

			// API key in QueryString
			case 2:
				console.debug('Recognized "API key in QueryString" connection type.');
				app.connections.push(ApiKeyQS.parse(raw, app));
				break;

			// API key in headers
			case 3:
				console.debug('Recognized "API key in headers" connection type.');
				app.connections.push(ApiKeyHeaders.parse(raw, app));
				break;

			// OAuth 1
			case 4:
				console.debug('Recognized "OAuth1" connection type.');
				app.connections.push(OAuth1.parse(raw, app));
				break;

			// OAuth 2 without refresh token
			case 5:
				console.debug('Recognized "OAuth2 without refresh token" connection type.');
				app.connections.push(OAuth2.parse(raw, app));
				break;

			// OAuth 2 with refresh token
			case 6:
				console.debug('Recognized "OAuth2 with refresh token" connection type.');
				app.connections.push(OAuth2REF.parse(raw, app));
				break;

			// Digest auth
			case 7:
				app.errors.push(new ParseError(
					'connection.digest.notSupported',
					'Digest auth connection type is supported, however it can\'t be imported directly.',
					5
				));
				break;

			// Session Auth
			case 9:
				app.errors.push(new ParseError(
					'connection.sessauth.notSupported',
					'Session auth connection type is currently not supported.',
					6
				));
				break;

			default:
				app.errors.push(new ParseError(
					'connection.unknown',
					'Unknown connection type detected.',
					6
				));
				break;

		}

		const triggers = raw.triggers.filter(trigger => {
			return trigger.hide === false;
		});
		const rpcs = raw.triggers.filter(rpc => {
			return rpc.hide === true;
		});

		let metaWebhooksCount = 0;

		console.debug(`Found ${rpcs.length} RPCs. Parsing.`);
		rpcs.forEach(source => {
			app.rpcs.push(RPC.parse(source, app, raw));
		});

		console.debug(`Found ${triggers.length} triggers. Parsing.`);
		triggers.forEach(source => {

			if (source.paging !== false) {
				app.errors.push(new ParseError(
					'trigger.paging',
					`The trigger ${source.label} is using pagination. This has to be implemented manually.`,
					4
				));
			}

			switch (source.source) {

				// Trigger
				case 'polling':
					app.modules.push(Trigger.parse(source, app));
					break;

				// Instant trigger + webhook
				case 'static-webhooks':
				case 'payload-subscriptions':
				case 'notification-subscriptions':
					const webhook = Webhook.parse(source, app, raw, metaWebhooksCount);
					metaWebhooksCount++;
					app.webhooks.push(webhook);
					app.modules.push(InstantTrigger.parse(source, webhook.name));
					break;
			}
		});

		console.debug(`Found ${raw.searches.length} searches. Parsing.`);
		raw.searches.forEach(source => {
			app.modules.push(Search.parse(source, app));
		});

		console.debug(`Found ${raw.actions.length} actions. Parsing.`);
		raw.actions.forEach(source => {
			app.modules.push(Action.parse(source, app));
		});

		return app;
	}
}

export default Parser;
