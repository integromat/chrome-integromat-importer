import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("buttonChangeMode").addEventListener("click", Common.demode);
	document.getElementById("currentUser").innerText = `Logged in to Integromat as ${(await Common.getUserData(await Common.getStoredApiKey())).email}.`;
})();

(async () => {
	const history = await Common.getHistory();
	history.sort((a, b) => { return b.datetime - a.datetime });
	history.forEach(app => {
		/**
		 * Creating cells in the root table
		 */
		let row = document.createElement('tr');

		let nameCell = document.createElement('td');
		nameCell.innerText = app.app.label
		row.appendChild(nameCell);

		let dateCell = document.createElement('td');
		dateCell.innerText = new Date(app.datetime).toLocaleDateString('cs-CZ');
		row.appendChild(dateCell);

		let actionCell = document.createElement('td');
		let importButton = document.createElement('button');

		// Bind the importApp function for each app
		importButton.innerText = "Show report"
		importButton.onclick = async function () {
			const newTab = await Common.createNewTab('html/imported.html', false);
			await Common.sendMessageToTab(newTab, { routine: 'setErrors', errors: app.errors })
			await Common.updateTab(newTab, { "active": true })
		};

		actionCell.appendChild(importButton);
		row.appendChild(actionCell);

		document.getElementById('apps').appendChild(row);
	});
})();

