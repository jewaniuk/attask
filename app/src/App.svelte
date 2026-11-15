<script lang="ts">
    import { onMount } from "svelte";
    import BottomBar from "./components/BottomBar.svelte";
    import Sidebar from "./components/Sidebar.svelte";
    import Category from "./pages/Category.svelte";
    import Project from "./pages/Project.svelte";
    import Settings from "./pages/Settings.svelte";
    import { board, loadBoard } from "./lib/board.svelte";
    import { router } from "./lib/router.svelte";

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
    <aside>
        <Sidebar />
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

<div class="bottombar"><BottomBar /></div>

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
    /* wide invisible grab area with a thin line that shows on hover */
    .resizer {
        position: absolute;
        top: 0;
        bottom: 0;
        right: -4px;
        width: 9px;
        cursor: col-resize;
        touch-action: none;
        z-index: 6;
        background: linear-gradient(var(--accent), var(--accent)) center / 2px 100% no-repeat;
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    .resizer:hover,
    .resizer:active,
    .resizer:focus-visible {
        opacity: 0.6;
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
    .pagehead h1 {
        min-width: 0;
    }
    .error {
        color: var(--accent);
    }

    .bottombar {
        display: none;
    }

    /* phone: no sidebar, the floating bar at the bottom moves between pages */
    @media (max-width: 768px) {
        .layout {
            grid-template-columns: 1fr;
        }
        aside {
            display: none;
        }
        .bottombar {
            display: block;
        }
        /* keep clear of the status bar in the installed app */
        .pagehead {
            padding: calc(env(safe-area-inset-top, 0px) + 0.7rem) 1.5rem 0.5rem;
        }
        .pagehead h1 {
            font-size: 1.6em;
            line-height: 1.15;
        }
        /* room under the last card for the bar */
        .content {
            padding: 0.5rem 1.5rem calc(env(safe-area-inset-bottom, 0px) + 6rem);
        }
    }
</style>
