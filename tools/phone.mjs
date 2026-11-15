// run js on the page open on the usb iphone, through ios_webkit_debug_proxy
// usage: node phone.mjs '<expression>' [page index, default the first]
//        node phone.mjs --shot out.png [page index]   page screenshot (no status bar or camera strip)
// newer ios wraps every command in the Target domain, so we send through the page target
import { writeFileSync } from 'node:fs'
const args = process.argv.slice(2)
const shot = args[0] === '--shot' ? args.splice(0, 2)[1] : null
const [expr, idx = '0'] = args
const pages = await (await fetch('http://localhost:9222/json')).json()
const ws = new WebSocket(pages[Number(idx)].webSocketDebuggerUrl)
let target = null
const send = (id, method, params) =>
  ws.send(JSON.stringify({ id: 100 + id, method: 'Target.sendMessageToTarget',
    params: { targetId: target, message: JSON.stringify({ id, method, params }) } }))
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.method === 'Target.targetCreated' && !m.params.targetInfo.isProvisional && !target) {
    target = m.params.targetInfo.targetId
    if (shot) send(1, 'Page.snapshotRect', { x: 0, y: 0, width: 430, height: 932, coordinateSystem: 'Viewport' })
    else send(1, 'Runtime.evaluate', { expression: expr, returnByValue: true })
  } else if (m.method === 'Target.dispatchMessageFromTarget') {
    const r = JSON.parse(m.params.message)
    if (r.id !== 1) return
    if (shot && r.result?.dataURL) { writeFileSync(shot, Buffer.from(r.result.dataURL.split(',')[1], 'base64')); console.log('saved', shot); process.exit(0) }
    console.log(JSON.stringify(r.result?.result?.value ?? r.result ?? r.error, null, 1))
    ws.close(); process.exit(0)
  }
}
setTimeout(() => { console.error('timeout, no response'); process.exit(1) }, 8000)
