import { expandUrl } from '../../common.mjs';
import ParseError from '../../ParseError.mjs';

export default {
	parse(source, app, raw, count) {
		const webhook = {};
		webhook.label = source.label;
		webhook.type = 'web';

		// Predict webhook name
		if (app.connections.length !== 0) webhook.connection = app.name;
		webhook.api = {};
		webhook.name = count === 0 ? app.name : `${app.name}${count + 1}`;
		webhook.parameters = [];

		if (source.source === 'static-webhooks') {
			webhook.attach = {};
			webhook.detach = {};
		} else {
			webhook.attach = {
				url: expandUrl(raw.subscribe_url),
				method: 'POST'
			};
			webhook.detach = {
				url: expandUrl(raw.unsubscribe_url),
				method: 'DELETE'
			};
			app.errors.push(new ParseError(
				'webhook.dynamic',
				`The webhook ${webhook.name} is marked as dynamically registered webhook. The attach and detach RPCs should be checked.`,
				4
			));
		}
		return webhook;
	}
};
