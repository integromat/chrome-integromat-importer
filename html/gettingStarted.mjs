import Common from '../bin/Common.mjs'

document.getElementById("getStarted").addEventListener("click", callLanding);

// Redirect current tab to API settings in Integromat and reroute
async function callLanding() {
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, 'https://www.integromat.com/user/api');
	location.replace("../index.html");
}