<script lang="ts">
    import Settings from "./pages/Settings.svelte";
    import { fetchBoard, type BoardItem } from "./lib/api";

    let board: BoardItem[] = $state([]);
    let error = $state("");

    async function load() {
        try {
            board = await fetchBoard();
            error = "";
        } catch (e) {
            error = String(e);
        }
    }
</script>

<Settings />
<button onclick={load}>load board</button>
{#if error}<p>{error}</p>{/if}
<pre>{JSON.stringify(board, null, 2)}</pre>
