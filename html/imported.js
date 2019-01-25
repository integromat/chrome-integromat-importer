chrome.runtime.onMessage.addListener((message) => {
	if (message.routine === 'setContent') {
		const content = document.getElementById('content');
		content.innerHTML = message.content;
	}
})