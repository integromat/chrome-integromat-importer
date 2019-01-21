import Common from '../bin/Common.mjs'

(async () => {
	await route();
})();

async function route() {
	const apiKey = await Common.getStoredApiKey();
	const currentTab = await Common.getCurrentTab();
	if (!apiKey) {
		if (currentTab.url !== 'https://www.integromat.com/user#tab:api') {
			location.replace("./html/gettingStarted.html")
		}
		else {
			location.replace("./html/landingPage.html")
		}
	}
	else {
		if (!currentTab.url.match('zapier.com')) {
			location.replace("./html/loggedIn.html")
		}
		else {
			const status = (await fetch('https://zapier.com/api/developer/v1/apps')).status;
			if (status === 200) {
				location.replace("./html/zapierImport.html")
			}
			else {
				location.replace("./html/zapierLogin.html")
			}
		}
	}
}