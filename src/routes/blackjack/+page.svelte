<script lang="ts">
	import Card from "$lib/components/Card.svelte";
	import { Deck, type CardData } from "$lib/Deck";
	import { UserData } from "$lib/UserData";
	import { onMount } from "svelte";

	let playerData: UserData = $state();
	UserData.value.subscribe(value => { playerData = value; });

	const deck = new Deck();
	let cardDivs: Card[] = [];
	let cardData: CardData[] = $state([deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard()]);
	let gameOver = $state(true);
	let gameOverText = $state("");
	let dealerScore = $state(0), youScore = $state(0);

	// You = true, dealer = false
	function getValue(rank: number, turn: boolean): number {
		if (rank > 1) return Math.min(rank, 10); // Do not exceed 10
		return (turn ? dealerScore : youScore) >= 10 ? 1 : 11;
	}
	
	function hit() {
		const i = Math.floor(Math.random() * 2) + 2; // So that it doesn't have a single card always the one that changes
		cardData[i] = deck.drawNextCard();
		cardData[1] = deck.drawNextCard();
		dealerScore += getValue(cardData[1].rank, false);
		youScore += getValue(cardData[i].rank, true);
		if (dealerScore >= 21 || youScore >= 21) stand();
	}

	function stand() {
		gameOver = true;
		dealerScore += getValue(cardData[0].rank, false);

		if (dealerScore < 17) {
			cardData[1] = deck.drawNextCard();
			dealerScore += getValue(cardData[1].rank, false);
		}
		
		if (youScore == dealerScore) {
			gameOverText = "Tie!";
		}  else if (dealerScore == 21 || youScore > 21) {
			gameOverText = "You Lose!";
			UserData.addCoins(-10);
		} else if (youScore == 21 || dealerScore > 21) {
			gameOverText = "You Win!";
			UserData.addCoins(10);
		} else if (youScore > dealerScore) {
			gameOverText = "You Win!";
			UserData.addCoins(10);
		} else {
			gameOverText = "You Lose!";
		}
	}

	function restart() {
		deck.resetDeck();
		cardData = [deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard(), deck.drawNextCard()];
		youScore = getValue(cardData[2].rank, true) + getValue(cardData[3].rank, true);
		dealerScore = getValue(cardData[1].rank, false);
		gameOver = false;
		gameOverText = "Playing";
		if (youScore == 21) stand();
	}
</script>

<h1>Blackjack</h1>
<div id="game">
	<Card bind:this={cardDivs[0]} suit={cardData[0].suit} rank={cardData[0].rank} style="top: 20%; left: 37.5%;" face={gameOver && gameOverText != ""} />
	<Card bind:this={cardDivs[1]} suit={cardData[1].suit} rank={cardData[1].rank} style="top: 20%; left: 62.5%;" face={gameOverText != ""} />
	<Card bind:this={cardDivs[2]} suit={cardData[2].suit} rank={cardData[2].rank} style="top: 80%; left: 37.5%;" face={gameOverText != ""} />
	<Card bind:this={cardDivs[3]} suit={cardData[3].suit} rank={cardData[3].rank} style="top: 80%; left: 62.5%;" face={gameOverText != ""} />
	<p style="top: 3%; left: 50%;">Dealer ({dealerScore})</p>
	<p style="top: 97%; left: 50%;">{playerData.username} ({youScore})</p>
	<button style="top: 45%; left: 50%;" onclick={hit} disabled={gameOver ? true : null}>Hit</button>
	<button style="top: 55%; left: 50%;" onclick={stand} disabled={gameOver ? true : null}>Stand</button>
	{#if gameOver}<p id="gameover-text" style="top: 50%; left: 20%; font-size: 60px;">{gameOverText}</p>{/if}
	<p style="top: 45%; left: 80%;">10 coins required</p>
	<button style="top: 50%; left: 80%;" onclick={restart} disabled={(gameOver && playerData.coins >= 10) ? null : true}>Play Again</button>
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