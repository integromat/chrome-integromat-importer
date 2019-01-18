document.getElementById('login').addEventListener("click", addKey);

async function testKey(apiKey) {
	try {
		const account = await (await fetch('https://api.integromat.com/v1/whoami', {
			headers: {
				Authorization: `Token ${apiKey}`
			}
		})).json();
		if (account.name) {
			return 1;
		}
		return 0;
	}
	catch (err) {
		return 0;
	}
}

async function addKey() {
	let apikey = document.getElementById('apikey');
	if (!(await testKey(apikey.value))) {
		alert('Invalid apikey!');
	}
	else {
		chrome.storage.local.set({ 'imt_apiKey': apikey.value }, function () { });
		location.replace("../index.html")
	}
}