<script lang="ts">
	import Card from "$lib/components/Card.svelte";
	import { Deck, type CardData } from "$lib/Deck";
	import { afterUpdate, onMount } from "svelte";

	const deck = new Deck();
	let cardDivs: HTMLDivElement[] = [];
	let cardData: CardData[] = [deck.drawNextCard(), deck.drawNextCard()];
	let dealerScore = 0, youScore = 0;
	let dealt = false;
	let gameOverText = "Your card is...";

	onMount(() => {
		dealerScore = cardData[0].rank;
		youScore = cardData[1].rank;
	});
	
	function getResult(): string {
		if (dealerScore < youScore) return "h";
		if (dealerScore == youScore) return "m";
		if (dealerScore > youScore) return "l";
	}

	function draw(guess: string) {
		if (getResult() == guess) gameOverText = "You Win!";
		else gameOverText = "You Lose!";
		dealt = true;
	}

	function restart() {
		deck.resetDeck();
		cardData = [deck.drawNextCard(), deck.drawNextCard()];
		dealerScore = cardData[0].rank;
		youScore = cardData[1].rank;
		gameOverText = "Your card is...";
		dealt = false;
	}
</script>

<h1>High Card</h1>
<div id="game">
	<Card bind:this={cardDivs[0]} suit={cardData[0].suit} rank={cardData[0].rank} style="top: 50%; left: 20%;" face={dealt} />
	<Card bind:this={cardDivs[1]} suit={cardData[1].suit} rank={cardData[1].rank} style="top: 50%; left: 80%;" face={dealt} />
	<p style="top: 30%; left: 20%;">Dealer</p>
	<p style="top: 30%; left: 80%;">You</p>
	{#if dealt}<p style="top: 70%; left: 20%;">{dealerScore}</p>{/if}
	{#if dealt}<p style="top: 70%; left: 80%;">{youScore}</p>{/if}
	<button style="top: 40%; left: 50%;" onclick={() => draw("h")} disabled={dealt ? "disabled" : null}>Higher</button>
	<button style="top: 50%; left: 50%;" onclick={() => draw("m")} disabled={dealt ? "disabled" : null}>Equal</button>
	<button style="top: 60%; left: 50%;" onclick={() => draw("l")} disabled={dealt ? "disabled" : null}>Lower</button>
	<button style="top: 80%; left: 50%;" onclick={restart}>Restart</button>
	<p id="gameover-text" style="top: 20%; left: 50%; font-size: 60px;">{gameOverText}</p>
</div>

<style>
	#game p, button {
		position: absolute;
		align-content: center;
		margin: 0;
		padding: 0;
		transform: translate(-50%, -50%);
	}

	#game p {
		font-size: 24px;
		height: 10%;
	}

	#game button {
		font-size: 32px;
		padding: 0 10px;
		cursor: pointer;
	}

	#gameover-text {
        font-weight: bold;
		color: white;
		-webkit-text-stroke: 2px black;
    }
</style>