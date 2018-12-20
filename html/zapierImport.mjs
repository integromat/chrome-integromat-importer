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
		<h1>Importing!</h1>
		<progress id='progress' max="${requests.requests.length}" value="0"></progress>
		`

		const progressBar = document.getElementById('progress');

		for (const request of requests.requests) {
			console.log(request.endpoint)

			// FIRE REQUESTS HERE

			progressBar.value++;

			// To prevent rate limit error
			await new Promise(resolve => setTimeout(resolve, 600));
		}

	});
}