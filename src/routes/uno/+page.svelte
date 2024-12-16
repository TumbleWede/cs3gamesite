<script lang="ts">
	import { browser } from "$app/environment";
	import UnoCard from "$lib/components/UnoCard.svelte";
	import { UnoDeck, type CardData } from "$lib/Deck";
	import { UserData } from "$lib/UserData";
	import { tick } from "svelte";

	let playerData: UserData[] = $state();
	UserData.subscribe(value => { playerData = value; });

	const deck = new UnoDeck();
	const cards: CardData[][] = $state([]);
	const wildCards: CardData[] = [
		{ rank: "wild", suit: "red" },
		{ rank: "wild", suit: "gold" },
		{ rank: "wild", suit: "green" },
		{ rank: "wild", suit: "blue" },
	]
	let gameContainer: HTMLDivElement = $state();
	let lastCard = $state(deck.drawNextCard());
	let isWild = $state(false);
	let wildCardSpread = $state(0);
	let wildCardVisible = $state(0); // Set to number instead of boolean because opacity is a number
	let currentTurn = $state(0);
	let gameOver = $state(false);
	let reward = $state(0);
	let rotation = 1;
	let cardDivs: HTMLDivElement[] = $state([]);
	let currentPlayerTag: HTMLParagraphElement = $state();
	let debounce = false; // To prevent selecting cards during play animation

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
			// (Viewport top left - card position) (to position the card to the top left) + desired position - card offset (so card position is the center of the card rather than the top left)
			{transform: `translate(${viewportRect.left - rect.left + viewportRect.width * 0.4 - rect.width * 0.5}px, ${viewportRect.top - rect.top + (viewportRect.height - rect.height) * 0.5}px)`},
			{transform: "translate(0, 0)"},
		], {
			duration: 250,
			easing: "ease-out"
		});
		animation.onfinish = () => cardDiv.setAttribute("data-animating", "false");

		for (let i = 0; i < cardDivs.length - 1; i++) {
			if (!cardDivs[i] || !positions[i]) continue; // Ignore null values
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
		if (debounce || card.rank != "wild" && card.rank != "plus4" && card.suit != lastCard.suit && card.rank != lastCard.rank) return;

		const cardDiv = cardDivs[index];
		const rect = cardDiv.getBoundingClientRect();
		const viewportRect = gameContainer.getBoundingClientRect();
		
		// Animate card from grid to deck
		cardDiv.setAttribute("data-animating", "true");
		debounce = true;
		const animation = cardDiv.animate([
			{ opacity: 1, transform: "translate(0, 0)" },
			{ opacity: 1, transform: `translate(${viewportRect.left - rect.left + viewportRect.width * 0.6 - rect.width * 0.5}px, ${viewportRect.top - rect.top + (viewportRect.height - rect.height) * 0.5}px)`},
		], {
			duration: 250,
			easing: "ease-out"
		});
		await animation.finished;
		debounce = false;
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

		isWild = false;

		switch (lastCard.rank) {
			case "wild":
				isWild = true;
				wildCardSpread = 1;
				wildCardVisible = 1;
				break;
			case "plus4":
				isWild = true;
				wildCardSpread = 1;
				wildCardVisible = 1;
				cards[(currentTurn + rotation + cards.length) % cards.length].push(deck.drawNextCard());
				cards[(currentTurn + rotation + cards.length) % cards.length].push(deck.drawNextCard());
				cards[(currentTurn + rotation + cards.length) % cards.length].push(deck.drawNextCard());
				cards[(currentTurn + rotation + cards.length) % cards.length].push(deck.drawNextCard());
				rotation = Math.sign(rotation) * 2;
				break;
			case "reverse":
				rotation *= -1;
				break;
			case "plus2":
				cards[(currentTurn + rotation + cards.length) % cards.length].push(deck.drawNextCard());
				cards[(currentTurn + rotation + cards.length) % cards.length].push(deck.drawNextCard());
				rotation = Math.sign(rotation) * 2;
				break;
			case "skip":
				currentTurn = (currentTurn + rotation + cards.length) % cards.length;
				break;
		}

		if (!isWild) {
			currentTurn = (currentTurn + rotation + cards.length) % cards.length;
			rotation = Math.sign(rotation);
		}
	}

	// suit here is the index, not the name of the suit
	async function chooseWildCard(suit: number) {
		if (!isWild) return;
		lastCard = wildCards[suit];
		isWild = false;
		wildCardSpread = 0;
		currentTurn = (currentTurn + rotation + cards.length) % cards.length;
		rotation = Math.sign(rotation);
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
		rotation = 1;
		reward = 0;
		gameOver = false;
	}

	let preloadProgress = $state(0);
	const ranks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "reverse", "skip", "plus2", "plus4", "wild", "wildred", "wildgold", "wildgreen", "wildblue", "back"];

	function preload() {
		return new Promise(async resolve => {
			for (const rank of ranks) {
				await new Promise(resolve => {
					const img = new Image();
					img.onload = resolve;
					img.src = `unocards/${rank}.svg`;
				});
				preloadProgress++;
			}
			resolve(null);
		});
	}
