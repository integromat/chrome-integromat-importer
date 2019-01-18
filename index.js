chrome.storage.local.get(['imt_apiKey'], async function (result) {
	chrome.tabs.getSelected(null, async function (tab) {
		if (!result['imt_apiKey']) {
			if (tab.url !== 'https://www.integromat.com/user#tab:api') {
				location.replace("./html/gettingStarted.html")
			}
			else {
				location.replace("./html/landingPage.html")
			}
		}
		else {
			if (!tab.url.match('zapier.com')) {
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
	});
})