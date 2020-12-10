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

window.addEventListener("mouseup", e => {
	
	let selection = window.getSelection();
	if (selection && selection.toString()) {
		//console.log("Selection:", selection.toString());
		console.log(selection);

		let parent = selection.baseNode.parentNode;
		console.log(parent);

	}

});