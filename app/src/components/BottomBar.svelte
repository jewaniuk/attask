<script lang="ts">
    import { board, categoryNames } from "../lib/board.svelte";
    import { categoryHref, router } from "../lib/router.svelte";
    import Icon, { categoryIcon, type IconName } from "./Icon.svelte";

    /** Floating pill at the bottom of a phone screen for moving between inbox, next, the categories and settings. The current page shows its name. Tapping a slot gives a haptic tick on iPhone. */

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
            <!-- iPhone only gives a tick when a finger toggles a real switch, so a see-through one covers the slot and does the navigating -->
            <input
                class="tap"
                type="checkbox"
                tabindex="-1"
                aria-hidden="true"
                {...{ switch: "" }}
                onchange={(e) => {
                    e.currentTarget.checked = false;
                    location.hash = link.href;
                }}
            />
        </a>
    {/each}
</nav>

<style>
    nav {
        position: fixed;
        left: 0.9rem;
        right: 0.9rem;
        /* --viewport-gap lowers it in a home-screen app (see main.ts); 0.4 of the home indicator inset leaves it about 26px above the screen edge */
        bottom: calc(env(safe-area-inset-bottom, 0px) * 0.4 + 0.8rem - var(--viewport-gap, 0px));
        z-index: 30;
        display: flex;
        justify-content: space-between;
        padding: 5px;
        border-radius: 999px;
        /* no backdrop-filter here: iOS clips it at the top 873px of the 932px screen in a home-screen app, cutting off the bottom of the pill */
        background: color-mix(in srgb, var(--card) 78%, transparent);
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
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
    }
    /* every slot shares the width equally and the current one grows, so the total never changes and the other icons only slide smoothly */
    a {
        position: relative;
        overflow: hidden;
        display: flex;
        flex: 1 1 0;
        min-width: 0;
        align-items: center;
        justify-content: center;
        height: 38px;
        border-radius: 999px;
        color: var(--muted);
        text-decoration: none;
        transition: flex-grow 0.4s cubic-bezier(0.32, 0.72, 0, 1), background 0.35s ease, color 0.35s ease;
    }
    .current {
        flex-grow: 2.4;
        background: var(--active);
        color: var(--accent);
        font-weight: 600;
    }
    /* each icon gets its own layer, so it is moved as a finished picture instead of being redrawn at fractional positions */
    a :global(svg) {
        will-change: transform;
        transform: translateZ(0);
    }
    .tap {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0;
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.2);
    }
    .label {
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        font-size: 0.85em;
        white-space: nowrap;
        transition: max-width 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease;
    }
    .current .label {
        max-width: 4.2rem;
        opacity: 1;
    }
    .label span {
        display: inline-block;
        padding-left: 0.35rem;
    }
</style>
