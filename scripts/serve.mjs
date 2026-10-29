// Local server for dist/. With --watch (npm run dev) it rebuilds whenever
// content/, src/ or public/ changes; refresh the browser to see the result.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { watch } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { build } from './build.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const port = Number(process.env.PORT ?? 4321)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
}

await build()

if (process.argv.includes('--watch')) {
  let timer
  for (const dir of ['content', 'src', 'public']) {
    watch(path.join(root, dir), { recursive: true }, () => {
      clearTimeout(timer)
      timer = setTimeout(() => build({ quiet: true }).then(() => console.log('Rebuilt')).catch((e) => console.error(e)), 80)
    })
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  let file = path.normalize(path.join(dist, decodeURIComponent(url.pathname)))
  if (!file.startsWith(dist)) return res.writeHead(403).end()
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found')
  }
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`))
