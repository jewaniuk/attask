import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves the repo under /attask/, so built files need that prefix; dev stays at the root, preview matches the build
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/attask/' : '/',
  plugins: [svelte()],
}))
