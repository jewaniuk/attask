// screenshot a url in an emulated phone: webkit as iPhone, chromium as Android
// usage: node emulate.mjs <url> <out.png> [iphone|android, default iphone]
// layout, css and js only: no safe areas, status bar or home-screen mode (use phone.mjs for those)
import { webkit, chromium, devices } from 'playwright'

const [url, out, kind = 'iphone'] = process.argv.slice(2)
const [engine, device] = kind === 'android' ? [chromium, 'Pixel 7'] : [webkit, 'iPhone 15']
const browser = await engine.launch()
const page = await (await browser.newContext({ ...devices[device] })).newPage()
await page.goto(url)
await page.waitForTimeout(500)
await page.screenshot({ path: out })
await browser.close()
console.log('saved', out)
