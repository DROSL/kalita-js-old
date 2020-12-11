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
		this.text = selection.toString();
		this.markNodes = [];
		this.wordNodes = [];
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

	extend() {
		let startOffset = this.range.startOffset;
		while (startOffset > 0 && this.range.startContainer.nodeValue.charAt(startOffset - 1) !== " ") {
			startOffset--;
		}
		this.range.setStart(this.range.startContainer, startOffset);

		let endOffset = this.range.endOffset;
		while (endOffset < this.range.endContainer.length && this.range.endContainer.nodeValue.charAt(endOffset) !== " ") {
			endOffset++;
		}
		this.range.setEnd(this.range.endContainer, endOffset);

		this.text = this.range.toString();
	}

	highlight() {
		for (let node of this.nodes) {
			let nodeRange = document.createRange();

			if (node === this.range.startContainer) {
				nodeRange.setStart(node, this.range.startOffset);
			} else {
				nodeRange.setStart(node, 0);
			}

			if (node === this.range.endContainer) {
				nodeRange.setEnd(node, this.range.endOffset);
			} else {
				nodeRange.setEnd(node, node.length);
			}

			let markNode = document.createElement("span");
			markNode.className = "kalita-marked";
			nodeRange.surroundContents(markNode);
			this.markNodes.push(markNode);

			let textNode = markNode.lastChild;
			let startOffset = 0;
			let endOffset = 0;

			while (endOffset <= textNode.nodeValue.length) {
				if (textNode.nodeValue.charAt(endOffset) === " " || endOffset === textNode.nodeValue.length) {
					if (endOffset > startOffset) {

						let nodeRange = document.createRange();
						nodeRange.setStart(textNode, startOffset);
						nodeRange.setEnd(textNode, endOffset);

						let wordNode = document.createElement("span");
						//wordNode.className = "kalita-word";
						nodeRange.surroundContents(wordNode);
						this.wordNodes.push(wordNode);

						textNode = markNode.lastChild;
						startOffset = 0;
						endOffset = 0;

					}
					startOffset = endOffset + 1;
				}
				endOffset++;
			}
		}

		this.selection.empty();
	}

	play(duration) {
		const startTime = new Date();
		const endTime = new Date(startTime);
		endTime.setMilliseconds(endTime.getMilliseconds() + duration);

		let charTotal = this.wordNodes.reduce((accumulator, wordNode) => accumulator + wordNode.lastChild.length, 0);
		let charCount = 0;
		const words = this.wordNodes.map(word => {
			let wordTime = new Date(startTime);
			wordTime.setMilliseconds(wordTime.getMilliseconds() + charCount / charTotal * duration);
			charCount += word.lastChild.length;
			return {
				object: word,
				startAt: wordTime
			}
		});
		let currentWord = -1;

		const tick = function() {
			let tickTime = new Date();
			if (tickTime > endTime) {
				words[currentWord].object.classList.remove("kalita-word");
				window.clearInterval(timer);
			} if (currentWord + 1 < words.length && tickTime >= words[currentWord + 1].startAt) {
				if (currentWord >= 0) {
					words[currentWord].object.classList.remove("kalita-word");
				}
				words[++currentWord].object.classList.add("kalita-word");
			}


		}
		const timer = setInterval(tick, 100);
	}

	// TODO: still a little bit buggy
	// elements do not seem to be really removed from the document
	destroy() {
		let span;
		while (span = this.spans.pop()) {
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

		xsel.extend();
		xsel.highlight();

		xsel.play(10000);

	}

});