<script lang="ts">
    import Card from "../components/Card.svelte";
    import Icon from "../components/Icon.svelte";
    import { board, inboxTasks } from "../lib/board.svelte";

    /** Open tasks still in the inbox, read-only: an agent triages them. The button opens Claude with a triage prompt for these issues already filled in, where it can be edited before sending. */
    let tasks = $derived(inboxTasks(board.items));

    let prompt = $derived(
        `Triage my inbox in jewaniuk/tasks (board #4). Inbox issues: ${tasks.map((t) => `#${t.number}`).join(", ")}.\n\n` +
            "Follow the tasks repo's CLAUDE.md: for each issue, infer its parent project (or propose a new one), Kind and Effort, show one compact proposal, and ask me to confirm before changing anything.\n\n" +
            "Notes:\n- ",
    );
</script>

<div class="list">
    {#each tasks as item (item.id)}
        <Card {item} />
    {:else}
        {#if board.items.length > 0}<p class="empty">inbox is empty</p>{/if}
    {/each}
</div>

{#if tasks.length > 0}
    <a class="triage" href="https://claude.ai/new?q={encodeURIComponent(prompt)}" target="_blank" rel="noopener">
        <Icon name="claude" size={1.3} />triage inbox
    </a>
{/if}

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
    /* the icon is Claude's orange */
    .triage {
        display: inline-flex;
        align-items: center;
        gap: 0.5em;
        margin-top: 1.2rem;
        padding: 0.55em 1.2em;
        color: var(--text);
        font-weight: 500;
        text-decoration: none;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 999px;
        box-shadow: var(--shadow-rest);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .triage :global(svg) {
        color: #d97757;
    }
    @media (hover: hover) {
        .triage:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-hover);
        }
    }
</style>
