import { mount } from 'svelte'
import './theme.css'
import App from './App.svelte'

/**
 * Sets `--standalone` to 1 in an iPhone home-screen app and 0 in a Safari tab.
 * In a home-screen app iOS 26 sometimes makes the fixed area (`100dvh`) shorter than the
 * screen (`100lvh`) by the status bar height, so `bottom: 0` floats above the real edge.
 * Styles multiply the live `100lvh - 100dvh` by this, because the shortfall comes and goes
 * while the app runs; in a Safari tab the two differ with the toolbar and must be left alone.
 */
function setStandalone(): void {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  document.documentElement.style.setProperty('--standalone', standalone ? '1' : '0')
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

setStandalone()

export default app
