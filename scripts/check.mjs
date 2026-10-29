// Static checks on the built site (run `npm run build` first):
//   - every internal link and #anchor resolves
//   - every image exists and has alt text and dimensions
//   - each page has a title, a lang attribute and exactly one <h1>
//   - no name from scripts/blocklist.mjs appears anywhere in the output
//   - nothing points at localhost
// With --online it also requests every external link and reports its status.
import { readFile, readdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { allowedUrls, blockedTerms } from './blocklist.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')

const exists = (p) => stat(p).then(() => true, () => false)
const attrs = (html, tag, attr) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*\\s${attr}="([^"]*)"`, 'g'))].map((m) => m[1])
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
const unescape = (s) => s.replaceAll('&amp;', '&')

export async function check({ online = false } = {}) {
  const problems = []
  const external = new Set()
  const pages = (await readdir(dist)).filter((f) => f.endsWith('.html'))
  const html = Object.fromEntries(await Promise.all(pages.map(async (f) => [f, await readFile(path.join(dist, f), 'utf8')])))
  const idsByPage = Object.fromEntries(pages.map((f) => [f, ids(html[f])]))

  for (const page of pages) {
    const doc = html[page]
    if (!/<html lang="[^"]+"/.test(doc)) problems.push(`${page}: missing lang`)
    if (!/<title>[^<]+<\/title>/.test(doc)) problems.push(`${page}: missing <title>`)
    const h1s = doc.match(/<h1\b/g)?.length ?? 0
    if (h1s !== 1) problems.push(`${page}: expected one <h1>, found ${h1s}`)
    if (/localhost|127\.0\.0\.1/.test(doc)) problems.push(`${page}: references localhost`)

    for (const raw of attrs(doc, 'a', 'href')) {
      const href = unescape(raw)
      if (/^https?:/.test(href)) { external.add(href); continue }
      if (href.startsWith('mailto:')) {
        if (!/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(href)) problems.push(`${page}: bad mailto ${href}`)
        continue
      }
      const [file, hash] = href.split('#')
      const target = file || page
      if (!pages.includes(target) && !(await exists(path.join(dist, target)))) problems.push(`${page}: broken link ${href}`)
      // HTML defines #top as the top of the page, with or without an element.
      else if (hash && hash !== 'top' && !idsByPage[target]?.has(hash)) problems.push(`${page}: missing anchor ${href}`)
    }
    for (const tag of doc.match(/<img\b[^>]*>/g) ?? []) {
      const src = tag.match(/\ssrc="([^"]+)"/)?.[1]
      if (!src || !(await exists(path.join(dist, src)))) problems.push(`${page}: missing image ${src}`)
      if (!/\salt="[^"]{12,}"/.test(tag)) problems.push(`${page}: image without useful alt text ${src}`)
      if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) problems.push(`${page}: image without dimensions ${src}`)
    }
    for (const href of attrs(doc, 'link', 'href')) {
      if (!/^https?:/.test(href) && !(await exists(path.join(dist, href)))) problems.push(`${page}: missing asset ${href}`)
    }
  }

  // Search every text file in dist, not just the pages.
  const files = await readdir(dist, { recursive: true })
  for (const rel of files.filter((f) => /\.(html|css|js|svg|json|txt)$/.test(f))) {
    let text = (await readFile(path.join(dist, rel), 'utf8')).toLowerCase()
    for (const url of allowedUrls) text = text.replaceAll(url.toLowerCase(), '')
    for (const term of blockedTerms) if (text.includes(term.toLowerCase())) problems.push(`${rel}: contains blocked term “${term}”`)
  }

  const linkStatus = []
  if (online) {
    for (const href of external) {
      try {
        const res = await fetch(href, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) })
        linkStatus.push([href, res.status])
        if (res.status >= 400) problems.push(`external link ${href} returned ${res.status}`)
      } catch (e) {
        problems.push(`external link ${href} failed: ${e.message}`)
      }
    }
  }
  return { pages, external: [...external], linkStatus, problems }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pages, external, linkStatus, problems } = await check({ online: process.argv.includes('--online') })
  console.log(`Checked ${pages.length} pages; ${external.length} external links.`)
  for (const [href, status] of linkStatus) console.log(`  ${status}  ${href}`)
  if (problems.length) {
    console.error(problems.map((p) => `✗ ${p}`).join('\n'))
    process.exit(1)
  }
  console.log('✓ No problems found.')
}
