<script lang="ts">
    import Card from "../components/Card.svelte";
    import AddTaskDialog from "../components/AddTaskDialog.svelte";
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

    let list: HTMLElement | undefined = $state();
    /** Whether the add-task pop-up is showing. */
    let open = $state(false);
    /** Tasks just created that the board does not list yet: GitHub adds a new issue to the board a few seconds after creating it. */
    let pending: { number: number; title: string }[] = $state([]);

    /** Creates a task, shows it as pending, then reloads the board until it appears. */
    async function add(text: string): Promise<void> {
        try {
            const { number } = await postTask(text);
            pending.push({ number, title: text });
            board.error = "";
            for (let i = 0; i < 6 && !board.items.some((t) => t.number === number); i++) {
                await new Promise((r) => setTimeout(r, 2500));
                await loadBoard();
            }
            pending = pending.filter((p) => p.number !== number);
        } catch (err) {
            board.error = err instanceof Error ? err.message : String(err);
        }
    }
</script>

<div class="page">
<div class="list" bind:this={list}>
    {#each pending as p (p.number)}
        <div class="pending"><span class="num">#{p.number}</span> {p.title}</div>
    {/each}
    {#each tasks as item (item.id)}
        <Card {item} />
    {:else}
        {#if board.items.length > 0}<p class="empty">inbox is empty</p>{/if}
    {/each}
</div>

<AddTaskDialog bind:open anchor={list} onsubmit={add} />

<div class="actions">
    <button class="pill" onclick={() => (open = true)}><Icon name="plus" size={1.3} />add task</button>
    {#if tasks.length > 0}
        <a class="pill" href="https://claude.ai/new?q={encodeURIComponent(prompt)}" target="_blank" rel="noopener">
            <Icon name="claude" size={1.3} />triage inbox
        </a>
    {/if}
</div>
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
        display: flex;
        align-items: center;
        min-height: 3.5rem; /* the height of the pop-up it replaces */
        padding: 0.45rem 0.8rem;
        color: var(--muted);
        border: 1px dashed var(--border);
        border-radius: 0.6rem;
    }
    .empty {
        color: var(--muted);
    }
    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 1.2rem;
    }
    .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.55em 1.2em;
        font: inherit;
        font-weight: 500;
        color: var(--text);
        text-decoration: none;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 999px;
        box-shadow: var(--shadow-rest);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    /* the triage icon is Claude's orange */
    a.pill :global(svg) {
        color: #d97757;
    }
    @media (hover: hover) {
        .pill:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-hover);
        }
    }
</style>
