import { mount } from 'svelte'
import './theme.css'
import App from './App.svelte'

/**
 * Sets `--viewport-gap`, the height of the screen that fixed `bottom` offsets miss.
 * In an iPhone home-screen app (iOS 26) the fixed area is as tall as the screen minus
 * the status bar, so `100dvh` is 59px short of `100lvh` and `bottom: 0` floats 59px
 * above the real screen edge. In a Safari tab the two differ with the toolbar, so the
 * gap is only set when running standalone.
 */
function setViewportGap(): void {
  const probe = document.createElement('div')
  probe.style.cssText = 'position: fixed; visibility: hidden; height: 100lvh'
  document.body.append(probe)
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  const gap = standalone ? probe.getBoundingClientRect().height - window.innerHeight : 0
  probe.remove()
  document.documentElement.style.setProperty('--viewport-gap', `${gap}px`)
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

setViewportGap()
window.addEventListener('resize', setViewportGap)

export default app
