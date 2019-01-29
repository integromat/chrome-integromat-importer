import Common from '../bin/Common.mjs'

document.getElementById('login').addEventListener("click", addKey);
document.getElementById("linkToDocs").addEventListener("click", openDocs);


async function openDocs() {
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, 'https://docs.integromat.com/apps/primary/integromat-importer#2-set-the-api-key');
}

/**
 * Redirect listener
 * If background script requests a login-page redirect
 * This listener handles that
 */
chrome.runtime.onMessage.addListener((message) => {
	if (message.redirect === 'login') {
		location.replace("../index.html");
	}
});

/**
 * testKey
 * This function tests the apiKey using getUserData from common functions
 * Returns false/undefined when there's a problem
 * Returns a name of the account when the key is correct
 */
async function testKey(apiKey) {
	try {
		const account = await Common.getUserData(apiKey);
		return account.name
	}
	catch (err) {
		return false;
	}
}

/**
 * addKey
 * This function adds the apiKey to local storage,
 * but only when the apiKey is valid
 */
async function addKey() {
	let apiKey = document.getElementById('apikey').value;
	if (!(await testKey(apiKey))) {
		alert('Invalid apikey!');
		return false;
	}
	await Common.setStoredApiKey(apiKey);
	location.replace("../index.html");
}