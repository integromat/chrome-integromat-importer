import Importer from './bin/Importer.mjs'

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
	const source = await (await fetch(`https://zapier.com/api/developer/v1/apps/${id}`)).json();
	const requests = Importer.parseSource(source);

	console.log(requests);
}