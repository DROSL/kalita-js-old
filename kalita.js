const player = document.getElementById("kalita-player");
if (!player) {
	console.error('Kalita: Failed to locate "kalita-player" element in document.');
}

player.innerHTML = `
	<div class="progress">
		<div class="progressbar">
			<div></div>
		</div>
	</div>
	<div class="controls">
		<button>
			<img src="icons/replay.svg">
		</button>
		<button>
			<img src="icons/rewind.svg">
		</button>
		<button class="primary">
			<img src="icons/pause.svg">
		</button>
		<button>
			<img src="icons/fastforward.svg">
		</button>
		<button>
			<img src="icons/close.svg">
		</button>
	</div>
`;

class XSelection {
	constructor(selection) {
		this.selection = selection;
		this.range = selection.getRangeAt(0);
		this.spans = [];
	}

	get nodes() {
		const selection = this.selection;
		const parent = this.range.commonAncestorContainer;

		const recur = function(parentNode) {
			let selectedNodes = [];

			if (parentNode.childNodes.length > 0) {
				for (let node of parentNode.childNodes) {
					selectedNodes = selectedNodes.concat(recur(node));
				}
			} else if (parentNode.nodeType === 3 && selection.containsNode(parentNode)) {
				selectedNodes.push(parentNode);
			}

			return selectedNodes;
		}

		return recur(parent);
	}

	highlight() {
		for (let node of this.nodes) {
			let nodeRange = document.createRange();

			if (node === this.range.startContainer) {
				let offset = this.range.startOffset;
				while (offset > 0 && node.nodeValue.charAt(offset - 1) !== " ") {
					offset--;
				}
				nodeRange.setStart(node, offset);
			} else {
				nodeRange.setStart(node, 0);
			}

			if (node === this.range.endContainer) {
				let offset = this.range.endOffset;
				while (offset < node.length && node.nodeValue.charAt(offset) !== " ") {
					offset++;
				}
				nodeRange.setEnd(node, offset);
			} else {
				nodeRange.setEnd(node, node.length);
			}

			let span = document.createElement("span");
			span.className = "kalita-marked";
			span.appendChild(nodeRange.extractContents());
			nodeRange.insertNode(span);
			this.spans.push(span);
		}

		this.selection.empty();
	}

	// TODO: still a little bit buggy
	destroy() {
		for (let span of this.spans) {
			span.replaceWith(...span.childNodes);
		}
	}

}

window.addEventListener("mouseup", e => {
	
	const selection = window.getSelection();
	if (selection && selection.toString()) {
		//console.log("Selection:", selection.toString());
		//console.log(selection);

		const xsel = new XSelection(selection);
		console.log(xsel.nodes);

		xsel.highlight();

		//xsel.destroy();

	}

});