chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.routine === 'setErrors') {
		const errorWrapper = document.getElementById('errors');
		message.errors.sort((a, b) => { return a.severity - b.severity })
		for (const error of message.errors) {
			const kind = error.severity < 3 ? 'warning' : 'error';
			errorWrapper.innerHTML += `<li class="${kind}">
			<a class="doc" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a>
			<a class="f-right go-to-docs btn xs" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">Open in Docs</a>
			</li>`
		}
		sendResponse({ status: 0 })
	}
})