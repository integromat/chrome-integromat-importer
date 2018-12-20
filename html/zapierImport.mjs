import Importer from '../bin/Importer.mjs'

(async () => {
	await listApps();
})();

async function listApps() {
	const apps = await (await fetch('https://zapier.com/api/developer/v1/apps')).json();
	apps.objects.forEach(app => {
		let row = document.createElement('tr');

		let nameCell = document.createElement('td');
		nameCell.innerText = app.title
		row.appendChild(nameCell);

		let actionCell = document.createElement('td');
		let importButton = document.createElement('button');
		importButton.innerText = "Import"
		importButton.onclick = async function () { importApp(app.id) };

		actionCell.appendChild(importButton);
		row.appendChild(actionCell);

		document.getElementById('apps').appendChild(row);
	});
}



async function importApp(id) {
	chrome.storage.local.get(['imt_apiKey'], async function (result) {

		const body = document.getElementById('content');
		body.innerHTML = `
		<h1>Preparing to import</h1>
		`
		const source = await (await fetch(`https://zapier.com/api/developer/v1/apps/${id}`)).json();
		const requests = Importer.parseSource(source);
		body.innerHTML = `
		<h1>Importing! Don't close</h1>
		<progress id='progress' max="${requests.requests.length}" value="0"></progress>
		`

		const progressBar = document.getElementById('progress');

		for (const request of requests.requests) {
			console.log(request.endpoint)

			// FIRE REQUESTS HERE
			console.log(request)
			const response = await fetch(`https://api.integromat.com/v1${request.endpoint}`, {
				method: request.method,
				headers: {
					'Content-Type': request.type,
					'Authorization': `Token ${result['imt_apiKey']}`
				},
				body: JSON.stringify(request.body)
			})

			progressBar.value++;

			// To prevent rate limit error
			await new Promise(resolve => setTimeout(resolve, 600));
		}
		body.innerHTML = `
		<h1>DONE!</h1>
		${JSON.stringify(requests.errors)}
		`

	});
}