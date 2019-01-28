export default {

	logout: async () => {
		await new Promise((resolve) => {
			chrome.storage.local.remove(['imt_apiKey'], function () {
				resolve();
			})
		});
		location.replace("../index.html")
	},

	getStoredApiKey: async () => {
		return await new Promise((resolve) => {
			chrome.storage.local.get(['imt_apiKey'], async function (result) {
				resolve(result.imt_apiKey)
			});
		})
	},

	setStoredApiKey: async (apiKey) => {
		return await new Promise((resolve) => {
			chrome.storage.local.set({ 'imt_apiKey': apiKey }, async function () {
				resolve();
			});
		})
	},

	getLastErrors: async () => {
		return await new Promise((resolve) => {
			chrome.storage.local.get(['lastErrors'], async function (result) {
				resolve(result.lastErrors)
			});
		})
	},

	setLastErrors: async (errors) => {
		return await new Promise((resolve) => {
			chrome.storage.local.set({ 'lastErrors': errors }, async function () {
				resolve();
			});
		})
	},

	getUserData: async (apiKey) => {
		return (await (await fetch('https://api.integromat.com/v1/whoami', {
			headers: {
				Authorization: `Token ${apiKey}`
			}
		})).json());
	},

	getCurrentTab: async () => {
		return await new Promise((resolve) => {
			chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
				resolve(tabs[0]);
			})
		});
	},

	setTabUrl: async (tabId, url) => {
		return await new Promise((resolve) => {
			chrome.tabs.update(tabId, { url: url }, async function () {
				resolve();
			})
		})
	},

	createNewTab: async (url, focus) => {
		return await new Promise((resolve) => {
			chrome.tabs.create({ url: url, active: focus }, async function (tab) {
				chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
					if (info.status === 'complete' && tabId == tab.id) {
						chrome.tabs.onUpdated.removeListener(listener)
						resolve(tab);
					}
				})
			})
		})
	},

	executeOnTab: async (tab, code) => {
		return await new Promise((resolve) => {
			chrome.tabs.executeScript(tab.id, { code: code }, async function (returned) {
				resolve(returned);
			})
		})
	},

	sendMessageToTab: async (tab, message) => {
		return await new Promise((resolve) => {
			chrome.tabs.sendMessage(tab.id, message, (response) => {
				resolve(response)
			})
		})
	},

	updateTab: async (tab, updateBundle) => {
		return await new Promise((resolve) => {
			chrome.tabs.update(tab.id, updateBundle, () => {
				resolve();
			})
		})
	}

}