import Importer from '../bin/Importer.mjs'
import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("currentUser").innerText = `Currently logged in as ${(await Common.getUserData(await Common.getStoredApiKey())).name}.`;
})();

/**
 * PAGE FUNCTIONS
 */
(async () => {
	await listApps();
})();

/**
 * listApps
 * Retrieves a list of available apps
 */
async function listApps() {
	// Get a Zapiers' JSON containing apps info
	const apps = await (await fetch('https://zapier.com/api/developer/v1/apps')).json();

	// And show the list of apps
	apps.objects.forEach(app => {
		/**
		 * Creating cells in the root table
		 */
		let row = document.createElement('tr');

		let nameCell = document.createElement('td');
		nameCell.innerText = app.title
		row.appendChild(nameCell);

		let actionCell = document.createElement('td');
		let importButton = document.createElement('button');

		// Bind the importApp function for each app
		importButton.innerText = "Import"
		importButton.onclick = async function () { importApp(app.id) };

		actionCell.appendChild(importButton);
		row.appendChild(actionCell);

		document.getElementById('apps').appendChild(row);
	});
}



async function importApp(id) {
	// Show preimport content
	const body = document.getElementById('content');
	body.innerHTML = `
		<div class="p-15 center">
		<h1 class="h-icon">&#8635;</h1>
		</div>
		`

	// Get all needed sources
	const apiKey = await Common.getStoredApiKey();
	const source = await (await fetch(`https://zapier.com/api/developer/v1/apps/${id}`)).json();
	const requests = Importer.parseSource(source);

	// Show import content and the progress bar
	body.innerHTML = `
	<div class="p-15">
	<h1>Importing! Don't close close this popup</h1>
	<h3>Don't click away as it will result breaking the import!</h3>
	<progress id='progress' max="${requests.requests.length + 1}" value="0"></progress>
	<div id="alert"></div>
	</div>
	`
	const progressBar = document.getElementById('progress');

	/**
	 * Create the app from preflight request
	 * Set the app name for all upcoming requests
	 */
	const response = await fetch(`https://api.integromat.com/v1${requests.preflight.endpoint}`, {
		method: requests.preflight.method,
		headers: {
			'Content-Type': requests.preflight.type,
			'Authorization': `Token ${apiKey}`
		},
		body: JSON.stringify(requests.preflight.body, null, 4)
	});

	// If app creation failed
	if (!response.ok) {
		document.getElementById('alert').innerHTML = `<span>App ${requests.preflight.body.name} couldn't be created. ${(await response.json()).message}</span>`;
		return false;
	}

	const app = await response.json();
	let flaggedName;

	/**
	 * Send all generated requests in sequence to Integromat
	 * Needs to be done in series (in for cycle) as the order matters
	 */
	for (const request of requests.requests) {

		// Fire the request and catch the response
		let uri = `https://api.integromat.com/v1/app/${app.name}${request.endpoint}`;

		if (request.flag && request.flag === 'FLAG') {
			uri = uri.replace('___FLAG_NAME___', flaggedName);
		}

		const response = await fetch(uri, {
			method: request.method,
			headers: {
				'Content-Type': request.type,
				'Authorization': `Token ${apiKey}`
			},
			body: JSON.stringify(request.body, null, 4)
		})

		// Stop sending when last request failed
		if (!response.ok) {
			document.getElementById('alert').innerHTML = `<span>Import failed on calling ${request.endpoint}. ${(await response.json()).message}</span>`;
			return false;
		}

		if (request.flag && request.flag === 'NEW_FLAG') {
			flaggedName = (await response.json()).name
		}

		progressBar.value++;

		// To prevent rate limit error
		await new Promise(resolve => setTimeout(resolve, 600));
	}

	/**
	 * After everything is imported correctly, show postimport content
	 * requests.errors JSON contains a list of warnings/errors during the import
	 * The error codes will be used for documentation links
	 */
	body.innerHTML = `
	<h1 class="p-15">DONE!</h1>
	<div class="errors">
	`
	requests.errors.forEach(error => {
		body.innerHTML += `<a class="doc" target="_blank" href='https://docs.integromat.com/apps/primary/zapier-importer/errors/${error.code}'>${error.description} - Severity: ${error.severity}</a>`
	})
	body.innerHTML += "</div>"
	await Common.setLastErrors(requests.errors)
}