<script lang="ts">
	import { browser } from "$app/environment";
	import Card from "$lib/components/Card.svelte";
	import { Deck, type CardData } from "$lib/Deck";
	import { UserData } from "$lib/UserData";
	import { tick } from "svelte";
	import { flip } from "svelte/animate";
	import { backIn, backInOut, backOut, expoIn, expoInOut, expoOut } from "svelte/easing";
	import { fly, scale } from "svelte/transition";

	let playerData: UserData[] = $state();
	UserData.subscribe(value => { playerData = value; });

	const deck = new Deck();
	const cards: CardData[][] = $state([]);
	const wildCards: CardData[] = [
		{ rank: 8, suit: "clubs" },
		{ rank: 8, suit: "diamonds" },
		{ rank: 8, suit: "hearts" },
		{ rank: 8, suit: "spades" },
	]
	let gameContainer: HTMLDivElement;
	let lastCard = $state(deck.drawNextCard());
	let isWild = $state(false);
	let wildCardSpread = $state(0);
	let wildCardVisible = $state(0); // Set to number instead of boolean because opacity is a number
	let currentTurn = $state(0);
	let gameOver = $state(false);
	let reward = $state(0);
	let cardDivs: HTMLDivElement[] = $state([]);
	let currentPlayerTag: HTMLParagraphElement;

	// Replication issues occur when the server tries to execute the setup of the game
	if (browser) {
		for (let i = 0; i < UserData.value.length; i++) {
			cards[i] = [];
			for (let _ = 0; _ < 7; _++) cards[i].push(deck.drawNextCard());
		}
	}

	async function drawCard() {
		if (isWild) return;
		const positions = cardDivs.map(div => div && div.getBoundingClientRect()); // ChatGPT - will allow us to store the from and to parameters manually
		const card = deck.drawNextCard();
		cards[currentTurn].push(card);
		await tick(); // Wait for DOM to update

		const cardDiv = cardDivs[cards[currentTurn].length - 1];
		const rect = cardDiv.getBoundingClientRect();
		const viewportRect = gameContainer.getBoundingClientRect();

		// Animate card from deck to grid
		cardDiv.setAttribute("data-animating", "true"); // Prevent hovering of animated cards
		const animation = cardDiv.animate([
			{transform: `translate(${viewportRect.left - rect.left + viewportRect.width * 0.4 - rect.width * 0.5}px, ${viewportRect.top - rect.top + (viewportRect.height - rect.height) * 0.5}px)`},
			{transform: "translate(0, 0)"},
		], {
			duration: 250,
			easing: "ease-out"
		});
		animation.onfinish = () => cardDiv.setAttribute("data-animating", "false");

		for (let i = 0; i < cardDivs.length - 1; i++) {
			cardDivs[i].animate([
				{ transform: `translate(${positions[i].left - cardDivs[i].getBoundingClientRect().left}px, 0)` },
				{ transform: "translate(0, 0)" }
			], {
				duration: 150,
				easing: "ease-out"
			});
		}
	}

	async function playCard(index: number) {
		const card = cards[currentTurn][index];
		if (card.suit != lastCard.suit && card.rank != lastCard.rank) return;

		const cardDiv = cardDivs[index];
		const rect = cardDiv.getBoundingClientRect();
		const viewportRect = gameContainer.getBoundingClientRect();
		
		// Animate card from deck to grid
		cardDiv.setAttribute("data-animating", "true");
		const animation = cardDiv.animate([
			{ opacity: 1, transform: "translate(0, 0)" },
			{ opacity: 1, transform: `translate(${viewportRect.left - rect.left + viewportRect.width * 0.6 - rect.width * 0.5}px, ${viewportRect.top - rect.top + (viewportRect.height - rect.height) * 0.5}px)`},
		], {
			duration: 250,
			easing: "ease-out"
		});
		await animation.finished;
		cardDiv.setAttribute("data-animating", "false");
		lastCard = card;
		cards[currentTurn].splice(index, 1);

		// Bro won the game
		if (cards[currentTurn].length == 0) {
			// +1 coins per card remaining from other players
			for (const userCards of cards) reward += userCards.length;
			UserData.value[currentTurn].coins += reward;
			UserData.sync();
			gameOver = true;
			return;
		}

		isWild = lastCard.rank == 8
		if (isWild) {
			wildCardSpread = 1;
			wildCardVisible = 1;
		} else { // Switch to next person if not w // Switch to next person if not wild card card
			currentTurn = (currentTurn + 1) % cards.length;
		} 
	}

	// suit here is the index, not the name of the suit
	async function chooseWildCard(suit: number) {
		if (!isWild) return;
		lastCard = wildCards[suit];
		isWild = false;
		wildCardSpread = 0;
		currentTurn = (currentTurn + 1) % cards.length;
		// Wait until animation finishes before hiding the eights cards again
		await new Promise(response => setTimeout(response, 250));
		wildCardVisible = 0;
	}

	function reset() {
		deck.resetDeck();
		lastCard = deck.drawNextCard();

		for (let i = 0; i < UserData.value.length; i++) {
			cards[i] = [];
			for (let _ = 0; _ < 7; _++) cards[i].push(deck.drawNextCard());
		}

		isWild = false;
		currentTurn = 0;
		reward = 0;
		gameOver = false;
	}
