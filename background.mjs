const HOST_ZAPIER = {
	conditions: [
		new chrome.declarativeContent.PageStateMatcher({
			pageUrl: { urlMatches: 'zapier.com' },
		})
	],
	actions: [
		new chrome.declarativeContent.ShowPageAction()
	]
}

const HOST_INTEGROMAT = {
	conditions: [
		new chrome.declarativeContent.PageStateMatcher({
			pageUrl: { urlMatches: 'integromat.com' },
		})
	],
	actions: [
		new chrome.declarativeContent.ShowPageAction()
	]
}

chrome.runtime.onInstalled.addListener(function () {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
		chrome.declarativeContent.onPageChanged.addRules([
			HOST_ZAPIER,
			HOST_INTEGROMAT
		]);
	});
});