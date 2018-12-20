export default {
	buildRequestTree(app) {
		console.log('Building requests.');
		const version = 1;
		const requests = [];
		const errors = app.errors;

		// New app
		console.debug('/app');
		requests.push({
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
		});

		// App base
		console.debug('/app/base');
		requests.push({
			endpoint: `/app/${app.name}/${version}/base`,
			method: 'PUT',
			type: 'application/json',
			body: app.base
		});

		// CONNECTIONS
		console.debug('/app/connections');
		for (const connection of app.connections) {

			// New connection
			requests.push({
				endpoint: `/app/${app.name}/connection`,
				method: 'POST',
				type: 'application/json',
				body: {
					type: connection.type,
					label: connection.label
				}
			});

			// Parameters
			requests.push({
				endpoint: `/app/${app.name}/connection/${connection.name}/parameters`,
				method: 'PUT',
				type: 'application/json',
				body: connection.parameters
			});

			// Api
			requests.push({
				endpoint: `/app/${app.name}/connection/${connection.name}/api`,
				method: 'PUT',
				type: 'application/json',
				body: connection.api
			});

			// Common
			requests.push({
				endpoint: `/app/${app.name}/connection/${connection.name}/common`,
				method: 'PUT',
				type: 'application/json',
				body: connection.common
			});

			// Scope
			requests.push({
				endpoint: `/app/${app.name}/connection/${connection.name}/scope`,
				method: 'PUT',
				type: 'application/json',
				body: connection.scope
			});

			// Scopes
			requests.push({
				endpoint: `/app/${app.name}/connection/${connection.name}/scopes`,
				method: 'PUT',
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
				endpoint: `/app/${app.name}/${version}/rpc`,
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
				endpoint: `/app/${app.name}/${version}/rpc/${rpc.name}/api`,
				method: 'PUT',
				type: 'application/json',
				body: rpc.api
			});

			// Parameters
			requests.push({
				endpoint: `/app/${app.name}/${version}/rpc/${rpc.name}/parameters`,
				method: 'PUT',
				type: 'application/json',
				body: rpc.parameters
			});

		}

		// WEBHOOKS
		console.debug('/app/webhooks');
		for (const hook of app.webhooks) {

			// New webhook
			console.log(`/app/webhooks/${hook.name}`);
			requests.push({
				endpoint: `/app/${app.name}/webhook`,
				method: 'POST',
				type: 'application/json',
				body: {
					name: hook.name,
					type: hook.type,
					label: hook.label,
					connection: hook.connection
				}
			});

			// Parameters
			requests.push({
				endpoint: `/app/${app.name}/webhook/${hook.name}/parameters`,
				method: 'PUT',
				type: 'application/json',
				body: hook.parameters
			});

			// Api
			requests.push({
				endpoint: `/app/${app.name}/webhook/${hook.name}/api`,
				method: 'PUT',
				type: 'application/json',
				body: hook.api
			});

			// Attach
			requests.push({
				endpoint: `/app/${app.name}/webhook/${hook.name}/attach`,
				method: 'PUT',
				type: 'application/json',
				body: hook.attach
			});

			// Detach
			requests.push({
				endpoint: `/app/${app.name}/webhook/${hook.name}/detach`,
				method: 'PUT',
				type: 'application/json',
				body: hook.detach
			});
		}

		// MODULES
		console.debug('/app/modules');
		for (const module of app.modules) {

			// New module
			console.debug(`/app/modules/${module.name}`);
			requests.push({
				endpoint: `/app/${app.name}/${version}/module`,
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
				endpoint: `/app/${app.name}/${version}/module/${module.name}/api`,
				method: 'PUT',
				type: 'application/json',
				body: module.api || {}
			});

			// Epoch
			if (module.type_id === 1) {
				requests.push({
					endpoint: `/app/${app.name}/${version}/module/${module.name}/epoch`,
					method: 'PUT',
					type: 'application/json',
					body: module.epoch || {}
				});
			}

			// Parameters
			requests.push({
				endpoint: `/app/${app.name}/${version}/module/${module.name}/parameters`,
				method: 'PUT',
				type: 'application/json',
				body: module.parameters || []
			});

			// Expect
			if ([4, 9].includes(module.type_id)) {
				requests.push({
					endpoint: `/app/${app.name}/${version}/module/${module.name}/expect`,
					method: 'PUT',
					type: 'application/json',
					body: module.expect || []
				});
			}

			// Interface
			requests.push({
				endpoint: `/app/${app.name}/${version}/module/${module.name}/interface`,
				method: 'PUT',
				type: 'application/json',
				body: module.interface || []
			});

			// Samples
			requests.push({
				endpoint: `/app/${app.name}/${version}/module/${module.name}/samples`,
				method: 'PUT',
				type: 'application/json',
				body: module.samples || {}
			});

			// Scope
			requests.push({
				endpoint: `/app/${app.name}/${version}/module/${module.name}/scope`,
				method: 'PUT',
				type: 'application/json',
				body: module.scope || []
			});
		}

		return {
			requests: requests,
			errors: errors
		};
	}
};
