<script lang="ts">
    import Board from "../components/Board.svelte";
    import Icon from "../components/Icon.svelte";
    import { board, tasksOf } from "../lib/board.svelte";
    import { categoryHref } from "../lib/router.svelte";

    /** Kanban of one project's open tasks by status, with a link back to its category. */
    let { number }: { number: number } = $props();

    let project = $derived(board.items.find((i) => i.number === number && i.isProject));
    // phone starts on the column matching the project's own status: backlog, waiting, else doing
    let start = $derived(project?.status === "backlog" || project?.status === "waiting" ? project.status : "doing");
</script>

{#if project}
    {#if project.category}
        <a class="back" href={categoryHref(project.category)}><Icon name="chevron" size={0.9} />{project.category}</a>
    {/if}
{/if}
{#if project}
    <Board statuses={["backlog", "next", "doing", "waiting"]} items={tasksOf(board.items, number)} {start} />
{:else if board.items.length > 0}
    <p>no project #{number} on the board</p>
{/if}

<style>
    .back {
        display: inline-flex;
        align-items: center;
        gap: 0.2em;
        margin-bottom: 0.8rem;
        color: var(--muted);
        text-decoration: none;
    }
    .back :global(svg) {
        transform: rotate(180deg);
    }
</style>
