document.getElementById("letsgo").addEventListener("click", redirectToZapier);
document.getElementById("logout").addEventListener("click", logOut);

chrome.storage.local.get(['imt_apiKey'], async function (result) {
	getUserData(result['imt_apiKey']);
});

async function getUserData(apiKey) {
	const account = await (await fetch('https://api.integromat.com/v1/whoami', {
		headers: {
			Authorization: `Token ${apiKey}`
		}
	})).json();
	document.getElementById('welcome').innerText = `Welcome ${account.name}!`
}

function redirectToZapier() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var tab = tabs[0];
		chrome.tabs.update(tab.id, { url: "https://zapier.com/" });
	});
}

function logOut() {
	chrome.storage.local.remove(['imt_apiKey'], function () {
		location.replace("../index.html")
	});
}