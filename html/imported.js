chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.routine === 'setErrors') {
		const warningWrapper = document.getElementById('warnings');
		const errorWrapper = document.getElementById('errors');
		message.errors.sort((a, b) => { return a.severity - b.severity })

		for (const error of message.errors) {
			const kind = error.severity < 3 ? 'warning' : 'error';
			if (error.severity < 3) {
				warningWrapper.innerHTML += `<li class="${kind}">
				<a class="doc" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a>
				<a class="f-right go-to-docs btn xs" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">Open in Docs</a>
				</li>`
			} else {
				errorWrapper.innerHTML += `<li class="${kind}">
				<a class="doc" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">${error.description} - Severity: ${error.severity}</a>
				<a class="f-right go-to-docs btn xs" target="_blank" href="https://docs.integromat.com/apps/integromat-importer/errors/${error.code}">Open in Docs</a>
				</li>`
			}
		}
		sendResponse({ status: 0 })
	}
});

var input = document.getElementById("show-warnings");
input.addEventListener("click", function() {
	var wrapper = document.getElementById("warnings");
	var button = document.getElementById("show-warnings");
	if (wrapper.classList.contains("hide")) {
		wrapper.classList.add("show");
		wrapper.classList.remove("hide");
		button.innerHTML = "Hide";
	} else {
		wrapper.classList.remove("show");
		wrapper.classList.add("hide");
		button.innerHTML = "Show";
	}
});