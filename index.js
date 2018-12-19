chrome.storage.local.get(['imt_apiKey'], function (result) {
	if (!result.key) {
		location.replace("./html/gettingStarted.html")
	}
})