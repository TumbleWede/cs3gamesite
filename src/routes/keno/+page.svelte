<script lang="ts">
    import KenoBox from "$lib/components/KenoBox.svelte";
	import { UserData } from "$lib/UserData";
    import { redirect } from "@sveltejs/kit";
    import { mount, onMount } from "svelte";
	let playerData: UserData = $state();
	UserData.value.subscribe(value => { playerData = value; });

	let grid: HTMLDivElement;
	let total = $state(0);

	onMount(() => {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 10; j++) {
				const checkbox = mount(KenoBox, {
					target: grid,
					props: {
						row: i,
						col: j,
						onchange: onClick
					}
				});
			}
		}
	});

	function onClick(checkbox: HTMLInputElement) {
		console.log(this)
	}
</script>

<h1>Keno</h1>
<div id="game">
	<div bind:this={grid} id="grid"></div>
</div>

<style>
	#grid {
		position: absolute;
		transform: translate(-50%, -50%);
		left: 50%;
		top: 50%;
		width: 60%;
		height: 60%;
		display: grid;
		grid-template-columns: auto auto auto auto auto auto auto auto auto auto;
		margin: 0;
		padding: 0;
	}
</style>