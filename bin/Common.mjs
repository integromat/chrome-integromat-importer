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

	getUserData: async (apiKey) => {
		return (await (await fetch('https://api.integromat.com/v1/whoami', {
			headers: {
				Authorization: `Token ${apiKey}`
			}
		})).json());
	}

}