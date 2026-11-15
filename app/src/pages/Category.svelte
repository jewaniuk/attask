<script lang="ts">
    import Board from "../components/Board.svelte";
    import { board, projectsIn } from "../lib/board.svelte";

    /** Kanban of one category's open projects, by status and then priority. */
    let { name }: { name: string } = $props();
</script>

<Board statuses={["backlog", "doing", "waiting"]} items={projectsIn(board.items, name)} />
