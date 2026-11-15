<script lang="ts">
    import { version } from "../../package.json";
    import { clearSettings, loadSettings, saveSettings, testConnection } from "../lib/api";
    import { board, loadBoard } from "../lib/board.svelte";
    import { setTheme, theme, themes } from "../lib/theme.svelte";

    /** Settings page: theme, the Worker connection (address and app key, kept on this device), and about. */
    let settings = $state(loadSettings());
    let showKey = $state(false);
    /** Result of the last save or test, shown under the buttons; `ok` picks its colour. */
    let note = $state({ text: "", ok: true });
    let testing = $state(false);

    function save(): void {
        saveSettings(settings);
        loadBoard();
        note = { text: "saved", ok: true };
    }

    async function test(): Promise<void> {
        testing = true;
        note = { text: "", ok: true };
        try {
            note = { text: `connected, ${await testConnection(settings)} items on the board`, ok: true };
        } catch (e) {
            note = { text: e instanceof Error ? e.message : String(e), ok: false };
        } finally {
            testing = false;
        }
    }

    function signOut(): void {
        clearSettings();
        settings = loadSettings();
        board.items = [];
        board.error = "";
        note = { text: "signed out, the address and key are cleared from this device", ok: true };
    }
</script>

<div class="page">
    <section>
        <h2>appearance</h2>
        <div class="segmented" role="group" aria-label="theme">
            {#each themes as choice}
                <button class:on={theme.choice === choice} aria-pressed={theme.choice === choice} onclick={() => setTheme(choice)}>
                    {choice === "system" ? "match system" : choice}
                </button>
            {/each}
        </div>
    </section>

    <section>
        <h2>connection</h2>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                save();
            }}
        >
            <label>worker url <input bind:value={settings.url} placeholder="https://attask-worker.example.workers.dev" /></label>
            <label>
                app key
                <span class="key">
                    <input type={showKey ? "text" : "password"} bind:value={settings.key} />
                    <button type="button" onclick={() => (showKey = !showKey)}>{showKey ? "hide" : "show"}</button>
                </span>
            </label>
            <div class="actions">
                <button class="primary">save</button>
                <button type="button" disabled={testing} onclick={test}>{testing ? "testing ..." : "test connection"}</button>
                <button type="button" class="danger" onclick={signOut}>sign out</button>
            </div>
            {#if note.text}<p class="note" class:bad={!note.ok}>{note.text}</p>{/if}
        </form>
    </section>

    <section>
        <h2>about</h2>
        <p class="about">attask {version} · <a href="https://github.com/jewaniuk/attask" target="_blank" rel="noopener">source on GitHub</a></p>
    </section>
</div>

<style>
    .page {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        max-width: 28rem;
    }
    h2 {
        margin: 0 0 0.6rem;
        font-size: 0.85em;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--muted);
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        color: var(--muted);
    }
    .key {
        display: flex;
        gap: 0.4rem;
    }
    .key input {
        flex: 1;
        min-width: 0;
    }
    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .danger {
        margin-left: auto;
        color: var(--accent);
    }
    .note {
        margin: 0;
        color: var(--muted);
    }
    .note.bad {
        color: var(--accent);
    }
    .segmented {
        display: flex;
        padding: 3px;
        gap: 3px;
        background: var(--bg-alt);
        border: 1px solid var(--border);
        border-radius: 10px;
    }
    .segmented button {
        flex: 1;
        padding: 0.4em 0.6em;
        color: var(--muted);
        background: none;
        border: none;
        border-radius: 7px;
        cursor: pointer;
    }
    .segmented button.on {
        color: var(--text);
        background: var(--card);
        box-shadow: var(--shadow-rest);
    }
    .about {
        margin: 0;
        color: var(--muted);
    }
    .about a {
        color: var(--accent);
    }
</style>
