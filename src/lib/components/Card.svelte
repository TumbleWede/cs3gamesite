<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { writable } from "svelte/store";

	// Make all parameters optional and give default values so that the card cannot
	// The extends part is to make the typescript compiler happy for allowing ...others attributes
	interface Props extends HTMLAttributes<HTMLDivElement> {
		suit?: string,
		rank?: number,
		invert?: boolean,
		face?: boolean
	}
	let { suit = "joker", rank = 1, invert = false, face = true, ...others }: Props = $props();
	let card: HTMLDivElement;

	let displayRank = $derived.by(() => {
		switch (rank) {
			case 1: return "ace";
			case 11: return "jack";
			case 12: return "queen";
			case 13: return "king";
			default: return rank.toString();
		}
	});

	function getSrc() { // joker card				regular card			inverted card
		return "cards/" + (suit == "joker" ? "JO" : (displayRank + suit)) + (invert ? "S" : "") + ".GIF"
	}
	let src = $derived(face ? getSrc() : "cards/back1.GIF");
</script>


<div bind:this={card} {...others} class="card {"class" in others ? others.class : ''}">
	<img src="{src}" alt="{suit} {rank}"/>
</div>

<style>
	.card {
		width: 15%;
		aspect-ratio: calc(2.5 / 3.5);
		border-radius: 4px;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
		image-rendering: pixelated;
		margin: 0;
		position: absolute;
		transform: translate(-50%, -50%);
		transition: all 0.25s;
	}

	.card > img {
		width: 100%;
		height: 100%;
		border-radius: 4px;
		display: block;
		perspective: 1000px;
	}
</style>