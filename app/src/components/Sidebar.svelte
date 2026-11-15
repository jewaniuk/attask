<script lang="ts">
    import { slide } from "svelte/transition";
    import Icon, { categoryIcon } from "./Icon.svelte";
    import { board, categoryNames, openProjects } from "../lib/board.svelte";
    import {
        categoryHref,
        projectHref,
        router,
    } from "../lib/router.svelte";

    let categories = $derived(categoryNames(board.items));
    let projects = $derived(openProjects(board.items));
    let expanded: Record<string, boolean> = $state({});
</script>

<nav>
    <a class="row" class:current={router.route.page === "inbox"} href="#/inbox"><Icon name="inbox" />inbox</a>
    <a class="row" class:current={router.route.page === "next"} href="#/next"><Icon name="next" />next</a>

    <h4>categories</h4>
    {#each categories as name}
        <div
            class="row"
            class:current={router.route.page === "category" && router.route.name === name}
        >
            <a
                class="grow"
                href={categoryHref(name)}
               ><Icon name={categoryIcon(name)} />{name}</a
            >
            <button
                class="chevron"
                class:open={expanded[name]}
                aria-label="show projects in {name}"
                aria-expanded={expanded[name] ?? false}
                onclick={() => (expanded[name] = !expanded[name])}><Icon name="chevron" /></button
            >
        </div>
        {#if expanded[name]}
            <div class="projects" transition:slide={{ duration: 200 }}>
            {#each projects.filter((p) => p.category === name) as project}
                <a
                    class="row sub"
                    class:current={router.route.page === "project" && router.route.number === project.number}
                    href={projectHref(project.number)}
                   >{project.title}</a
                >
            {/each}
            </div>
        {/if}
    {/each}

    <a class="row settings" class:current={router.route.page === "settings"} href="#/settings"><Icon name="settings" />settings</a>
</nav>

<style>
    nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        height: 100%;
        padding: 1rem 0.6rem;
        overflow-y: auto;
    }
    h4 {
        margin: 1.4em 0.6rem 0.3em;
        color: var(--h4);
        font-variant: small-caps;
        letter-spacing: 0.04em;
        font-size: 1em;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.45em 0.6rem;
        border-radius: 6px;
        color: var(--text);
        text-decoration: none;
        transition: background 0.15s ease, color 0.15s ease;
    }
    @media (hover: hover) {
        .row:hover {
            background: var(--hover);
        }
    }
    .grow {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex: 1;
        color: inherit;
        text-decoration: none;
    }
    .current {
        background: var(--active);
        color: var(--accent);
        font-weight: 600;
    }
    .projects {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .sub {
        margin-left: 1.2rem;
        color: var(--muted);
        font-size: 0.93em;
    }
    .chevron {
        background: none;
        border: 0;
        color: var(--faint);
        line-height: 0;
        padding: 0 0.3em;
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    .chevron.open {
        transform: rotate(90deg);
    }
    .settings {
        margin-top: auto;
        color: var(--muted);
    }
</style>
