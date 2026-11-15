<script lang="ts">
    import { onMount } from "svelte";
    import Sidebar from "./components/Sidebar.svelte";
    import Settings from "./pages/Settings.svelte";
    import { board, loadBoard } from "./lib/board.svelte";
    import { router } from "./lib/router.svelte";

    let drawerOpen = $state(false);

    // placeholder titles until the pages arrive in checkpoint B
    let title = $derived.by(() => {
        const route = router.route;
        switch (route.page) {
            case "category":
                return route.name;
            case "project":
                return `project ${route.number}`;
            case "settings":
                return "settings";
            case "next":
                return "next";
            default:
                return "inbox";
        }
    });

    onMount(loadBoard);
</script>

<div class="layout">
    <button class="backdrop" class:open={drawerOpen} aria-label="close menu" tabindex={drawerOpen ? 0 : -1} onclick={() => (drawerOpen = false)}></button>
    <aside class:open={drawerOpen}>
        <Sidebar onnavigate={() => (drawerOpen = false)} />
    </aside>

    <main>
        <div class="pagehead">
            <button class="menu" aria-label="open menu" onclick={() => (drawerOpen = true)}>☰</button>
            <h1>{title}</h1>
        </div>
        <div class="content">
            {#if board.error}<p class="error">{board.error}</p>{/if}
            {#if router.route.page === "settings"}
                <Settings />
            {/if}
        </div>
    </main>
</div>

<style>
    .layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        grid-template-rows: minmax(0, 1fr);
        height: 100dvh;
    }
    aside {
        background: var(--bg-alt);
        border-right: 1px solid var(--border);
        overflow: hidden;
    }
    main {
        overflow: auto;
    }
    /* the title stays on top while the content scrolls under it */
    .pagehead {
        position: sticky;
        top: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 1.5rem 3rem 0.5rem;
        background: var(--bg);
    }
    .pagehead h1 {
        margin: 0;
    }
    .content {
        padding: 0.5rem 3rem 1.5rem;
    }
    .menu,
    .backdrop {
        display: none;
    }
    .error {
        color: var(--accent);
    }

    /* phone: the sidebar becomes a drawer over the page */
    @media (max-width: 768px) {
        .layout {
            grid-template-columns: 1fr;
        }
        .pagehead {
            padding: 0.8rem 1rem 0.4rem;
        }
        .content {
            padding: 0.5rem 1.5rem 1rem;
        }
        .menu {
            display: block;
            background: none;
            border: 0;
            padding: 0.2rem 0.4rem;
            font-size: 1.6em;
            line-height: 1;
            color: var(--muted);
            cursor: pointer;
        }
        aside {
            position: fixed;
            inset: 0 auto 0 0;
            width: min(280px, 85vw);
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
            z-index: 20;
        }
        aside.open {
            transform: none;
        }
        .backdrop {
            display: block;
            position: fixed;
            inset: 0;
            border: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 10;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .backdrop.open {
            opacity: 1;
            pointer-events: auto;
        }
    }
</style>
