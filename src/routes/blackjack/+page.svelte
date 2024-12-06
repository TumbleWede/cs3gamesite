<script lang="ts">
	import Card from "$lib/components/Card.svelte";
	import { Deck, type CardData } from "$lib/Deck";
	import { onMount } from "svelte";

	const deck = new Deck();
	let cardDivs: Card[] = [];
	let cardData: CardData[] = [deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard()];
	let gameOver = false;
	let dealerScore = 0, youScore = 0;

	onMount(() => {
		dealerScore += getValue(cardData[1].rank, false);
		youScore += getValue(cardData[3].rank, true);
	});

	// You = true, dealer = false
	function getValue(rank: number, turn: boolean): number {
		if (rank > 1) return Math.min(rank, 10); // Do not exceed 10
		return (turn ? dealerScore : youScore) > 10 ? 1 : 11;
	}
	
	function hit() {
		cardData[3] = deck.drawNextCard();
		cardData[1] = deck.drawNextCard();
		dealerScore += getValue(cardData[1].rank, false);
		youScore += getValue(cardData[3].rank, true);
		if (dealerScore >= 21 || youScore >= 21) stand();
	}

	function stand() {
		gameOver = true;
		dealerScore += getValue(cardData[0].rank, false);
	}

	function restart() {
		deck.resetDeck();
		cardData = [deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard()];
		youScore = getValue(cardData[3].rank, true);
		dealerScore = getValue(cardData[1].rank, false);
		gameOver = false;
	}
</script>

<h1>Blackjack</h1>
<div id="game">
	<Card id="deck" face={false} style="top: 50%; left: 50%;" />
	<Card bind:this={cardDivs[0]} suit={cardData[0].suit} rank={cardData[0].rank} style="top: 20%; left: 37.5%;" face={gameOver} />
	<Card bind:this={cardDivs[1]} suit={cardData[1].suit} rank={cardData[1].rank} style="top: 20%; left: 62.5%;" />
	<Card bind:this={cardDivs[2]} suit={cardData[2].suit} rank={cardData[2].rank} style="top: 80%; left: 37.5%;" />
	<Card bind:this={cardDivs[3]} suit={cardData[3].suit} rank={cardData[3].rank} style="top: 80%; left: 62.5%;" />
	<p style="top: 3%; left: 50%;">Dealer ({dealerScore})</p>
	<p style="top: 97%; left: 50%;">You ({youScore})</p>
	<button style="top: 45%; left: 50%;" onclick={hit} disabled={gameOver ? true : null}>Hit</button>
	<button style="top: 55%; left: 50%;" onclick={stand} disabled={gameOver ? true : null}>Stand</button>
	<p id="gameover-text" style="top: 50%; left: 20%; font-size: 60px;" hidden={gameOver ? null : true}>Game Over</p>
	<button style="top: 50%; left: 80%;" onclick={restart}>Play Again</button>
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