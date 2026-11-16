<script lang="ts">
    import Card from "../components/Card.svelte";
    import { board, categoryNames } from "../lib/board.svelte";
    import { dueSoon, nextList, PLACES, TIMES } from "../lib/next";

    /** What can be done right now, built from the board when opened: three rows of toggles (time, place, category), tasks due soon, then one list of tasks, 5 at first. The toggles are remembered on this device. */

    // first rows of the list before "show more"
    const FIRST = 5;

    // a saved toggle, or the fallback when storage is empty or blocked
    function load(key: string, fallback: string): string {
        try {
            return localStorage.getItem(`attask.next.${key}`) ?? fallback;
        } catch {
            return fallback;
        }
    }
    function save(key: string, value: string): void {
        try {
            localStorage.setItem(`attask.next.${key}`, value);
        } catch {
            // not remembered, the toggle still works
        }
    }

    let time = $state(load("time", "any"));
    let place = $state(load("place", "lab"));
    let category = $state(load("category", "all"));
    let expanded = $state(false);
    $effect(() => save("time", time));
    $effect(() => save("place", place));
    $effect(() => save("category", category));

    let categories = $derived(["all", ...categoryNames(board.items)]);
    // a saved category that no longer exists falls back to all
    let shownCategory = $derived(categories.includes(category) ? category : "all");
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
    let due = $derived(dueSoon(board.items, shownCategory, today));
    // tasks already under due soon are not repeated
    let list = $derived(nextList(board.items, { time, place, category: shownCategory }).filter((t) => !due.includes(t)));
    let shown = $derived(expanded ? list : list.slice(0, FIRST));

    let rows = $derived([
        { choices: TIMES, value: time, set: (v: string) => (time = v) },
        { choices: PLACES, value: place, set: (v: string) => (place = v) },
        { choices: categories, value: shownCategory, set: (v: string) => (category = v) },
    ]);
</script>

<div class="toggles">
    {#each rows as row, r (r)}
        <div class="row" role="group">
            {#each row.choices as choice (choice)}
                <button class:on={choice === row.value} aria-pressed={choice === row.value} onclick={() => row.set(choice)}>{choice}</button>
            {/each}
        </div>
    {/each}
</div>

{#if due.length > 0}
    <div class="list due">
        {#each due as item (item.id)}
            <Card {item} compact />
        {/each}
    </div>
{/if}

<div class="list">
    {#each shown as item (item.id)}
        <Card {item} compact />
    {:else}
        {#if board.items.length > 0 && due.length === 0}<p class="empty">nothing next</p>{/if}
    {/each}
</div>
{#if !expanded && list.length > FIRST}
    <button class="more" onclick={() => (expanded = true)}>show {list.length - FIRST} more</button>
{/if}

<style>
    .toggles {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        margin: 0.5rem 0 1rem;
    }
    .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.1rem 1rem;
    }
    .row button,
    .more {
        font: inherit;
        padding: 0.15rem 0;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--faint);
    }
    .row button.on {
        color: var(--text);
        font-weight: 500;
    }
    .list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 36rem;
    }
    .due {
        margin-bottom: 1.25rem;
    }
    .more {
        margin-top: 0.6rem;
        color: var(--muted);
        font-size: 0.9em;
    }
    .empty {
        color: var(--muted);
    }
</style>
