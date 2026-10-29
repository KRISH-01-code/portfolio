import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import * as site from '../content/site.mjs'
import { esc, inline, plain, renderHome, renderProject } from '../src/render.mjs'
import { build } from '../scripts/build.mjs'
import { check } from '../scripts/check.mjs'
import { allowedUrls, blockedTerms } from '../scripts/blocklist.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

test('escaping and inline emphasis', () => {
  assert.equal(esc(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
  assert.equal(inline('test *before* <b>'), 'test <em>before</em> &lt;b&gt;')
  assert.equal(plain('a *b* c'), 'a b c')
})

test('every project has what its layout renders', () => {
  const slugs = new Set()
  for (const p of site.projects) {
    assert.match(p.slug, /^[a-z0-9-]+$/, p.slug)
    assert.ok(!slugs.has(p.slug), `duplicate slug ${p.slug}`)
    slugs.add(p.slug)
    for (const key of ['title', 'kind', 'year', 'summary', 'problem', 'features', 'stack', 'gallery', 'links']) assert.ok(p[key], `${p.slug} needs ${key}`)
    if (p.layout === 'feature') assert.ok(p.gallery.length >= 3 && p.figures && p.decisions, `${p.slug} feature needs 3 images, figures, decisions`)
    if (p.layout === 'dark') assert.ok(p.gallery.length >= 2 && p.quote && p.decisions, `${p.slug} dark layout needs 2 images, a quote, decisions`)
    for (const g of p.gallery) {
      assert.ok(existsSync(path.join(root, 'public', g.src)), `missing ${g.src}`)
      assert.ok(g.alt.length > 20 && g.caption && g.width && g.height, `${g.src} needs alt, caption and size`)
    }
    if (!p.links.length) assert.ok(p.linkNote, `${p.slug} has no links, so it needs a linkNote`)
  }
})

test('skills and record only point at real projects', () => {
  const slugs = new Set([...site.projects.map((p) => p.slug), 'course'])
  for (const g of site.skills) for (const [name, refs] of g.items) for (const r of refs) assert.ok(slugs.has(r), `${name} → ${r}`)
  for (const r of site.record) assert.ok(slugs.has(r.project), r.title)
})

test('content contains no blocked names', () => {
  let text = readFileSync(path.join(root, 'content/site.mjs'), 'utf8').toLowerCase()
  for (const url of allowedUrls) text = text.replaceAll(url.toLowerCase(), '')
  for (const term of blockedTerms) assert.ok(!text.includes(term.toLowerCase()), `content mentions ${term}`)
})

test('optional resume and site URL stay hidden until set', () => {
  const html = renderHome(site)
  if (!site.person.resume) assert.ok(!/>Resume</.test(html))
  if (!site.person.siteUrl) assert.ok(!html.includes('rel="canonical"'))
  assert.ok(html.includes(`mailto:${site.person.email}`))
})

test('pages render with one h1 each', () => {
  for (const html of [renderHome(site), ...site.projects.map((p) => renderProject(site, p))]) {
    assert.equal(html.match(/<h1\b/g).length, 1)
  }
})

test('built site passes the static checks', async () => {
  await build({ quiet: true })
  const { problems, pages } = await check()
  assert.deepEqual(problems, [])
  assert.equal(pages.length, site.projects.length + 1)
})

test('case studies lead on to the next project, and the last one back home', () => {
  site.projects.forEach((p, i) => {
    const html = renderProject(site, p)
    const next = site.projects[i + 1]
    assert.ok(html.includes('href="index.html">'), `${p.slug} links home`)
    if (next) assert.ok(html.includes(`class="next" href="${next.slug}.html"`), `${p.slug} → ${next.slug}`)
    else assert.ok(html.includes('class="next" href="index.html"'), `${p.slug} ends at home`)
  })
})
