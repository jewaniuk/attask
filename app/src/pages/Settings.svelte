<script lang="ts">
    import { loadSettings, saveSettings } from "../lib/api";
    import { loadBoard } from "../lib/board.svelte";
    import { setTheme, theme, themes } from "../lib/theme.svelte";

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

<fieldset class="theme">
    <legend>theme</legend>
    <div class="choices">
    {#each themes as choice}
        <label class="choice">
            <input type="radio" name="theme" value={choice} checked={theme.choice === choice} onchange={() => setTheme(choice)} />
            {choice === "system" ? "match system" : choice}
        </label>
    {/each}
    </div>
</fieldset>

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
    .choices {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 1.2rem;
    }
    .theme {
        max-width: 28rem;
        margin: 2rem 0 0;
        padding: 0;
        border: 0;
    }
    legend {
        padding: 0;
        margin-bottom: 0.4rem;
        color: var(--muted);
    }
    .choice {
        flex-direction: row;
        align-items: center;
        gap: 0.4rem;
        color: var(--text);
    }
</style>
