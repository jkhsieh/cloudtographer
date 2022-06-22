
// un/highlight...

let findConcept = (long, short) => {
	// TODO: eventually variations of "short" should be considered matches
	let pos = long.toLowerCase().indexOf(short.toLowerCase()),
		pos2 = (pos === -1 ? 0 : short.length);
	return [pos, pos2];
}

let highlightConcept = (node, text, color) => {

	if (node.nodeType === Node.TEXT_NODE) {
		let tmp = findConcept(node.textContent, text);
		if (tmp[0] === -1)
			return;
		console.log('highlight ' + (node.tagName ? node.tagName + ': ' : '') + node.textContent.substr(0, 25));

		let prev = document.createTextNode(node.textContent.substr(0, tmp[0])),
			span = document.createElement('span'),
			next = document.createTextNode(node.textContent.substr(tmp[0] + tmp[1]));
		span.textContent = node.textContent.substr(tmp[0], tmp[1]);
		span.className = 'hl';
		span.style = "background-color:" + (color || "#ff0");

		node.parentNode.insertBefore(prev, node);
		node.parentNode.insertBefore(span, node);
		node.parentNode.insertBefore(next, node);
		node.parentNode.removeChild(node);
	}
	else if (node.className === 'hl' || node.tagName === 'SCRIPT') {
	}
	else {
		// recurse over static []; .childNodes mutates!
		[].slice.call(node.childNodes).forEach(function(ch){
			highlightConcept(ch, text, color);
		});
	}
}

let unhighlightConcept = (node) => {

	if (node.className === 'hl') {
		console.log('unhighlight ' + (node.tagName ? node.tagName + ': ' : '') + node.textContent.substr(0, 25));

		let node1 = document.createTextNode(node.textContent);
		node.parentNode.insertBefore(node1, node);
		node.parentNode.removeChild(node);
	}
	else if (node.tagName === 'SCRIPT') {
	}
	else {
		// recurse over static []; .childNodes mutates!
		[].slice.call(node.childNodes).forEach(function(ch){
			unhighlightConcept(ch);
		});
	}
}

// page modal for add / edit tag

chrome.runtime.onMessage.addListener((request) => {
	if (request.listNodes) {
		request.listNodes.forEach((tagNode) => (request.highlightOn ?
			highlightConcept(document.body, tagNode.tag, tagNode.color || '') :
			unhighlightConcept(document.body) ));
	}
	else if (request.type === 'popup-modal'){
		showModal(request.tag);
	}
});

let showModal = (tag) => {
	const modal = document.createElement("dialog");
	modal.setAttribute(
		"style",`
position: fixed;
box-sizing: border-box;
width: 50%; height: 50%;
border: none;
border-radius: 10px;
background-color: rgba(255,255,255, 0.75);
box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);`
	);
	modal.innerHTML = `<iframe id="popup-content"; style="width:100%; height:96%;"></iframe>
<div style="position:absolute; top:0; right:5px;">
<button style="padding: 8px 12px; font-size: 16px; border: none; border-radius: 20px;">x</button>
</div>`;
	document.body.appendChild(modal);

	const dialog = document.querySelector("dialog");
	dialog.showModal();
	const iframe = document.getElementById("popup-content");
	iframe.src = chrome.extension.getURL("index.html") + '?tag=' + tag;
	iframe.frameBorder = 0;
	dialog.querySelector("button").addEventListener("click", () => {
		dialog.parentNode.removeChild(dialog);
	});
}
