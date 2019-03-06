import Common from '../bin/Common.mjs'

/**
 * FOOTER LOADER
 */
(async () => {
	document.getElementById("buttonLogout").addEventListener("click", Common.logout);
	document.getElementById("buttonChangeMode").addEventListener("click", Common.demode);
	document.getElementById("currentUser").innerText = `Logged in to Integromat as ${(await Common.getUserData(await Common.getStoredApiKey())).email}.`;
	document.getElementById("openHistory").addEventListener("click", () => {
		location.replace("./history.html");
	})
})();
