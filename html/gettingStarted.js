document.getElementById("getStarted").addEventListener("click", callLanding);

function callLanding() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var tab = tabs[0];
		chrome.tabs.update(tab.id, { url: "https://www.integromat.com/user#tab:api" });
		location.replace('../index.html')
	});
}