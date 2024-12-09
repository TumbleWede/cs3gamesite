<script lang="ts">
    interface Props {
        row?: number;
        col?: number;
        color?: string;
        onchange?: any;
    }
    let { row = 0, col = 0, color = "blue", onchange = null, ...others }: Props = $props();
</script>

<input {...others} type="checkbox" id="i{(row * 10 + col).toString()}" onchange={onchange} style="--color: {color}" />

<style>
	input {
		appearance: none;
		background: white;
		border-radius: 4px;
		border: 1px solid grey;
		transition: 0.1s;
	}

	input:hover {
		background: rgb(230, 230, 230);
	}

	input:checked {
		background: var(--color);
	}

	input:disabled {
		border-color: darkslategrey;
	}
</style>