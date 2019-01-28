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
document.getElementById("letsgo").addEventListener("click", redirect);

// Redirect current tab to Zapier and reroute
async function redirect() {
	const select = document.getElementById("modeselect")
	let url
	switch (select.value) {
		case 'zapier':
			url = 'https://zapier.com'
			break;
	}
	await Common.setMode(select.value)
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, url);
	location.replace("../index.html")
}