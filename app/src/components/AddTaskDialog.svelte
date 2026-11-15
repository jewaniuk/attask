<script lang="ts">
    import Icon from "./Icon.svelte";

    /** Small pop-up with a title box. Enter or the plus button hands the title to `onsubmit` and closes it; the x, Escape or a tap outside cancels. Args: open: whether it is showing (bindable); onsubmit: called with the trimmed, non-empty title. */
    let { open = $bindable(false), onsubmit }: { open: boolean; onsubmit: (title: string) => void } = $props();

    let dialog: HTMLDialogElement;
    let input: HTMLInputElement;
    let title = $state("");

    $effect(() => {
        if (open && !dialog.open) {
            title = "";
            dialog.showModal();
            input.focus();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    });

    function submit(e: SubmitEvent): void {
        e.preventDefault();
        const text = title.trim();
        if (!text) return;
        open = false;
        onsubmit(text);
    }
</script>

<!-- one dim layer for the whole screen, status bar area included, as in DetailSheet -->
<div class="dim" class:on={open}></div>

<dialog bind:this={dialog} onclose={() => (open = false)} onclick={(e) => e.target === dialog && (open = false)}>
    <form onsubmit={submit}>
        <input bind:this={input} bind:value={title} placeholder="new task" aria-label="new task title" enterkeyhint="send" />
        <button class="go" aria-label="add task" disabled={!title.trim()}><Icon name="plus" size={1.3} /></button>
        <button type="button" class="cancel" aria-label="cancel" onclick={() => (open = false)}><Icon name="close" size={1.1} /></button>
    </form>
</dialog>

<style>
    dialog {
        width: min(28rem, 100% - 2rem);
        margin: 18dvh auto auto; /* high up, clear of the phone keyboard */
        padding: 0.8rem;
        color: var(--text);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: var(--shadow-hover);
    }
    dialog:focus {
        outline: none;
    }
    dialog::backdrop {
        background: transparent;
    }
    .dim {
        position: fixed;
        inset: -200px;
        z-index: 40;
        background: rgba(0, 0, 0, 0.45);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
    }
    .dim.on {
        opacity: 1;
    }
    form {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    input {
        flex: 1;
        min-width: 0;
        padding: 0.5em 0.2em;
        font: inherit;
        font-size: 16px; /* under 16px iOS zooms into the box on focus */
        color: var(--text);
        background: none;
        border: none;
    }
    input:focus {
        outline: none;
    }
    button {
        display: inline-flex;
        align-items: center;
        padding: 0.45em;
        color: var(--text);
        background: none;
        border: none;
        border-radius: 999px;
        cursor: pointer;
    }
    .go {
        color: var(--accent);
    }
    .go:disabled {
        color: var(--faint);
        cursor: default;
    }
    .cancel {
        color: var(--muted);
    }
</style>