</script>

<h1>Uno</h1>
{#if browser}
{#await preload()}
<h1>Loading assets... ({preloadProgress}/{ranks.length})</h1>
{:then _}
<div id="game" bind:this={gameContainer} style="background: hsl({currentTurn * 360 / UserData.value.length}, 100%, 95%);">
	<UnoCard style="top: 50%; left: 40%; cursor: pointer;" face={false} onclick={drawCard} />
	<UnoCard style="top: 50%; left: 60%;" suit={lastCard.suit} rank={lastCard.rank} />
	<div id="deck">
		{#each cards[currentTurn] as card, index (index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="card-container"
				style="margin: 0 {Math.min(41.5 / (cards[currentTurn].length - 1) - 7.5, 0.5)}%;"
				onclick={() => !isWild && playCard(index)}
				data-disabled={card.rank != "wild" && card.rank != "plus4" && card.suit != lastCard.suit && card.rank != lastCard.rank}
				data-animating="false"
				bind:this={cardDivs[index]}
			>
				<!-- How I determined the spacing: https://www.desmos.com/calculator/c3r1sucwy4 -->
				<UnoCard suit={card.suit} rank={card.rank} style="position: static; width: 100%; height: 100%;" />
			</div>
		{/each}
	</div>
	{#if !isWild}
	<div id="spectators">
		{#each cards as userCards, i}
			<div class="deck-other">
				{#each userCards as _, index}
					<UnoCard face={false} style="scale: 0.5; left: 50%; transform: translate({(index / (userCards.length - 1) - 0.5) * 50}%, -50%) rotateZ({(index / (userCards.length - 1) - 0.5) * 30}deg);" />
				{/each}
				<p style="top: {i % 2 == 0 ? 130 : -30}%;">{UserData.value[i].username}</p>
			</div>
		{/each}
	</div>
	{/if}
	{#if isWild}<p style="left: 50%; top: 3%; width: 100%">Choose a suit</p>{/if}
	<div id="wild-cards" style="top: {36.875 - 30 * wildCardSpread}%; opacity: {wildCardVisible}">
		<UnoCard onclick={() => chooseWildCard(0)} style="left: {52.5 - 40 * wildCardSpread}%; transform: translate(0, 0); z-index: {lastCard.suit == "red" ? 1 : 0}" suit="red" rank="wild" />
		<UnoCard onclick={() => chooseWildCard(1)} style="left: {52.5 - 20 * wildCardSpread}%; transform: translate(0, 0); z-index: {lastCard.suit == "gold" ? 1 : 0}" suit="gold" rank="wild" />
		<UnoCard onclick={() => chooseWildCard(2)} style="left: {52.5}%;					   transform: translate(0, 0); z-index: {lastCard.suit == "green" ? 1 : 0}" suit="green" rank="wild" />
		<UnoCard onclick={() => chooseWildCard(3)} style="left: {52.5 + 20 * wildCardSpread}%; transform: translate(0, 0); z-index: {lastCard.suit == "blue" ? 1 : 0}" suit="blue" rank="wild" />
	</div>
	<p bind:this={currentPlayerTag} style="left: 50%; top: 96%; width: 100%; font-size: 32px;">{playerData[currentTurn].username}'s Turn</p>
	{#if gameOver}
		<p id="gameover-text" style="left: 50%; top: 10%; width: 100%; font-size: 50px;">{playerData[currentTurn].username} Won!</p>
		<p style="left: 50%; top: 15%;">+{reward} coins rewarded</p>
		<button style="top: 25%" onclick={reset}>Play Again</button>
	{/if}
</div>
{/await}{/if}

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

	#spectators {
		display: flex;
		width: 100%;
		position: absolute;
		top: 10%;
		justify-content: center;
		height: 13.125%;
	}

	.deck-other {
		position: relative;
		display: block;
		width: 100%;
		max-width: 20%;
		transform: translate(-50%, 0);
		height: 100%;
	}

	.deck-other > :global(.card) {
		width: 100%;
	}

	.deck-other > p {
		width: 100%;
		margin: auto;
		left: 100%;
		color: black;
		font-weight: bold;
		z-index: 1;
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