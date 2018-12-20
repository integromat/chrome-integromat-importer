document.getElementById("getStarted").addEventListener("click", callLanding);

function callLanding() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var tab = tabs[0];
		chrome.tabs.update(tab.id, { url: "https://www.integromat.com/scenarios/11102" });
		location.replace('../index.html')
	});
}