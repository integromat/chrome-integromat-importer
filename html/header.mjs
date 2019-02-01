import Common from '../bin/Common.mjs'

document.getElementById("howToLink").addEventListener("click", openHelp);

// Redirect current tab to API settings in Integromat and reroute
async function openHelp() {
	await Common.createNewTab('https://docs.integromat.com/apps/primary/integromat-importer', true);
}