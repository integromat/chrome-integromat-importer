import Common from '../bin/Common.mjs'

document.getElementById("getStarted").addEventListener("click", callLanding);
document.getElementById("linkToDocs").addEventListener("click", openDocs);

// Redirect current tab to API settings in Integromat and reroute
async function callLanding() {
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, 'https://www.integromat.com/user/api');
	location.replace("../index.html");
}

async function openDocs() {
	const currentTab = await Common.getCurrentTab();
	await Common.setTabUrl(currentTab.id, 'https://docs.integromat.com/apps/primary/integromat-importer');
}