<script lang="ts">
    import { fetchDetail, type ItemDetail } from "../lib/api";
    import { board, select } from "../lib/board.svelte";
    import Icon from "./Icon.svelte";
    import StatusMenu from "./StatusMenu.svelte";

    /** Pop-up for the task in `board.selected`: a bottom sheet on a phone, a centred panel on desktop. Shows the status menu (not for an inbox task), the issue body and its comments, fetched when it opens. */
    let dialog: HTMLDialogElement;

    let item = $derived(board.items.find((i) => i.number === board.selected && !i.isProject));
    let detail = $state<ItemDetail | null>(null);
    let failed = $state("");

    $effect(() => {
        const number = board.selected;
        if (number === null) {
            if (dialog.open) dialog.close();
            return;
        }
        if (!dialog.open) {
            dialog.showModal();
            dialog.focus();
        }
        detail = null;
        failed = "";
        // ignore an answer that arrives after another task was opened
        fetchDetail(number)
            .then((d) => board.selected === number && (detail = d))
            .catch((e) => board.selected === number && (failed = String(e)));
    });
</script>

<!-- one dim layer for the whole screen, status bar area included, fading in and out together; the dialog's own backdrop is left clear -->
<div class="dim" class:on={board.selected !== null}></div>

<!-- the sheet takes the focus itself (see the effect), so the browser doesn't focus the close button -->
<dialog
    tabindex="-1"
    bind:this={dialog}
    onclose={() => select(null)}
    onclick={(e) => e.target === dialog && select(null)}
>
    {#if item}
        <header>
            <h2>{item.title}</h2>
            <button class="close" aria-label="close" onclick={() => select(null)}>×</button>
        </header>
        <div class="controls">
            <!-- inbox tasks are triaged by an agent, so they have no controls here -->
            {#if item.parent !== null}<StatusMenu {item} />{/if}
            {#if item.kind}<span class="chip">{item.kind}</span>{/if}
            {#if item.effort}<span class="chip">{item.effort}</span>{/if}
            {#if item.due}<span class="chip"><Icon name="calendar" size={0.9} />{item.due}</span>{/if}
            <a class="issue" href={item.url} target="_blank" rel="noopener"><Icon name="link" size={1} />#{item.number}</a>
        </div>
        {#if board.error}<p class="error">{board.error}</p>{/if}

        <div class="text">
            {#if failed}
                <p class="error">{failed}</p>
            {:else if !detail}
                <p class="faint">loading ...</p>
            {:else}
                <!-- html rendered and sanitized by GitHub, from this repo's own issues -->
                {#if detail.bodyHtml}{@html detail.bodyHtml}{:else}<p class="faint">no description</p>{/if}
                {#each detail.comments as comment}
                    <hr />
                    <p class="faint">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    {@html comment.bodyHtml}
                {/each}
            {/if}
        </div>
    {/if}
</dialog>

<style>
    dialog {
        width: min(36rem, 100% - 2rem);
        max-height: 80dvh;
        padding: 1.2rem 1.4rem;
        color: var(--text);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: var(--shadow-hover);
        overflow: auto;
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
    header {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }
    h2 {
        flex: 1;
        margin: 0;
        font-size: 1.25em;
        overflow-wrap: anywhere;
    }
    .close {
        font-size: 1.6em;
        line-height: 1;
        color: var(--muted);
        background: none;
        border: none;
        cursor: pointer;
    }
    .controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        margin: 0.8rem 0;
    }
    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.25em;
        padding: 0 0.5em;
        border-radius: 999px;
        background: var(--bg-alt);
        color: var(--muted);
        font-size: 0.82em;
    }
    .issue {
        display: inline-flex;
        align-items: center;
        gap: 0.25em;
        margin-left: auto;
        color: var(--muted);
        text-decoration: none;
    }
    .error {
        color: var(--accent);
    }
    .faint {
        color: var(--faint);
        font-size: 0.85em;
    }
    .text :global(img) {
        max-width: 100%;
    }
    .text :global(pre) {
        overflow-x: auto;
    }

    /* phone: a sheet pinned to the bottom */
    @media (max-width: 768px) {
        dialog {
            width: 100%;
            max-width: none;
            margin: auto 0 0;
            max-height: 85dvh;
            border-radius: 14px 14px 0 0;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1.2rem);
        }
    }
</style>
