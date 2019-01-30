import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("buttonChangeMode").addEventListener("click", Common.demode);
	document.getElementById("currentUser").innerText = `Logged in as ${(await Common.getUserData(await Common.getStoredApiKey())).name}.`;
})();

document.getElementById("importSwagger").addEventListener("click", runImport)

async function runImport() {

	// Show preimport content
	const body = document.getElementById('content');
	body.innerHTML = `
		<div class="p-15 center">
		<h1 class="h-icon">&#8635;</h1>
		</div>
		`

	const url = document.getElementById("swaggerSource").value
	const raw = await (await fetch(url)).json();

	// Get all needed sources
	const apiKey = await Common.getStoredApiKey();
	const requests = IntegromatSwaggerImporterConvert(raw)

	console.log(requests);

	// Show import content and the progress bar
	body.innerHTML = `
	<div class="p-15">
	<h1>Importing! Don't close this pop-up!</h1>
	<h3>Just wait. Clicking to something else will result in breaking up the import.</h3>
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
		document.getElementById('alert').innerHTML = `<span><span>App ${requests.preflight.body.name} couldn't be created. ${(await response.json()).message} </span><button class='danger xs' id='backToList'>Back to the list</button></span>`;
		document.getElementById('backToList').addEventListener("click", () => { location.replace('../index.html') })
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
			document.getElementById('alert').innerHTML = `<span><span>Import failed on calling ${request.endpoint}. ${(await response.json()).message} </span><button class='danger xs' id='backToList'>Back to the list</button></span>`;
			document.getElementById('backToList').addEventListener("click", () => { location.replace('../index.html') })
			return false;
		}

		if (request.flag && request.flag === 'NEW_FLAG') {
			flaggedName = (await response.json()).name
		}

		console.log(`Firing: ${request.endpoint}`)
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
	<ol id="errors" class="errors"></ol>
	`
	const errorWrapper = document.getElementById('errors');
	for (const error of requests.errors) {
		errorWrapper.innerHTML += `<li>
			<a class="doc" target="_blank" href="https://docs.integromat.com/apps/primary/integromat-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a>
			<a target="_blank" href="https://docs.integromat.com/apps/primary/integromat-importer/errors/${error.code}">Open in Docs</a>
		</li>`
	}
	const newTab = await Common.createNewTab('html/imported.html', false);
	await Common.sendMessageToTab(newTab, { routine: 'setErrors', errors: requests.errors })
	await Common.updateTab(newTab, { "active": true })
}