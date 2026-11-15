<script lang="ts">
    /** Small rotating ring in the current text colour, for a request that takes a moment. Args: size: width and height in `em`, default 1.1. */
    let { size = 1.1 }: { size?: number } = $props();
</script>

<span class="spinner" role="status" aria-label="working" style="--size: {size}em"></span>

<style>
    .spinner {
        display: inline-block;
        width: var(--size);
        height: var(--size);
        border: 2px solid color-mix(in srgb, currentColor 25%, transparent);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
