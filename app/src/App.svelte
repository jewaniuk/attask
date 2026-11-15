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
                return `Project #${route.number}`;
            case "settings":
                return "Settings";
            case "next":
                return "Next";
            default:
                return "Inbox";
        }
    });

    onMount(loadBoard);
</script>

<div class="layout">
    <header>
        <button aria-label="open menu" onclick={() => (drawerOpen = true)}>☰</button>
        <span>{title}</span>
    </header>

    <button class="backdrop" class:open={drawerOpen} aria-label="close menu" tabindex={drawerOpen ? 0 : -1} onclick={() => (drawerOpen = false)}></button>
    <aside class:open={drawerOpen}>
        <Sidebar onnavigate={() => (drawerOpen = false)} />
    </aside>

    <main>
        {#if board.error}<p class="error">{board.error}</p>{/if}
        {#if router.route.page === "settings"}
            <h1>Settings</h1>
            <Settings />
        {:else}
            <h1>{title}</h1>
        {/if}
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
        padding: 1.5rem 3rem;
        overflow: auto;
    }
    header,
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
            grid-template-rows: auto minmax(0, 1fr);
        }
        header {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 0.6rem 1rem;
            background: var(--bg-alt);
            border-bottom: 1px solid var(--border);
            font-weight: 600;
        }
        header button {
            background: none;
            border: 0;
            font-size: 1.4em;
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
        main {
            padding: 1rem 1.5rem;
        }
    }
</style>
