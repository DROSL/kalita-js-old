class Player {
	constructor() {
		const $ = (tagName) => {
			const elem = document.createElement(tagName);

			elem._id = (stringID) => {
				elem.id = stringID;
				return elem;
			}

			elem.append = (...childNodes) => {
				for (let node of childNodes) {
					elem.appendChild(node);
				}
				return elem;
			}

			elem.class = (className) => {
				elem.className = className;
				return elem;
			}

			elem.attr = (name, value) => {
				elem.setAttribute(name, value);
				return elem;
			}

			elem.on = (type, listener) => {
				elem.addEventListener(type, listener);
				return elem;
			}

			return elem;
		}

		this.progressbar = $("div");

		this.buttonReplay = $("button")
			.append($("img")
				.attr("src", "icons/replay.svg")
			);

		this.buttonRewind = $("button")
			.append($("img")
				.attr("src", "icons/rewind.svg")
			);

		this.imgPlayPause = $("img")
			.attr("src", "icons/play.svg");
		this.buttonPlayPause = $("button")
			.class("primary")
			.append(this.imgPlayPause)
			.on("click", (e) => this.playPause(this));

		this.buttonFastForward = $("button")
			.append($("img")
				.attr("src", "icons/fastforward.svg")
			);

		this.buttonClose = $("button")
			.append($("img")
				.attr("src", "icons/close.svg")
			);

		this.wrapper = $("div")
			._id("kalita-player")
			.append($("div")
				.class("progress")
				.append($("div")
					.class("progressbar")
					.append(this.progressbar)
				)
			)
			.append($("div")
				.class("controls")
				.append(this.buttonReplay, this.buttonRewind, this.buttonPlayPause, this.buttonFastForward, this.buttonClose)
			);

		this.playing = false;
		this.audio = null;
		this.xsel = null;
	}

	insert(elem) {
		elem.replaceWith(this.wrapper);
	}

	playPause(player) {

		if (this.playing) {
			this.pause(player);
			this.playing = false;
			this.imgPlayPause.attr("src", "icons/play.svg");
		} else {
			this.play(player);
			this.playing = true;
			this.imgPlayPause.attr("src", "icons/pause.svg");
		}

	}

	play(player) {
		const selection = window.getSelection();
		if (selection && selection.toString()) {
			//console.log("Selection:", selection.toString());
			//console.log(selection);
			let text = encodeURIComponent(selection.toString());

			if (this.xsel) {
				this.xsel.destroy();
			}
			this.xsel = new XSelection(selection);
			this.xsel.extend();
			this.xsel.highlight();

			this.audio = new Audio(`http://localhost:8080/speak?text=${text}`);
			this.audio.addEventListener("canplaythrough", (e) => {
				this.audio.play();
				this.xsel.play(this.audio.duration * 1000);
			});
		} else {
			if (this.xsel) {
				this.audio.play();
				this.xsel.play(this.audio.duration * 1000, this.audio.currentTime * 1000);
			}
		}
	}

	pause(player) {
		this.audio.pause();
		this.xsel.pause();
	}

}

const playerElem = document.getElementById("kalita-player");
const player = new Player();
player.insert(playerElem);

class XSelection {
	constructor(selection) {
		this.selection = selection;
		this.range = selection.getRangeAt(0);
		this.text = selection.toString();
		this.markNodes = [];
		this.wordNodes = [];
		this.markedWord = null;
		this.timer = null;
	}

	get nodes() {
		const selection = this.selection;
		const parent = this.range.commonAncestorContainer;

		const isVisible = function(elem) {
			return Boolean(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
		}

		const recur = function(node) {
			let selectedNodes = [];

			if (node.childNodes.length > 0) {
				for (let childNode of node.childNodes) {
					selectedNodes = selectedNodes.concat(recur(childNode));
				}
			} else if (node.nodeType === Node.TEXT_NODE && node.length > 0 && isVisible(node.parentElement) && selection.containsNode(node)) {
				selectedNodes.push(node);
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

	play(duration, offset = 0, callback) {
		clearInterval(this.timer);

		const nowTime = new Date();

		const startTime = new Date(nowTime);
		startTime.setMilliseconds(startTime.getMilliseconds() - offset);

		const endTime = new Date(startTime);
		endTime.setMilliseconds(endTime.getMilliseconds() + duration);

		let charTotal = this.wordNodes.reduce((accumulator, wordNode) => accumulator + wordNode.lastChild.length, 0);
		let charCount = 0;
		const words = this.wordNodes
			.map(word => {
				let wordTime = new Date(startTime);
				let wordDuration = charCount / charTotal * duration;
				wordTime.setMilliseconds(wordTime.getMilliseconds() + charCount / charTotal * duration);
				charCount += word.lastChild.length;
				return {
					object: word,
					startAt: wordTime
				}
			})
			.filter(word => word.startAt >= nowTime);
		let currentWord = -1;

		const tick = function() {
			let tickTime = new Date();

			if (tickTime > endTime) {
				this.markedWord.classList.remove("kalita-word");
				this.markedWord == null;
				clearInterval(this.timer);

				if (typeof callback === "function") {
					callback();
				}
			} if (currentWord + 1 < words.length && tickTime >= words[currentWord + 1].startAt) {
				if (this.markedWord) {
					this.markedWord.classList.remove("kalita-word");
				}

				this.markedWord = words[++currentWord].object;
				this.markedWord.classList.add("kalita-word");
			}
		}
		this.timer = setInterval(tick, 100);
	}

	pause() {
		clearInterval(this.timer);
	}

	// TODO: still a little bit buggy
	// elements do not seem to be really removed from the document
	destroy() {
		let wordNode;
		while (wordNode = this.wordNodes.pop()) {
			wordNode.replaceWith(...wordNode.childNodes);
		}

		let markNode;
		while (markNode = this.markNodes.pop()) {
			markNode.replaceWith(...markNode.childNodes);
		}
	}

}