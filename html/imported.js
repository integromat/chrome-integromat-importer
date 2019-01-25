chrome.runtime.onMessage.addListener((message) => {
	if (message.routine === 'setErrors') {
		const errorWrapper = document.getElementById('errors');
		for (const error of message.errors) {
			errorWrapper.innerHTML += `<a class="doc" target="_blank" href="https://docs.integromat.com/apps/primary/zapier-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a><br>`
		}
	}
})