import Common from '../bin/Common.mjs'

(async () => {
	await route();
})();

/**
 * Route function
 * Decides which page to show based on current conditions
 */
async function route() {

	// Get apiKey and currentTab
	const apiKey = await Common.getStoredApiKey();
	const currentTab = await Common.getCurrentTab();

	// If there's no apiKey...
	if (!apiKey) {
		// ... Is user not on API settings ... ?
		if (currentTab.url !== 'https://www.integromat.com/user#tab:api' && currentTab.url !== 'https://www.integromat.com/user/api') {
			// ... If is not logged in but on login page
			if (currentTab.url.match('integromat.com/.*/login')) {
				location.replace("./html/integromatLogin.html")
			}
			// ... Not logged in and somewhere else
			else {
				location.replace("./html/gettingStarted.html")
			}
		}
		// ... show 'Landing Page' page, if user's already on API settings
		else {
			location.replace("./html/landingPage.html")
		}
	}
	// If apiKey is set...
	else {
		const mode = await Common.getMode();
		if (mode === 'zapier') {
			// ... if mode is Zapier and user is not on Zapier
			if (!currentTab.url.match('zapier.com')) {
				location.replace("./html/zapierNotOn.html")
			}
			// ... and user's on Zapier site ...
			else {
				// ... check if the 'apps' endpoint is reachable ...
				const status = (await fetch('https://zapier.com/api/developer/v1/apps')).status;
				// ... if so, everything is ready for import.
				if (status === 200) {
					location.replace("./html/zapierImport.html")
				}
				// ... if not, user's probably not logged in.
				else {
					location.replace("./html/zapierLogin.html")
				}
			}
		}
		else {
			// ... keep showing 'Logged In' when no mode is set
			location.replace("./html/loggedIn.html")
		}
	}
}