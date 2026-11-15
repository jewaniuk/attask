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
        <section style="--st: var(--st-{status})">
            <h3>{status}</h3>
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
        background: color-mix(in srgb, var(--st) 13%, var(--bg-alt));
        border-radius: 12px;
        padding: 0.8rem;
        min-width: 0;
    }
    h3 {
        margin: 0 0 0.6rem;
        font-family: var(--font-ui);
        font-size: 1em;
        font-variant: small-caps;
        letter-spacing: 0.04em;
        color: var(--st);
    }
    .cards {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* phone: one column at a time, swipe sideways */
    @media (max-width: 768px) {
        .board {
            grid-auto-columns: 100%;
            gap: 0.75rem;
            /* the board reaches to the bottom of the screen, so a swipe works anywhere below the title */
            min-height: calc(100dvh - 6rem);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            margin: 0 -1.5rem;
            padding: 0 1.5rem;
            /* keep the sideways swipe from chaining into the page or the browser's back gesture */
            overscroll-behavior-x: contain;
            scrollbar-width: none;
        }
        .board::-webkit-scrollbar {
            display: none;
        }
        section {
            scroll-snap-align: center;
            /* one swipe moves one column, however hard the flick */
            scroll-snap-stop: always;
        }
    }
</style>
