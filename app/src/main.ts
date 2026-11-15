import { mount } from 'svelte'
import './theme.css'
import App from './App.svelte'

/**
 * Sets `--standalone` to 1 in an iPhone home-screen app and 0 in a Safari tab.
 * Returns whether it is a home-screen app.
 * In a home-screen app iOS 26 sometimes makes the fixed area (`100dvh`) shorter than the
 * screen (`100lvh`) by the status bar height, so `bottom: 0` floats above the real edge.
 * Styles multiply the live `100lvh - 100dvh` by this, because the shortfall comes and goes
 * while the app runs; in a Safari tab the two differ with the toolbar and must be left alone.
 */
function setStandalone(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  document.documentElement.style.setProperty('--standalone', standalone ? '1' : '0')
  return standalone
}

/**
 * Wakes a home-screen app that started with the short fixed area (see `setStandalone`).
 * iOS only recomputes it once the page is scrollable and has scrolled, which the first
 * swipe does; this does the same by hand: a page 1px too tall, scrolled down and back.
 * Until then fixed layers near the bottom are cut off by the short area.
 */
function wakeViewport(): void {
  const probe = document.createElement('div')
  probe.style.cssText = 'position: fixed; visibility: hidden; height: 100lvh'
  document.body.append(probe)
  const short = window.innerHeight < probe.getBoundingClientRect().height
  probe.remove()
  if (!short) return
  document.body.style.minHeight = '101lvh'
  window.scrollTo(0, 1)
  setTimeout(() => {
    window.scrollTo(0, 0)
    document.body.style.minHeight = ''
  }, 300)
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

if (setStandalone()) wakeViewport()

export default app
