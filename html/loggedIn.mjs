import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("currentUser").innerText = `Logged in as ${(await Common.getUserData(await Common.getStoredApiKey())).name}.`;
})();
/**
 * PAGE FUNCTIONS
 */
document.getElementById("letsgo").addEventListener("click", redirect);

// Set mode and reroute
async function redirect() {
	const select = document.getElementById("modeselect")
	await Common.setMode(select.value)
	location.replace("../index.html")
}