chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.routine === 'setErrors') {
		const errorWrapper = document.getElementById('errors');
		for (const error of message.errors) {
			errorWrapper.innerHTML += `<li>
			<a class="doc" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a>
			<a class="f-right go-to-docs btn xs" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">Open in Docs</a>
			</li>`
		}
		sendResponse({ status: 0 })
	}
})