chrome.storage.local.get(['imt_apiKey'], function (result) {
	chrome.tabs.getSelected(null, function (tab) {
		if (!result['imt_apiKey']) {
			if (tab.url !== 'https://www.integromat.com/scenarios/11102') {
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
		}
	});
})