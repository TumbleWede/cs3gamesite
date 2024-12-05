<script lang="ts">
	let { to, text } = $props();
</script>

<button class="nav-button">
	<a href={to} data-sveltekit-preload-data>{text}</a>
</button>

<style>
	.nav-button {
		width: 100%;
		height: 60px;
		background: transparent;
		border: none;
		padding: 0;
		transition: 0.25s;
	}

	.nav-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.nav-button > a {
		color: white;
		font-size: 24px;
		width: 100%;
		height: 100%;
		display: block;
		align-content: center;
	}
</style>