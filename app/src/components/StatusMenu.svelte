<script lang="ts">
    import { PAUSED_STATUSES, PROJECT_STATUSES, TASK_STATUSES } from "../../../worker/src/types";
    import type { BoardItem } from "../lib/api";
    import { board, changeStatus } from "../lib/board.svelte";

    /** Picker for an item's status. Shows only the statuses its kind may have, and greys out `next` and `doing` for a task whose project is paused (the Worker refuses those). */
    let { item }: { item: BoardItem } = $props();

    let parent = $derived(board.items.find((i) => i.isProject && i.number === item.parent));
    let paused = $derived(parent?.status != null && PAUSED_STATUSES.includes(parent.status));
    // inbox is only for tasks without a parent, so it is never offered to the others
    let options = $derived((item.isProject ? PROJECT_STATUSES : TASK_STATUSES).filter((s) => s !== "inbox" || item.parent === null));
</script>

<select
    value={item.status}
    style="--st: var(--st-{item.status})"
    aria-label="status"
    onchange={(e) => changeStatus(item, e.currentTarget.value)}
>
    {#each options as status}
        <option value={status} disabled={paused && (status === "next" || status === "doing")}>{status}</option>
    {/each}
</select>

<style>
    select {
        font: inherit;
        font-weight: 500;
        color: var(--st, var(--muted));
        background: color-mix(in srgb, var(--st, var(--muted)) 15%, var(--card));
        border: 1px solid color-mix(in srgb, var(--st, var(--muted)) 35%, transparent);
        border-radius: 999px;
        padding: 0.25em 0.8em;
        cursor: pointer;
    }
</style>