</script>

<h1>Crazy Eights</h1>
<div id="game" bind:this={gameContainer}>
	<Card style="top: 50%; left: 40%; cursor: pointer;" face={false} onclick={drawCard} />
	<Card style="top: 50%; left: 60%;" suit={lastCard.suit} rank={lastCard.rank} />
	<div id="deck">
		{#each cards[currentTurn] as card, index (index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="card-container"
				style="margin: 0 {Math.min(41.5 / (cards[currentTurn].length - 1) - 7.5, 0.5)}%;"
				onclick={() => !isWild && playCard(index)}
				data-disabled={card.suit != lastCard.suit && card.rank != lastCard.rank}
				data-animating="false"
				bind:this={cardDivs[index]}
			>
				<!-- How I determined the spacing: https://www.desmos.com/calculator/c3r1sucwy4 -->
				<Card suit={card.suit} rank={card.rank} style="position: static; width: 100%; height: 100%;" />
			</div>
		{/each}
	</div>
	{#if isWild}<p style="left: 50%; top: 3%; width: 100%">Choose a suit</p>{/if}
	<div id="wild-cards" style="top: {36.875 - 30 * wildCardSpread}%; opacity: {wildCardVisible}">
		<Card onclick={() => chooseWildCard(0)} style="left: {52.5 - 40 * wildCardSpread}%; transform: translate(0, 0); z-index: {lastCard.suit == "clubs" ? 1 : 0}" suit="clubs" rank={8} />
		<Card onclick={() => chooseWildCard(1)} style="left: {52.5 - 20 * wildCardSpread}%; transform: translate(0, 0); z-index: {lastCard.suit == "diamonds" ? 1 : 0}" suit="diamonds" rank={8} />
		<Card onclick={() => chooseWildCard(2)} style="left: {52.5}%;						transform: translate(0, 0); z-index: {lastCard.suit == "hearts" ? 1 : 0}" suit="hearts" rank={8} />
		<Card onclick={() => chooseWildCard(3)} style="left: {52.5 + 20 * wildCardSpread}%; transform: translate(0, 0); z-index: {lastCard.suit == "spades" ? 1 : 0}" suit="spades" rank={8} />
	</div>
	<p bind:this={currentPlayerTag} style="left: 50%; top: 96%; width: 100%; font-size: 32px;">{playerData[currentTurn].username}'s Turn</p>
	{#if gameOver}
		<p id="gameover-text" style="left: 50%; top: 10%; width: 100%; font-size: 50px;">{playerData[currentTurn].username} Won!</p>
		<p style="left: 50%; top: 15%;">+{reward} coins rewarded</p>
		<button style="top: 25%" onclick={reset}>Play Again</button>
	{/if}
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

	#deck {
		position: absolute;
        width: 100%;
        height: 26.25%;
        display: flex;
		bottom: 7.5%;
		justify-content: center;
		transition: 0.2s;
	}

	.card-container {
		cursor: pointer;
		width: 15%;
		height: 100%;
		position: static;
		aspect-ratio: calc(2.5 / 3.5);
		padding: 0;
		pointer-events: none;
	}

	.card-container[data-animating="false"] {
		pointer-events: fill;
	}

	.card-container > :global(.card) {
		position: absolute;
		opacity: 1;
		transform: translate(0, 0);
		pointer-events: none;
	}

	.card-container[data-animating="false"]:hover > :global(.card) {
		scale: 1.1;
		opacity: 1;
		transform: translate(0, -25%);
	}

	.card-container[data-disabled="false"]:not(:hover) > :global(.card) {
		transform: translate(0, -5%);
	}

	.card-container[data-disabled="true"] > :global(.card) {
		opacity: 0.25;
	}

	.card-container[data-animating="false"][data-disabled="true"]:hover > :global(.card) {
		opacity: 0.5;
		transform: translate(0, -15%);
	}
	#wild-cards {
		position: absolute;
		transform: translate(-50%, -50%);
		width: 100%;
		left: 50%;
		top: 7%;
		transition: top 0.25s;
	}

	#wild-cards > :global(.card) {
		cursor: pointer;
	}

	#wild-cards > :global(.card):hover {
		scale: 1.1;
	}
</style>