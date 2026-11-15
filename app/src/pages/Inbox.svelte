<script lang="ts">
    import Card from "../components/Card.svelte";
    import Icon from "../components/Icon.svelte";
    import { postTask } from "../lib/api";
    import { board, inboxTasks, loadBoard } from "../lib/board.svelte";

    /** Open tasks still in the inbox, read-only: an agent triages them. The button opens Claude with a triage prompt for these issues already filled in, where it can be edited before sending. */
    let tasks = $derived(inboxTasks(board.items));

    let prompt = $derived(
        `Triage my inbox in jewaniuk/tasks (board #4). Inbox issues: ${tasks.map((t) => `#${t.number}`).join(", ")}.\n\n` +
            "Follow the tasks repo's CLAUDE.md: for each issue, infer its parent project (or propose a new one), Kind and Effort, show one compact proposal, and ask me to confirm before changing anything.\n\n" +
            "Notes:\n- ",
    );

    let title = $state("");
    let adding = $state(false);
    /** Tasks just created that the board does not list yet: GitHub adds a new issue to the board a few seconds after creating it. */
    let pending: { number: number; title: string }[] = $state([]);

    /** Creates a task from the box, shows it as pending, then reloads the board until it appears. */
    async function add(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        const text = title.trim();
        if (!text || adding) return;
        adding = true;
        try {
            const { number } = await postTask(text);
            pending.push({ number, title: text });
            title = "";
            board.error = "";
            for (let i = 0; i < 6 && !board.items.some((t) => t.number === number); i++) {
                await new Promise((r) => setTimeout(r, 2500));
                await loadBoard();
            }
            pending = pending.filter((p) => p.number !== number);
        } catch (err) {
            board.error = err instanceof Error ? err.message : String(err);
        }
        adding = false;
    }
</script>

<div class="page">
<div class="list">
    {#each pending as p (p.number)}
        <div class="pending"><span class="num">#{p.number}</span> {p.title}</div>
    {/each}
    {#each tasks as item (item.id)}
        <Card {item} />
    {:else}
        {#if board.items.length > 0}<p class="empty">inbox is empty</p>{/if}
    {/each}
</div>

<form class="add" onsubmit={add}>
    <input bind:value={title} placeholder="add a task" aria-label="new task title" enterkeyhint="send" />
    <button disabled={adding || !title.trim()}>add</button>
</form>

{#if tasks.length > 0}
    <a class="triage" href="https://claude.ai/new?q={encodeURIComponent(prompt)}" target="_blank" rel="noopener">
        <Icon name="claude" size={1.3} />triage inbox
    </a>
{/if}
</div>

<style>
    .page {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 36rem;
    }
    .pending {
        padding: 0.6em 0.9em;
        color: var(--muted);
        border: 1px dashed var(--border);
        border-radius: 0.6rem;
    }
    .add {
        width: 100%;
        display: flex;
        gap: 0.5rem;
        max-width: 36rem;
        margin-top: 1.2rem;
    }
    .add input {
        flex: 1;
        min-width: 0;
        padding: 0.55em 0.9em;
        font: inherit;
        font-size: 16px; /* under 16px iOS zooms into the box on focus */
        color: var(--text);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 999px;
    }
    .add button {
        padding: 0.55em 1.2em;
        font: inherit;
        font-weight: 500;
        color: var(--text);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 999px;
    }
    .add button:disabled {
        opacity: 0.5;
    }
    /* on desktop the box sits above the list, on a phone below it next to the triage button */
    @media (min-width: 769px) {
        .add {
            order: -1;
            margin: 0 0 1rem;
        }
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
