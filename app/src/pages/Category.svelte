<script lang="ts">
    import Board from "../components/Board.svelte";
    import { board, projectsIn } from "../lib/board.svelte";
    import { categorySummary } from "../lib/categories";

    /** Kanban of one category's open projects, by status and then priority. */
    let { name }: { name: string } = $props();
</script>

{#if categorySummary(name)}<p class="summary">{categorySummary(name)}</p>{/if}
<Board statuses={["backlog", "doing", "waiting"]} items={projectsIn(board.items, name)} start="doing" />

<style>
    .summary {
        margin: 0 0 1rem;
        color: var(--muted);
    }
</style>
