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

<!-- the pill shows the status as plain text so it fits the word; the real select sits invisibly on top and opens the system picker -->
<label class="pill" style="--st: var(--st-{item.status})">
    {item.status}
    <select value={item.status} aria-label="status" onchange={(e) => changeStatus(item, e.currentTarget.value)}>
        {#each options as status}
            <option value={status} disabled={paused && (status === "next" || status === "doing")}>{status}</option>
        {/each}
    </select>
</label>

<style>
    .pill {
        position: relative;
        display: inline-block;
        padding: 0.1em 0.7em;
        font-size: 0.85em;
        font-weight: 500;
        line-height: 1.5;
        color: var(--st, var(--muted));
        background: color-mix(in srgb, var(--st, var(--muted)) 15%, var(--card));
        border: 1px solid color-mix(in srgb, var(--st, var(--muted)) 35%, transparent);
        border-radius: 999px;
        cursor: pointer;
    }
    select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
</style>
