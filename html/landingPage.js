chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.success === true) {
			location.replace('../index.html')
		}
	}
);

function requestLogin() {
	chrome.runtime.sendMessage({ action: "IMT_LOGIN" }, function () { });
}

requestLogin();