<script lang="ts">
	import NavButton from "$lib/components/NavButton.svelte";
	import { UserData } from "$lib/UserData";
	import "../app.css";

	let { children } = $props();
	
	// playerData will be a reactive version of UserData for svelte components
	let playerData: UserData[] = $state();
	UserData.subscribe(value => { playerData = value; });
</script>

<nav>
	<div id="navbuttons">
		<NavButton to="/" text="Home" />
		<NavButton to="blackjack" text="Blackjack" />
		<NavButton to="highcard" text="High Card" />
		<NavButton to="slotmachine" text="Slot Machine" />
		<NavButton to="keno" text="Keno" />
		<NavButton to="crazy8" text="Crazy Eights" />
	</div>
	<div id="navstats">
		<p style="font-size: 18px;">{playerData[0].username} </p>
		<p>Coins: {playerData[0].coins} </p>
	</div>
</nav>

<div class="container">
	{@render children()}
</div>

<style>
	nav {
		width: 200px;
		height: 100vh;
		background: linear-gradient(180deg, rgb(5, 39, 103) 0%, rgb(6, 71, 18) 80%);
		position: static;
	}

	.container {
		padding: 10px;
		flex: 1;
	}

	p {
		color: white;
		font-size: 24px;
		margin: 10px 0;
		width: 200px;
		font-family: monospace;
	}

	#navstats {
		position: absolute;
		bottom: 0;
	}
</style>