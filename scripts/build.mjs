// Builds the static site into dist/: one home page, one case-study page per
// project, plus the stylesheet, script and everything in public/.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')

export async function build({ quiet = false } = {}) {
  // Bust the module cache so the dev server picks up edits to content and templates.
  const stamp = `?t=${Date.now()}`
  const site = await import(path.join(root, 'content/site.mjs') + stamp)
  const { renderHome, renderProject } = await import(path.join(root, 'src/render.mjs') + stamp)

  await rm(dist, { recursive: true, force: true })
  await mkdir(dist, { recursive: true })
  await cp(path.join(root, 'public'), dist, { recursive: true })
  await cp(path.join(root, 'src/styles.css'), path.join(dist, 'styles.css'))
  await cp(path.join(root, 'src/main.js'), path.join(dist, 'main.js'))

  const pages = [['index.html', renderHome(site)], ...site.projects.map((p) => [`${p.slug}.html`, renderProject(site, p)])]
  await Promise.all(pages.map(([file, html]) => writeFile(path.join(dist, file), html)))
  if (!quiet) console.log(`Built ${pages.length} pages into dist/: ${pages.map(([f]) => f).join(', ')}`)
  return pages.map(([f]) => f)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build()
