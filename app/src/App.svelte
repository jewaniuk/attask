<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "./components/Icon.svelte";
    import Sidebar from "./components/Sidebar.svelte";
    import Category from "./pages/Category.svelte";
    import Project from "./pages/Project.svelte";
    import Settings from "./pages/Settings.svelte";
    import { board, loadBoard } from "./lib/board.svelte";
    import { router } from "./lib/router.svelte";

    let drawerOpen = $state(false);

    // desktop sidebar width in px, dragged from its right edge and kept on this device
    const minWidth = 200;
    const maxWidth = 420;
    let sidebarWidth = $state(initialWidth());

    function initialWidth(): number {
        const saved = Number(localStorage.getItem("attask.sidebar"));
        return saved >= minWidth && saved <= maxWidth ? saved : 260;
    }

    function resize(width: number): void {
        sidebarWidth = Math.min(maxWidth, Math.max(minWidth, width));
        localStorage.setItem("attask.sidebar", String(sidebarWidth));
    }

    // inbox and next are placeholders until checkpoint C
    let title = $derived.by(() => {
        const route = router.route;
        switch (route.page) {
            case "category":
                return route.name;
            case "project":
                return board.items.find((i) => i.number === route.number && i.isProject)?.title ?? `project ${route.number}`;
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

<div class="layout" style="--sidebar-w: {sidebarWidth}px">
    <button class="backdrop" class:open={drawerOpen} aria-label="close menu" tabindex={drawerOpen ? 0 : -1} onclick={() => (drawerOpen = false)}></button>
    <aside class:open={drawerOpen}>
        <Sidebar onnavigate={() => (drawerOpen = false)} />
        <div
            class="resizer"
            role="slider"
            aria-orientation="horizontal"
            aria-label="resize sidebar"
            aria-valuenow={sidebarWidth}
            aria-valuemin={minWidth}
            aria-valuemax={maxWidth}
            tabindex="0"
            onpointerdown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onpointermove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && resize(e.clientX)}
            onkeydown={(e) => {
                if (e.key === "ArrowLeft") resize(sidebarWidth - 20);
                if (e.key === "ArrowRight") resize(sidebarWidth + 20);
            }}
        ></div>
    </aside>

    <main>
        <div class="pagehead">
            <button class="menu" aria-label="open menu" onclick={() => (drawerOpen = true)}><Icon name="menu" size={1.3} /></button>
            <h1>{title}</h1>
        </div>
        <div class="content">
            {#if board.error}<p class="error">{board.error}</p>{/if}
            <!-- a new page starts fresh, so a board always opens on its own starting column -->
            {#key JSON.stringify(router.route)}
                {#if router.route.page === "settings"}
                    <Settings />
                {:else if router.route.page === "category"}
                    <Category name={router.route.name} />
                {:else if router.route.page === "project"}
                    <Project number={router.route.number} />
                {/if}
            {/key}
        </div>
    </main>
</div>

<style>
    .layout {
        display: grid;
        grid-template-columns: var(--sidebar-w, 260px) 1fr;
        grid-template-rows: minmax(0, 1fr);
        height: 100dvh;
    }
    aside {
        background: var(--bg-alt);
        border-right: 1px solid var(--border);
        position: relative;
    }
    /* thin drag handle on the sidebar's right edge */
    .resizer {
        position: absolute;
        top: 0;
        bottom: 0;
        right: -3px;
        width: 7px;
        cursor: col-resize;
        touch-action: none;
        z-index: 6;
        transition: background 0.15s ease;
    }
    .resizer:hover,
    .resizer:active,
    .resizer:focus-visible {
        background: var(--border-hover);
        outline: none;
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
    .pagehead h1 {
        min-width: 0;
    }
    .error {
        color: var(--accent);
    }

    /* phone: the sidebar becomes a drawer over the page */
    @media (max-width: 768px) {
        .layout {
            grid-template-columns: 1fr;
        }
        .resizer {
            display: none;
        }
        /* the header is slightly see-through and blurs the cards scrolling under it */
        .pagehead {
            padding: 0.7rem 1.5rem 0.5rem;
            background: color-mix(in srgb, var(--bg) 72%, transparent);
            -webkit-backdrop-filter: blur(16px) saturate(1.4);
            backdrop-filter: blur(16px) saturate(1.4);
        }
        /* a long title stays on one line and is cut with an ellipsis */
        .pagehead h1 {
            font-size: 1.6em;
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .content {
            padding: 0.5rem 1.5rem 1rem;
        }
        /* glass button: translucent, blurred, with a soft edge and highlight */
        .menu {
            display: grid;
            place-items: center;
            flex: none;
            width: 2.5rem;
            height: 2.5rem;
            padding: 0;
            border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
            border-radius: 50%;
            background: color-mix(in srgb, var(--bg-alt) 55%, transparent);
            -webkit-backdrop-filter: blur(12px) saturate(1.6);
            backdrop-filter: blur(12px) saturate(1.6);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 2px 8px rgba(0, 0, 0, 0.12);
            line-height: 0;
            color: var(--text);
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
