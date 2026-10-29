// Browser review: serves dist/, opens every page in your installed Google
// Chrome at desktop, laptop, tablet and phone widths, and
//   - saves full-page and first-screen screenshots to .visual/
//   - fails on horizontal overflow, console errors, failed requests,
//     images that didn't load, or elements wider than the viewport
//   - checks the mobile menu opens, closes with Escape and closes on a link
//   - checks the primary navigation anchors land on their sections
// Requires playwright-core (a dev dependency) and Chrome.
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { mkdir, readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { build } from './build.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const out = path.join(root, '.visual')
const viewports = [
  ['desktop', 1680, 1050],
  ['laptop', 1440, 900],
  ['tablet', 820, 1180],
  ['phone', 390, 844],
]
const reducedMotion = process.argv.includes('--reduced-motion')

await build({ quiet: true })
await mkdir(out, { recursive: true })
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' }
const server = createServer(async (req, res) => {
  const file = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'))
  try {
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' }).end(await readFile(file))
  } catch {
    res.writeHead(404).end()
  }
}).listen(0)
const base = `http://localhost:${server.address().port}`
const pages = (await readdir(dist)).filter((f) => f.endsWith('.html'))

const browser = await chromium.launch({ channel: 'chrome' })
const failures = []
const fail = (msg) => failures.push(msg) && console.error(`✗ ${msg}`)
// Wait until smooth scrolling has come to rest.
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = -1
        let still = 0
        const tick = () => {
          still = window.scrollY === last ? still + 1 : 0
          last = window.scrollY
          if (still >= 6) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )

for (const [name, width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: name === 'phone' ? 2 : 1, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' })
  for (const file of pages) {
    const page = await context.newPage()
    page.on('console', (m) => m.type() === 'error' && fail(`${name} ${file}: console error ${m.text()}`))
    page.on('pageerror', (e) => fail(`${name} ${file}: ${e.message}`))
    page.on('requestfailed', (r) => fail(`${name} ${file}: request failed ${r.url()}`))
    await page.goto(`${base}/${file}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const tag = `${name}-${file.replace('.html', '')}`
    await page.screenshot({ path: path.join(out, `${tag}-first.png`) })

    // Scroll through so lazy images load and reveals fire, then capture all.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.6) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
      document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => el.classList.add('is-in'))
      const pending = [...document.images].filter((img) => img.offsetParent && !img.complete)
      pending.forEach((img) => (img.loading = 'eager'))
      const loaded = Promise.all(pending.map((img) => new Promise((r) => (img.onload = img.onerror = r))))
      await Promise.race([loaded, new Promise((r) => setTimeout(r, 5000))])
    })
    await page.waitForTimeout(2600)
    await page.screenshot({ path: path.join(out, `${tag}-full.png`), fullPage: true })

    const layout = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const wide = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          return r.width > 0 && style.visibility !== 'hidden' && (r.right > vw + 1 || r.left < -1) && !el.closest('.visually-hidden, [hidden], [data-clip]')
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`)
      const broken = [...document.images].filter((i) => i.offsetParent && !i.naturalWidth).map((i) => i.getAttribute('src'))
      return { overflow: document.documentElement.scrollWidth - vw, wide, broken }
    })
    if (layout.overflow > 0) fail(`${tag}: page scrolls sideways by ${layout.overflow}px`)
    if (layout.wide.length) fail(`${tag}: elements outside the viewport: ${layout.wide.join(', ')}`)
    if (layout.broken.length) fail(`${tag}: images failed to load: ${layout.broken.join(', ')}`)

    if (file === 'index.html') {
      if (name === 'phone' || name === 'tablet') {
        const toggle = page.locator('[data-menu-toggle]')
        await toggle.click()
        if (!(await page.locator('#menu').isVisible())) fail(`${tag}: menu did not open`)
        await page.waitForTimeout(700)
        await page.screenshot({ path: path.join(out, `${tag}-menu.png`) })
        await page.keyboard.press('Escape')
        // Closing fades out (300 ms); it must be gone well within a second.
        if (!(await page.locator('#menu').waitFor({ state: 'hidden', timeout: 1000 }).then(() => true, () => false))) fail(`${tag}: Escape did not close the menu`)
        await toggle.click()
        await page.locator('#menu a', { hasText: 'Skills' }).click()
        await page.waitForTimeout(200)
        await settle(page)
        if (await page.locator('#menu').isVisible()) fail(`${tag}: menu stayed open after choosing a link`)
        const top = await page.evaluate(() => document.getElementById('skills').getBoundingClientRect().top)
        if (Math.abs(top - 84) > 40) fail(`${tag}: menu link to #skills landed at ${Math.round(top)}px`)
      } else {
        for (const id of ['work', 'about', 'skills', 'education', 'contact']) {
          await page.locator(`.masthead__nav a[data-nav="${id}"]`).click()
          await page.waitForTimeout(200)
          await settle(page)
          const top = await page.evaluate((i) => document.getElementById(i).getBoundingClientRect().top, id)
          const bottomed = await page.evaluate(() => Math.ceil(window.scrollY + innerHeight) >= document.documentElement.scrollHeight - 2)
          if (Math.abs(top - 84) > 40 && !bottomed) fail(`${tag}: nav link #${id} landed at ${Math.round(top)}px`)
        }
      }
    }
    await page.close()
  }
  await context.close()
}

await browser.close()
server.close()
console.log(`Screenshots in .visual/ (${pages.length} pages × ${viewports.length} widths${reducedMotion ? ', reduced motion' : ''}).`)
if (failures.length) process.exit(1)
console.log('✓ No layout, console or navigation problems found.')
