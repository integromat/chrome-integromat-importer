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
			location.replace("./html/zapierNotOn.html")
		}
		else if (mode === 'swagger') {
			location.replace("./html/swaggerImport.html")
		}
		else {
			// ... keep showing 'Logged In' when no mode is set
			location.replace("./html/loggedIn.html")
		}
	}
}