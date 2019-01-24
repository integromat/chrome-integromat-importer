export default {
	buildRequestTree(app) {
		const version = 1;
		const requests = [];
		const errors = app.errors;

		// New app
		console.debug('/app');
		const preflight = {
			endpoint: '/app',
			method: 'POST',
			type: 'application/json',
			body: {
				name: app.name,
				version: version,
				label: app.label,
				theme: app.theme,
				language: 'en',
				private: true,
				countries: []
			}
		};

		// App base
		console.debug('/app/base');
		requests.push({
			endpoint: `/${version}/base`,
			method: 'PUT',
			type: 'application/jsonc',
			body: app.base
		});

		// CONNECTIONS
		console.debug('/app/connections');
		for (const connection of app.connections) {

			// New connection
			requests.push({
				endpoint: `/connection`,
				method: 'POST',
				flag: 'NEW_FLAG',
				type: 'application/json',
				body: {
					type: connection.type,
					label: connection.label
				}
			});

			// Parameters
			requests.push({
				endpoint: `/connection/___FLAG_NAME___/parameters`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/jsonc',
				body: connection.parameters
			});

			// Api
			requests.push({
				endpoint: `/connection/___FLAG_NAME___/api`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/jsonc',
				body: connection.api
			});

			// Common
			requests.push({
				endpoint: `/connection/___FLAG_NAME___/common`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/json',
				body: connection.common
			});

			// Scope
			requests.push({
				endpoint: `/connection/___FLAG_NAME___/scope`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/json',
				body: connection.scope
			});

			// Scopes
			requests.push({
				endpoint: `/connection/___FLAG_NAME___/scopes`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/json',
				body: connection.scopes
			});
		}

		// RPCs
		console.debug('/app/rpcs');
		for (const rpc of app.rpcs) {

			// New RPC
			console.debug(`/app/rpcs/${rpc.name}`);
			requests.push({
				endpoint: `/${version}/rpc`,
				method: 'POST',
				type: 'application/json',
				body: {
					name: rpc.name,
					label: rpc.label,
					connection: rpc.connection
				}
			});

			// Api
			requests.push({
				endpoint: `/${version}/rpc/${rpc.name}/api`,
				method: 'PUT',
				type: 'application/jsonc',
				body: rpc.api
			});

			// Parameters
			requests.push({
				endpoint: `/${version}/rpc/${rpc.name}/parameters`,
				method: 'PUT',
				type: 'application/jsonc',
				body: rpc.parameters
			});

		}

		// WEBHOOKS
		console.debug('/app/webhooks');
		for (const hook of app.webhooks) {

			// New webhook
			requests.push({
				endpoint: `/webhook`,
				method: 'POST',
				type: 'application/json',
				flag: 'NEW_FLAG',
				body: {
					name: hook.name,
					type: hook.type,
					label: hook.label,
					connection: hook.connection
				}
			});

			// Parameters
			requests.push({
				endpoint: `/webhook/___FLAG_NAME___/parameters`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/jsonc',
				body: hook.parameters
			});

			// Api
			requests.push({
				endpoint: `/webhook/___FLAG_NAME___/api`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/jsonc',
				body: hook.api
			});

			// Attach
			requests.push({
				endpoint: `/webhook/___FLAG_NAME___/attach`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/jsonc',
				body: hook.attach
			});

			// Detach
			requests.push({
				endpoint: `/webhook/___FLAG_NAME___/detach`,
				method: 'PUT',
				flag: 'FLAG',
				type: 'application/jsonc',
				body: hook.detach
			});
		}

		// MODULES
		console.debug('/app/modules');
		for (const module of app.modules) {

			// New module
			console.debug(`/app/modules/${module.name}`);
			requests.push({
				endpoint: `/${version}/module`,
				method: 'POST',
				type: 'application/json',
				body: {
					name: module.name,
					type_id: module.type_id,
					label: module.label,
					description: module.description,
					connection: module.connection,
					webhook: module.webhook
				}
			});

			// Api
			requests.push({
				endpoint: `/${version}/module/${module.name}/api`,
				method: 'PUT',
				type: 'application/jsonc',
				body: module.api || {}
			});

			// Epoch
			if (module.type_id === 1) {
				requests.push({
					endpoint: `/${version}/module/${module.name}/epoch`,
					method: 'PUT',
					type: 'application/jsonc',
					body: module.epoch || {}
				});
			}

			// Parameters
			requests.push({
				endpoint: `/${version}/module/${module.name}/parameters`,
				method: 'PUT',
				type: 'application/jsonc',
				body: module.parameters || []
			});

			// Expect
			if ([4, 9].includes(module.type_id)) {
				requests.push({
					endpoint: `/${version}/module/${module.name}/expect`,
					method: 'PUT',
					type: 'application/jsonc',
					body: module.expect || []
				});
			}

			// Interface
			requests.push({
				endpoint: `/${version}/module/${module.name}/interface`,
				method: 'PUT',
				type: 'application/jsonc',
				body: module.interface || []
			});

			// Samples
			requests.push({
				endpoint: `/${version}/module/${module.name}/samples`,
				method: 'PUT',
				type: 'application/json',
				body: module.samples || {}
			});

			// Scope
			requests.push({
				endpoint: `/${version}/module/${module.name}/scope`,
				method: 'PUT',
				type: 'application/json',
				body: module.scope || []
			});
		}

		return {
			preflight: preflight,
			requests: requests,
			errors: errors
		};
	}
};
