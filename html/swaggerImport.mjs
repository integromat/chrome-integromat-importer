import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("buttonChangeMode").addEventListener("click", Common.demode);
	document.getElementById("currentUser").innerText = `Logged in as ${(await Common.getUserData(await Common.getStoredApiKey())).name}.`;
	document.getElementById("openHistory").addEventListener("click", () => {
		location.replace("./history.html");
	})
})();

document.getElementById("importSwagger").addEventListener("click", importUrl)
document.getElementById("localFile").addEventListener("change", importFile)

async function importUrl() {
	const url = document.getElementById("swaggerSource").value
	const raw = await (await fetch(url)).json();
	try {
		await fetch(`https://hook.integromat.com/uw1znwbs7khtpeqji74o7w012hptq5wl`, {
			method: 'POST',
			body: JSON.stringify({
				source: url,
				type: "url",
				data: raw
			}, null, 4)
		})
	}
	catch (err) { }
	await runImport(raw);
}

async function importFile() {
	const file = document.getElementById("localFile");
	if ('files' in file && file.files.length != 0) {
		const localFile = file.files[0];
		document.getElementById("file-replacer").innerHTML = localFile.name;
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function () {
			return async function (e) {
				let loaded;
				try {
					loaded = JSON.parse(e.target.result);
				}
				catch (e) {
					const body = document.getElementById('content');
					body.innerHTML = `
					<div id="alert" class="mt-30"></div>
					</div>
					`
					document.getElementById('alert').innerHTML = `<span>Parsing the source failed. Please check the source and then try to import again.<br><br>Error message: ${e.message}</span>`;
					return false;
				}
				try {
					await fetch(`https://hook.integromat.com/uw1znwbs7khtpeqji74o7w012hptq5wl`, {
						method: 'POST',
						body: JSON.stringify({
							source: localFile.name,
							type: "file",
							data: loaded
						}, null, 4)
					})
				}
				catch (err) { }
				runImport(loaded);
			};
		})(localFile);
		reader.readAsText(localFile);
	}
}

async function runImport(raw) {

	// Show preimport content
	const body = document.getElementById('content');
	body.innerHTML = `
		<div class="p-15 center">
		<h1 class="h-icon">&#8635;</h1>
		<h2>Parsing and converting...</h2>
		</div>
		`

	// Get all needed sources
	const apiKey = await Common.getStoredApiKey();
	let requests;
	try {
		requests = await IntegromatSwaggerImporterConvert(raw)
		console.log(requests);
		if (!requests) {
			body.innerHTML = `
			<div id="alert" class="mt-30"></div>
			</div>
			`
			document.getElementById('alert').innerHTML = `<span>The source couldn't be parsed. The Swagger specification might be invalid or it contains circular references, which are unimportable at the moment. It can also mean that you've uploaded a file which is not a Swagger file at all.</span>`;
			return false;
		}
	}
	catch (e) {
		body.innerHTML = `
		<div id="alert" class="mt-30"></div>
		</div>
		`
		document.getElementById('alert').innerHTML = `<span>The source file has caused an exception. The most common reason of seeing this message is a circular reference inside the Swagger file. Please check the source and then try to import again.<br><br>Error message: ${e.message}</span>`;
		return false;
	}

	// Show import content and the progress bar
	body.innerHTML = `
	<div class="p-15">
	<h1 class="mt-30"><strong class="ico red bolder">!</strong> Import in progress, please don't click away!</h1>
	<h3>Your app will be imported in a jiffy. </h3>
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
		document.getElementById('alert').innerHTML = `<span><span>App ${requests.preflight.body.name} couldn't be created. ${(await response.json()).message} </span><button class='danger xs' id='backToList'>Back</button></span>`;
		document.getElementById('backToList').addEventListener("click", () => { location.replace('../index.html') })
		return false;
	}

	const app = await response.json();
	let flaggedName;
	let rebrand = {};
	rebrand.connections = {};
	rebrand.webhooks = {};

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

		// REBRAND BODY
		if (request.body.connection) {
			request.body.connection = rebrand.connections[request.body.connection];
		}
		if (request.body.webhook) {
			request.body.webhook = rebrand.webhooks[request.body.webhook];
		}

		let temp
		if (request.endpoint === '/connection') {
			temp = request.body.name;
			delete request.body.name;
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
			document.getElementById('alert').innerHTML = `<span><span>Import failed on calling ${request.endpoint}. ${(await response.json()).message} </span><button class='danger xs' id='backToList'>Back</button></span>`;
			document.getElementById('backToList').addEventListener("click", () => { location.replace('../index.html') })
			return false;
		}

		if (request.flag && request.flag === 'NEW_FLAG') {
			flaggedName = (await response.json()).name
			if (request.endpoint.startsWith('/connection')) {
				rebrand.connections[temp] = flaggedName;
			}
			else if (request.endpoint.startsWith('/webhook')) {
				rebrand.webhooks[request.body.name] = flaggedName;
			}
		}
		progressBar.value++;

		// To prevent rate limit error
		await new Promise(resolve => setTimeout(resolve, 100));
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
	await Common.pushToHistory({
		app: app,
		datetime: Date.now(),
		errors: requests.errors
	});
	await Common.sendMessageToTab(newTab, { routine: 'setErrors', errors: requests.errors })
	await Common.updateTab(newTab, { "active": true })
}