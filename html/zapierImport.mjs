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
		<h1>Preparing to import</h1>
		`

	// Get all needed sources
	const apiKey = await Common.getStoredApiKey();
	const source = await (await fetch(`https://zapier.com/api/developer/v1/apps/${id}`)).json();
	const requests = Importer.parseSource(source);

	// Show import content and the progress bar
	body.innerHTML = `
	<h1>Importing! Don't close</h1>
	<progress id='progress' max="${requests.requests.length}" value="0"></progress>
	`
	const progressBar = document.getElementById('progress');

	/**
	 * Send all generated requests in sequence to Integromat
	 * Needs to be done in series (in for cycle) as the order matters
	 */
	for (const request of requests.requests) {

		// Fire the request and catch the response
		const response = await fetch(`https://api.integromat.com/v1${request.endpoint}`, {
			method: request.method,
			headers: {
				'Content-Type': request.type,
				'Authorization': `Token ${apiKey}`
			},
			body: JSON.stringify(request.body)
		})

		// Stop sending when last request failed
		if (!response.ok) {
			alert(`Import failed on calling ${request.endpoint}.`);
			return false;
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
	<h1>DONE!</h1>
	${JSON.stringify(requests.errors)}
	`
}