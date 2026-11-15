<script lang="ts">
    import Card from "../components/Card.svelte";
    import { board, nextTasks } from "../lib/board.svelte";

    /** What to work on now: `doing` and `next` tasks of `doing` projects, one list per category. */
    let groups = $derived(nextTasks(board.items));
</script>

{#each groups as group (group.category)}
    <h3>{group.category}</h3>
    <div class="list">
        {#each group.tasks as item (item.id)}
            <Card {item} showProject />
        {/each}
    </div>
{:else}
    {#if board.items.length > 0}<p class="empty">nothing next</p>{/if}
{/each}

<style>
    h3 {
        margin: 1rem 0 0.5rem;
    }
    .list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 36rem;
    }
    .empty {
        color: var(--muted);
    }
</style>
