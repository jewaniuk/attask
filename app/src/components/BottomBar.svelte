<script lang="ts">
    import { board, categoryNames } from "../lib/board.svelte";
    import { categoryHref, router } from "../lib/router.svelte";
    import Icon, { categoryIcon, type IconName } from "./Icon.svelte";

    /** Floating pill at the bottom of a phone screen for moving between inbox, next, the categories and settings. The current page shows its name. */

    let categories = $derived(categoryNames(board.items));

    // a project page counts as its category
    let current = $derived.by(() => {
        const route = router.route;
        if (route.page === "category") return route.name;
        if (route.page === "project") return board.items.find((i) => i.number === route.number)?.category ?? "";
        return route.page;
    });

    let links: { id: string; icon: IconName; href: string }[] = $derived([
        { id: "inbox", icon: "inbox", href: "#/inbox" },
        { id: "next", icon: "next", href: "#/next" },
        ...categories.map((name) => ({ id: name, icon: categoryIcon(name), href: categoryHref(name) })),
        { id: "settings", icon: "settings", href: "#/settings" },
    ]);
</script>

<nav>
    {#each links as link (link.id)}
        <a href={link.href} class:current={current === link.id} aria-label={link.id}>
            <Icon name={link.icon} size={1.4} />
            <span class="label" aria-hidden="true"><span>{link.id}</span></span>
        </a>
    {/each}
</nav>

<style>
    nav {
        position: fixed;
        left: 0.9rem;
        right: 0.9rem;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 0.8rem);
        z-index: 30;
        display: flex;
        justify-content: space-between;
        padding: 0.35rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--card) 78%, transparent);
        -webkit-backdrop-filter: blur(16px) saturate(1.5);
        backdrop-filter: blur(16px) saturate(1.5);
        box-shadow: var(--shadow-hover);
    }
    /* sunset gradient outline, drawn as a ring by masking out the middle */
    nav::before {
        content: "";
        position: absolute;
        inset: 0;
        padding: 1.5px;
        border-radius: inherit;
        background: var(--sunset);
        opacity: 0.55;
        pointer-events: none;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
    }
    a {
        display: flex;
        align-items: center;
        padding: 0.55rem 0.7rem;
        border-radius: 999px;
        color: var(--muted);
        text-decoration: none;
        transition: background 0.35s ease, color 0.35s ease;
    }
    .current {
        background: var(--active);
        color: var(--accent);
        font-weight: 600;
    }
    /* the name grows from zero width, so the pill glides instead of jumping */
    .label {
        display: grid;
        grid-template-columns: 0fr;
        opacity: 0;
        transition: grid-template-columns 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease;
    }
    .current .label {
        grid-template-columns: 1fr;
        opacity: 1;
    }
    .label span {
        min-width: 0;
        overflow: hidden;
        padding-left: 0.35rem;
        font-size: 0.85em;
        white-space: nowrap;
    }
</style>
