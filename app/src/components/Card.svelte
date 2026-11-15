<script lang="ts">
    import { board, tasksOf } from "../lib/board.svelte";
    import type { BoardItem } from "../lib/api";
    import { projectHref } from "../lib/router.svelte";
    import Icon from "./Icon.svelte";

    /** A project shows its priority and open task count and links to its page; a task shows kind, effort and due date and links to its issue. */
    let { item }: { item: BoardItem } = $props();

    let taskCount = $derived(item.isProject ? tasksOf(board.items, item.number).length : 0);
</script>

<article>
    <div class="top">
        {#if item.isProject}
            <a class="title" href={projectHref(item.number)}>{item.title}</a>
        {:else}
            <a class="title" href={item.url} target="_blank" rel="noopener">{item.title}</a>
        {/if}
        {#if item.isProject}
            <a class="issue" href={item.url} target="_blank" rel="noopener" aria-label="open issue #{item.number}"><Icon name="link" size={1} /></a>
        {/if}
    </div>
    <div class="meta">
        {#if item.isProject}
            {#if item.priority}<span class="chip priority">{item.priority}</span>{/if}
            <span class="chip">{taskCount} open</span>
        {:else}
            {#if item.kind}<span class="chip">{item.kind}</span>{/if}
            {#if item.effort}<span class="chip">{item.effort}</span>{/if}
            {#if item.due}<span class="chip due"><Icon name="calendar" size={0.9} />{item.due}</span>{/if}
        {/if}
    </div>
</article>

<style>
    article {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        transition: border-color 0.15s ease;
    }
    @media (hover: hover) {
        article:hover {
            border-color: var(--border-hover);
        }
    }
    .top {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }
    .title {
        flex: 1;
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
        overflow-wrap: anywhere;
    }
    .issue {
        color: var(--faint);
        padding-top: 0.2em;
    }
    .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-top: 0.4rem;
    }
    .meta:empty {
        display: none;
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
    .priority {
        color: var(--accent);
        font-weight: 600;
    }
</style>
