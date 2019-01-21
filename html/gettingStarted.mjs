import Common from '../bin/Common.mjs'

document.getElementById("getStarted").addEventListener("click", callLanding);

async function callLanding() {
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, 'https://www.integromat.com/user#tab:api');
	location.replace("../index.html");
}