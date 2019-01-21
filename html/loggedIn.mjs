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
document.getElementById("letsgo").addEventListener("click", redirectToZapier);

// Redirect current tab to Zapier and reroute
async function redirectToZapier() {
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, 'https://zapier.com');
	location.replace("../index.html")
}