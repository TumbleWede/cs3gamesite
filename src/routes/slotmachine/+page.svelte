<script lang="ts">
	import { addCoins, type UserData, userdata, userdataWritable } from "$lib/UserData";
	let playerData: UserData = $state();
	userdataWritable.subscribe(value => { playerData = value; });

	const list = ["py", "cpp", "js", "java", "rs", "svelte"];
	let debounce = $state(false);
	let gameOverText = $state("Let's go gambling!");
	let indices = $state([
		Math.floor(Math.random() * list.length),
		Math.floor(Math.random() * list.length),
		Math.floor(Math.random() * list.length)
	]);

	async function spin() {
		if (debounce) return;
		debounce = true;
		addCoins(-5);
		indices[0] = Math.floor(Math.random() * list.length),
		indices[1] = Math.floor(Math.random() * list.length),
		indices[2] = Math.floor(Math.random() * list.length)

		for (let i = 0; i < 30; i++) {
			for (let j = 0; j < indices.length; j++)
				if (i < 5 * j + 20)
				indices[j] = (indices[j] + 1) % list.length;
			await new Promise(resolve => setTimeout(resolve, i * 5 + 10)); // Yields the script for a small interval of time
		}

		if (indices[0] === indices[1] && indices[0] === indices[2]) {
			gameOverText = "Jackpot!";
			addCoins(100);
		} else gameOverText = "Aw, dang it!";

		debounce = false;
	}
</script>

<h1>Slot Machine</h1>
<div id="game">
	<p id="fee">Costs 5 coins</p>
	<button style="top: 90%; left: 50%;" onclick={spin} disabled={(debounce || playerData.coins < 5) ? true : null}>Spin</button>
	<div id="slotmachine">
		<img id="slot1" src="langs/{list[indices[0]]}.svg" alt={list[indices[0]]} />
		<img id="slot2" src="langs/{list[indices[1]]}.svg" alt={list[indices[1]]} />
		<img id="slot3" src="langs/{list[indices[2]]}.svg" alt={list[indices[2]]} />
	</div>
	{#if !debounce}<p id="gameover-text" style="font-size: 75px;">{gameOverText}</p>{/if}
</div>

<style>
	#game > button, #fee {
		position: absolute;
		align-content: center;
		margin: 0;
		padding: 0;
		transform: translate(-50%, -50%);
	}

	#game > button {
		font-size: 32px;
		padding: 0 10px;
		cursor: pointer;
	}

	#slotmachine {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		aspect-ratio: 3;
		border: 1px solid gray;
		border-radius: 4px;
		display: flex;
	}

	#slotmachine img {
		width: 33.3%;
		height: 100%;
		border: 1px solid grey;
		margin: 0;
    }

	#gameover-text {
		font-weight: bold;
		color: white;
		-webkit-text-stroke: 2px black;
	}

	#fee {
		font-size: 24px;
		left: 50%;
		top: 80%;
	}
</style>