<script lang="ts">
    import KenoBox from "$lib/components/KenoBox.svelte";
	import { addCoins, type UserData, userdata, userdataWritable } from "$lib/UserData";
    import { mount, onMount } from "svelte";
	let playerData: UserData = $state();
	userdataWritable.subscribe(value => { playerData = value; });

	let grid: HTMLDivElement;
	let bet: HTMLInputElement;
	let entries: HTMLInputElement[] = $state([]);
	let isValid = $state(false);
	let gameOver = $state(false);
	let gameOverText = $state("");

	function checkInput() {
		const value = parseInt(bet.value);

		if (!value) {
			isValid = false;
			return;
		}

		isValid = value >= 10 && value <= playerData.coins;
	}

	onMount(() => {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 10; j++) {
				mount(KenoBox, {
					target: grid,
					props: {
						row: i,
						col: j,
						onchange: onClick
					}
				});
			}
		}

		bet.addEventListener("input", checkInput);
		checkInput(); // I guess svelte doesn't reset inputs on page refresh
	});

	function onClick() {
		if (!this.checked) {
			entries.splice(entries.indexOf(this), 1);
			return;
		}

		if (entries.length >= 10) {
			this.checked = false;
			return;
		}

		entries.push(this);
	}

	function pick() {
		let cells: number[] = [];
		let correct = 0;

		for (let i = 0; i < 20; i++) {
			const cell = Math.floor(Math.random() * 80);

			// Make sure we don't draw the same number twice
			if (cells.indexOf(cell) != -1) {
				i--;
				continue;
			}

			cells.push(cell);
			const element: HTMLInputElement = document.querySelector("#i" + cell);
			const found = entries.indexOf(element) != -1;
			element.setAttribute("style", `background: ${found ? "lime" : "red"};`);

			if (found) correct++;
		}

		for (let i = 0; i < 80; i++) (document.querySelector("#i" + i) as HTMLInputElement).disabled = true;
		gameOver = true;
		const earnings = Math.floor(correct * parseInt(bet.value) * 0.5);
		addCoins(earnings - parseInt(bet.value));
		gameOverText = `You won ${earnings} coins!`;
	}

	function reset() {
		for (let i = 0; i < 80; i++) {
			const checkbox: HTMLInputElement = document.querySelector("#i" + i);
			checkbox.disabled = false;
			checkbox.checked = false;
			checkbox.setAttribute("style", "--color: blue;")
			entries = [];
			gameOver = false;
		}
	}
</script>

<h1>Keno</h1>
<div id="game">
	<p style="top: 18%; left: 50%;">{entries.length}/10 Selected</p>
	<div bind:this={grid} id="grid"></div>
	{#if gameOver}
	    <p id="gameover-text" style="top: 10%; left: 50%; font-size: 50px;">{gameOverText}</p>
		<button style="top: 90%;" onclick={reset}>Play Again</button>
	{/if}
	<div id="bet" style="display: {gameOver ? "none" : "auto"};">
		<input bind:this={bet} type="text" placeholder="Bet (≥10)" />
		<button style="top: 85%;" disabled={!isValid || entries.length != 10} onclick={pick}>Pick</button>
	</div>
</div>

<style>
	#grid {
		position: absolute;
		transform: translate(-50%, -50%);
		left: 50%;
		top: 50%;
		width: 60%;
		height: 60%;
		display: grid;
		grid-template-columns: auto auto auto auto auto auto auto auto auto auto;
		margin: 0;
		padding: 0;
	}

	#game > button, p {
		position: absolute;
		align-content: center;
		margin: 0;
		padding: 0;
		transform: translate(-50%, -50%);
		font-size: 24px;
	}

	#game button, input {
		font-size: 32px;
		padding: 0 10px;
	}

	#game button {
		cursor: pointer;
	}

	#bet {
		position: absolute;
		top: 90%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	#gameover-text {
        font-weight: bold;
		color: white;
		-webkit-text-stroke: 2px black;
		width: 100%;
    }
</style>