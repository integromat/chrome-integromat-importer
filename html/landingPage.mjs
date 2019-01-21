import Common from '../bin/Common.mjs'

document.getElementById('login').addEventListener("click", addKey);

async function testKey(apiKey) {
	try {
		const account = await Common.getUserData(apiKey);
		return account.name
	}
	catch (err) {
		return false;
	}
}

async function addKey() {
	let apiKey = document.getElementById('apikey').value;
	if (!(await testKey(apiKey))) {
		alert('Invalid apikey!');
		return false;
	}
	await Common.setStoredApiKey(apiKey);
	location.replace("../index.html");
}