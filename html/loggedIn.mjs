import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("currentUser").innerText = `Currently logged in as ${(await Common.getUserData(await Common.getStoredApiKey())).name}.`;
})();

document.getElementById("letsgo").addEventListener("click", redirectToZapier);

function redirectToZapier() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var tab = tabs[0];
		chrome.tabs.update(tab.id, { url: "https://zapier.com/" });
		location.replace("../index.html")
	});
}