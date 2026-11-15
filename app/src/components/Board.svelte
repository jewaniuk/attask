<script lang="ts">
    import type { BoardItem } from "../lib/api";
    import Card from "./Card.svelte";

    /**
     * Kanban board: one column per status, cards in the order given.
     *
     * Args:
     *   statuses: column names, left to right.
     *   items: the cards; each goes in the column matching its status.
     */
    let { statuses, items }: { statuses: string[]; items: BoardItem[] } = $props();
</script>

<div class="board">
    {#each statuses as status}
        {@const cards = items.filter((i) => i.status === status)}
        <section>
            <h3>{status} <span class="count">{cards.length}</span></h3>
            <div class="cards">
                {#each cards as item (item.id)}
                    <Card {item} />
                {/each}
            </div>
        </section>
    {/each}
</div>

<style>
    .board {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(240px, 1fr);
        gap: 1rem;
        align-items: start;
    }
    section {
        background: var(--bg-alt);
        border-radius: 10px;
        padding: 0.7rem;
        min-width: 0;
    }
    h3 {
        margin: 0 0 0.6rem;
        font-family: var(--font-ui);
        font-size: 1em;
        font-variant: small-caps;
        letter-spacing: 0.04em;
        color: var(--h4);
    }
    .count {
        color: var(--faint);
        font-weight: 400;
    }
    .cards {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* phone: one column at a time, swipe sideways */
    @media (max-width: 768px) {
        .board {
            grid-auto-columns: 85%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            margin: 0 -1.5rem;
            padding: 0 1.5rem;
            scroll-padding: 0 1.5rem;
        }
        section {
            scroll-snap-align: start;
        }
    }
</style>
