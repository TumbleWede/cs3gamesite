<script lang="ts">
    import type { EventHandler } from "svelte/elements";

    interface Props {
        row?: number;
        col?: number;
        disabled?: boolean | null;
        color?: string;
        onchange?: any;
    }
    let { row = 0, col = 0, disabled = null, color = "blue", onchange = null, ...others }: Props = $props();
</script>

<input {...others} type="checkbox" id="{row} {col}" disabled={disabled} style="accent-color: {color}" onchange={onchange} />