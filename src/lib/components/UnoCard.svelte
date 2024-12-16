<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	// Make all parameters optional and give default values so that the card cannot
	// The extends part is to make the typescript compiler happy for allowing ...others attributes
	interface Props extends HTMLAttributes<HTMLDivElement> {
		suit?: string,
		rank?: string,
		face?: boolean,
	}
	let { suit = "black", rank = "0", face = true, ...others }: Props = $props();

	function getSrc() {
		if (rank == "wild") return `unocards/wild${suit == "black" ? "" : suit}.svg`;
		return `unocards/${rank}.svg`;
	}
	let src = $derived(face ? getSrc() : "unocards/back.svg");
</script>


<div {...others} class="card {"class" in others ? others.class : ''}" style="background-color: {rank == "wild" || rank == "plus4" ? "black" : suit}; {"style" in others ? others.style : ''}">
	<img src="{src}" alt="{suit == "black" ? "" : suit} {rank}" />
</div>

<style>
	.card {
		width: 15%;
		aspect-ratio: calc(2.5 / 3.5);
		border-radius: 10px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
		margin: 0;
		position: absolute;
		transform: translate(-50%, -50%);
		transition: all 0.25s, background-color 0s;
	}

	.card > img {
		width: 100%;
		height: 100%;
		display: block;
		mix-blend-mode: screen;
	}
</style>