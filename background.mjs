async function login() {
	/* const token = await (await fetch('https://www.integromat.com/api/user/api/token', {
						method: 'POST',
						body: {
							scope: [
								"apps:read",
								"apps:write"
							]
						}
					})).text();
					alert(token); */
	chrome.storage.local.set({ 'imt_apiKey': '1d6878ad-3a22-4b5d-bec4-7a4c258d3241' }, function () { });
	chrome.runtime.sendMessage({
		success: true
	});
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete') {
		if (tab.url === 'https://www.integromat.com/scenarios/11102') {
			chrome.storage.local.get(['imt_apiKey'], async function (result) {
				if (!result['imt_apiKey']) {
					await login();
				}
			});
		}
	}
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	if (request.action === "IMT_LOGIN") {
		await login();
	}
});