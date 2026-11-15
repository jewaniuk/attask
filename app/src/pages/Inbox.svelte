<script lang="ts">
    import Card from "../components/Card.svelte";
    import { board, inboxTasks } from "../lib/board.svelte";

    /** Open tasks still in the inbox. Tap one to give it a project. */
    let tasks = $derived(inboxTasks(board.items));
</script>

<div class="list">
    {#each tasks as item (item.id)}
        <Card {item} />
    {:else}
        {#if board.items.length > 0}<p class="empty">inbox is empty</p>{/if}
    {/each}
</div>

<style>
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
