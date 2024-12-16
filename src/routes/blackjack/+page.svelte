<script lang="ts">
	import Card from "$lib/components/Card.svelte";
	import { Deck, type CardData } from "$lib/Deck";
	import { UserData } from "$lib/UserData";
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";

	let playerData: UserData[] = $state();
	UserData.subscribe(value => { playerData = value; });

	const deck = new Deck();
	let playerCardDivs: HTMLDivElement[] = [];
	let dealerCardDivs: HTMLDivElement[] = [];
	let playerCards: CardData[] = $state([]);
	let dealerCards: CardData[] = $state([]);
	let gameOver = $state(true);
	let gameOverText = $state("");
	let dealerScore = $state(0), youScore = $state(0);
	let debounce = $state(false); // Prevent clicking play again during dealer reveal animation

	// You = true, dealer = false
	function getValue(rank: number, turn: boolean): number {
		if (rank > 1) return Math.min(rank, 10); // Do not exceed 10
		return (turn ? youScore : dealerScore) > 10 ? 1 : 11;
	}
	
	function hit() {
		const card = deck.drawNextCard();
		playerCards.push(card);
		youScore += getValue(card.rank, true);
		if (dealerScore >= 21 || youScore >= 21) stand();
	}

	async function stand() {
		gameOver = true;
		dealerScore += getValue(dealerCards[0].rank, false);
		debounce = true;

		while (youScore < 21 && dealerScore < 17) {
			await new Promise(resolve => setTimeout(resolve, 200));
			const card = deck.drawNextCard();
			dealerCards.push(card);
			dealerScore += getValue(card.rank, false);
		}
		debounce = false;
		
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
			UserData.addCoins(-10);
		}
	}

	function restart() {
		deck.resetDeck();
		playerCards = [deck.drawNextCard(), deck.drawNextCard()];
		dealerCards = [deck.drawNextCard(), deck.drawNextCard()];
		youScore = getValue(playerCards[0].rank, true) + getValue(playerCards[1].rank, true);
		dealerScore = getValue(dealerCards[1].rank, false);
		gameOver = false;
		gameOverText = "";
		if (youScore == 21) stand();
	}
</script>

<h1>Blackjack</h1>
<div id="game">
	<!-- <Card bind:this={cardDivs[0]} suit={cardData[0].suit} rank={cardData[0].rank} style="top: 20%; left: 37.5%;" face={gameOver && gameOverText != ""} />
	<Card bind:this={cardDivs[1]} suit={cardData[1].suit} rank={cardData[1].rank} style="top: 20%; left: 62.5%;" face={gameOverText != ""} />
	<Card bind:this={cardDivs[2]} suit={cardData[2].suit} rank={cardData[2].rank} style="top: 80%; left: 37.5%;" face={gameOverText != ""} />
	<Card bind:this={cardDivs[3]} suit={cardData[3].suit} rank={cardData[3].rank} style="top: 80%; left: 62.5%;" face={gameOverText != ""} /> -->
	<div class="deck" id="deck-player" style="bottom: 7.5%;">
		{#each playerCards as card, index (index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="card-container"
				style="margin: 0 {Math.min(41.5 / (playerCards.length - 1) - 7.5, 0.5)}%;"
				bind:this={playerCardDivs[index]}
				transition:fly={{duration: 250, y: 200}}
				animate:flip={{duration: 250}}
			>
				<!-- How I determined the spacing: https://www.desmos.com/calculator/c3r1sucwy4 -->
				<Card suit={card.suit} rank={card.rank} style="position: static; width: 100%; height: 100%;" />
			</div>
		{/each}
	</div>
	<div class="deck" id="deck-dealer" style="top: 7.5%;">
		{#each dealerCards as card, index (index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="card-container"
				style="margin: 0 {Math.min(41.5 / (dealerCards.length - 1) - 7.5, 0.5)}%;"
				bind:this={dealerCardDivs[index]}
				transition:fly={{duration: 250, y: -200}}
				animate:flip={{duration: 250}}
			>
				<!-- How I determined the spacing: https://www.desmos.com/calculator/c3r1sucwy4 -->
				<Card face={gameOver || index != 0} suit={card.suit} rank={card.rank} style="position: static; width: 100%; height: 100%;" />
			</div>
		{/each}
	</div>
	
	<p style="top: 3%; left: 50%;">Dealer ({dealerScore})</p>
	<p style="top: 97%; left: 50%;">{playerData[0].username} ({youScore})</p>
	<button style="top: 45%; left: 50%;" onclick={hit} disabled={gameOver ? true : null}>Hit</button>
	<button style="top: 55%; left: 50%;" onclick={stand} disabled={gameOver ? true : null}>Stand</button>
	{#if gameOver}<p id="gameover-text" style="top: 50%; left: 20%; font-size: 60px;">{gameOverText}</p>{/if}
	<p style="top: 45%; left: 80%;">10 coins required</p>
	<button style="top: 50%; left: 80%;" onclick={restart} disabled={!gameOver || playerData[0].coins < 10 || debounce}>Play Again</button>
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

	.deck {
		position: absolute;
        width: 100%;
        height: 26.25%;
        display: flex;
		justify-content: center;
		transition: 0.2s;
	}

	.card-container {
		width: 15%;
		height: 100%;
		position: static;
		aspect-ratio: calc(2.5 / 3.5);
		padding: 0;
	}

	.card-container > :global(.card) {
		position: absolute;
		opacity: 1;
		transform: translate(0, 0);
		pointer-events: none;
	}
</style>