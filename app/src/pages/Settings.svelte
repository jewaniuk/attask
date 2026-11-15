<script lang="ts">
    import { loadSettings, saveSettings } from "../lib/api";
    import { loadBoard } from "../lib/board.svelte";
    import { setTheme, theme, themes, type Theme } from "../lib/theme.svelte";

    let settings = $state(loadSettings());
</script>

<form
    class="settings"
    onsubmit={(e) => {
        e.preventDefault();
        saveSettings(settings);
        loadBoard();
    }}
>
    <label
        >worker url <input
            bind:value={settings.url}
            placeholder="http://192.168.1.23:8787"
        /></label
    >
    <label>app key <input type="password" bind:value={settings.key} /></label>
    <button class="primary">save</button>
</form>

<label class="settings theme">
    theme
    <select value={theme.choice} onchange={(e) => setTheme(e.currentTarget.value as Theme)}>
        {#each themes as choice}
            <option value={choice}>{choice === "system" ? "match system" : choice}</option>
        {/each}
    </select>
</label>

<style>
    .settings {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 28rem;
    }
    label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        color: var(--muted);
    }
    button {
        align-self: flex-start;
    }
    .theme {
        margin-top: 2rem;
    }
</style>
