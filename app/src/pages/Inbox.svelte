<script lang="ts">
    import Card from "../components/Card.svelte";
    import { board, inboxTasks } from "../lib/board.svelte";

    /** Open tasks still in the inbox, read-only: an agent triages them, so the page offers a prompt to hand over instead of controls. The prompt can be edited (for example to add notes about an issue), copied, or sent to Claude, which opens with the prompt filled in. */
    let tasks = $derived(inboxTasks(board.items));

    let generated = $derived(
        `Triage my inbox in jewaniuk/tasks (board #4). Inbox issues: ${tasks.map((t) => `#${t.number}`).join(", ")}.\n\n` +
            "Follow the tasks repo's CLAUDE.md: for each issue, infer its parent project (or propose a new one), Kind and Effort, show one compact proposal, and ask me to confirm before changing anything.\n\n" +
            "Notes:\n- ",
    );
    // null until the prompt is edited, so it follows the inbox until then
    let edited = $state<string | null>(null);
    let prompt = $derived(edited ?? generated);
    let copied = $state(false);

    // copies the prompt, and returns so a link click carries on to Claude
    async function copy(): Promise<void> {
        await navigator.clipboard.writeText(prompt);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }
</script>

<div class="list">
    {#each tasks as item (item.id)}
        <Card {item} />
    {:else}
        {#if board.items.length > 0}<p class="empty">inbox is empty</p>{/if}
    {/each}
</div>

{#if tasks.length > 0}
    <section>
        <h3>triage prompt</h3>
        <textarea rows="8" value={prompt} oninput={(e) => (edited = e.currentTarget.value)}></textarea>
        <div class="buttons">
            <button onclick={copy}>{copied ? "copied" : "copy prompt"}</button>
            <!-- the prompt travels in the link, so opening Claude needs no paste; the copy is a fallback -->
            <a class="button" href="https://claude.ai/new?q={encodeURIComponent(prompt)}" target="_blank" rel="noopener" onclick={copy}>open in Claude</a>
        </div>
    </section>
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
    section {
        max-width: 36rem;
        margin-top: 1.5rem;
    }
    h3 {
        margin: 0 0 0.5rem;
    }
    textarea {
        width: 100%;
        box-sizing: border-box;
        font: inherit;
        font-size: 0.9em;
        color: var(--text);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.6rem 0.8rem;
        resize: vertical;
    }
    .buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    button,
    .button {
        font: inherit;
        color: var(--text);
        text-decoration: none;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 0.3em 1em;
        cursor: pointer;
    }
</style>
