chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// Only works on popup?
		// if(request.type === 'popup-modal'){
		// 	window.chrome.tabs.executeScript({
		// 		code: `showModal("${request.tag}");`
		// 	});
		// 	return;
		// }

		if (!request.listNodes)
			return;

		window.chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			request.listNodes.forEach((tagNode) => window.chrome.tabs.executeScript({
				code: (request.highlightOn ? `highlightConcept(document.body, "${tagNode.tag}", "${tagNode.color || ''}")` : `unhighlightConcept(document.body)`)
				})
			)
		});	// tabs.query

		// response n/a for display? callback. (See also runtime.lastError.)
		sendResponse({highlightOn: request.highlightOn});
	});

chrome.contextMenus.create({
	id: "OPEN_FORM",
  title: "Add/edit tag: %s",
  contexts:["selection"]
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
	// // See browser dev tools: extension background page!
	// console.log(info); console.log(tab);

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {
			type: "popup-modal",
			tag: info.selectionText
		});
	});

});