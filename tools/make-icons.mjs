// draws the app icon (phosphor "target", bold, MIT licence, cream on the sunset gradient) and writes
// app/public/favicon.svg plus the png icons. run from tools/: node make-icons.mjs
import fs from 'node:fs'
import { chromium } from 'playwright'

const out = new URL('../app/public/', import.meta.url).pathname
const glyph =
  'M229.26,90.4a108,108,0,0,1-177.63,114A108,108,0,0,1,195.41,43.63l20.1-20.11a12,12,0,0,1,17,17l-96,96a12,12,0,1,1-17-17l24-24a36,36,0,1,0,19.76,39.65,12,12,0,0,1,23.53,4.74,60,60,0,1,1-25.73-62L178.3,60.74a84,84,0,1,0,28.46,38,12,12,0,1,1,22.5-8.35Z'

// the glyph fills 58% of the width, well inside the circle android's maskable crop keeps
const icon = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e57c00"/><stop offset=".3" stop-color="#f0473d"/>
    <stop offset=".6" stop-color="#e0246f"/><stop offset="1" stop-color="#9b3fe6"/>
  </linearGradient></defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#g)"/>
  <path transform="translate(107.5 107.5) scale(1.16)" fill="#fff7f3" d="${glyph}"/>
</svg>`

// favicon: rounded corners. the pngs are full-bleed squares because ios and android round them themselves
fs.writeFileSync(out + 'favicon.svg', icon(112))
const browser = await chromium.launch()
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<body style="margin:0">${icon(0).replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`)
  await page.screenshot({ path: out + file })
}
await browser.close()
