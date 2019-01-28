chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.routine === 'setErrors') {
		const errorWrapper = document.getElementById('errors');
		for (const error of message.errors) {
			errorWrapper.innerHTML += `<div>
			<a class="doc" target="_blank" href="https://docs.integromat.com/apps/primary/zapier-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a>
			<a target="_blank" href="https://docs.integromat.com/apps/primary/zapier-importer/errors/${error.code}">Open in Docs</a>
			</div>`
		}
		sendResponse({ status: 0 })
	}
})