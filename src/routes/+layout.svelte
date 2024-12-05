<script lang="ts">
	import NavButton from "$lib/components/NavButton.svelte";
	import "../app.css";

	let { children } = $props();
</script>

<nav>
	<NavButton to="/" text="Home" />
	<NavButton to="blackjack" text="Blackjack" />
</nav>

<div class="container">
	{@render children()}
</div>

<style>
	nav {
		width: 250px;
		height: 100vh;
		background: linear-gradient(180deg, rgb(5, 39, 103) 0%, rgb(6, 71, 18) 80%);
	}

	.container {
		padding: 10px;
		flex: 1;
	}
</style>