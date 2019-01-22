// If user's on login page, request redirect back
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete') {
		if (tab.url.match('integromat.com/.*/login')) {
			chrome.runtime.sendMessage({ redirect: "login" }, function (response) { });
		}
	}
});