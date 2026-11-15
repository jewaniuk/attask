<script lang="ts">
    import { loadSettings, saveSettings } from "../lib/api";

    let settings = $state(loadSettings());
</script>

<form
    onsubmit={(e) => {
        e.preventDefault();
        saveSettings(settings);
    }}
>
    <label
        >worker url <input
            bind:value={settings.url}
            placeholder="http://192.168.1.23:8787"
        /></label
    >
    <label>app key <input type="password" bind:value={settings.key} /></label>
    <button>save</button>
</form>
