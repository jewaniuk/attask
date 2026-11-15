<script lang="ts">
    import { board, select, tasksOf } from "../lib/board.svelte";
    import type { BoardItem } from "../lib/api";
    import { projectHref } from "../lib/router.svelte";
    import Icon from "./Icon.svelte";

    /** A project shows its priority and open task count and links to its page; a task shows kind, effort and due date and opens the detail sheet. The whole card is the link or button. Args: item: the card; showProject: also show the task's project title. */
    let { item, showProject = false }: { item: BoardItem; showProject?: boolean } = $props();

    // priority chip colour, one of --pr-1 (!!!) to --pr-4 (-)
    let priorityLevel = $derived(({ "!!!": 1, "!!": 2, "!": 3 } as Record<string, number>)[item.priority ?? ""] ?? 4);

    // title of the task's project, only looked up when asked for
    let projectTitle = $derived(showProject ? board.items.find((i) => i.isProject && i.number === item.parent)?.title : undefined);
    let taskCount = $derived(item.isProject ? tasksOf(board.items, item.number).length : 0);
</script>

<article>
    <div class="top">
        {#if item.isProject}
            <a class="title" href={projectHref(item.number)}>{item.title}</a>
        {:else}
            <button class="title" onclick={() => select(item.number)}>{item.title}</button>
        {/if}
        {#if item.isProject}
            <a class="issue" href={item.url} target="_blank" rel="noopener" aria-label="open issue #{item.number}"><Icon name="link" size={1} /></a>
        {/if}
    </div>
    <div class="meta">
        {#if item.isProject}
            {#if item.priority}<span class="chip priority" style="--pr: var(--pr-{priorityLevel})">{item.priority}</span>{/if}
            <span class="chip">{taskCount} open</span>
        {:else}
            {#if projectTitle}<span class="chip">{projectTitle}</span>{/if}
            {#if item.kind}<span class="chip">{item.kind}</span>{/if}
            {#if item.effort}<span class="chip">{item.effort}</span>{/if}
            {#if item.due}<span class="chip due"><Icon name="calendar" size={0.9} />{item.due}</span>{/if}
        {/if}
    </div>
</article>

<style>
    article {
        position: relative;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.7rem 0.8rem;
        box-shadow: var(--shadow-rest);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    @media (hover: hover) {
        article:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-hover);
        }
    }
    /* stretch the title link over the whole card */
    .title::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 10px;
    }
    .top {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }
    .title {
        flex: 1;
        font: inherit;
        text-align: left;
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
        overflow-wrap: anywhere;
    }
    /* above the stretched title link so it stays its own target */
    .issue {
        position: relative;
        z-index: 1;
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
        color: var(--pr);
        background: color-mix(in srgb, var(--pr) 15%, transparent);
        font-weight: 600;
    }
</style>
