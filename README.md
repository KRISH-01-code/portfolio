# Krish Shah — portfolio

My personal portfolio: a static site generated from one content file. No
framework, no backend, no API keys or environment variables. The output is
plain HTML, CSS and a small script, so it can be hosted anywhere that serves files.

## Working on it

Requires Node.js 20.11 or later.

```bash
npm install          # installs playwright-core, used only by the browser tests
npm run dev          # builds to dist/ and serves it at http://localhost:4321, rebuilding on change
npm run build        # writes the site to dist/
```

To deploy, upload the contents of `dist/` to any static host (GitHub Pages,
Netlify, Cloudflare Pages, …). Then set `person.siteUrl` in
`content/site.mjs` so canonical and social-preview tags are generated.

## Where things live

| Path | What it is |
|---|---|
| `content/site.mjs` | Everything the site says: bio, projects, skills, education, links |
| `src/render.mjs` | HTML templates for the home page and case-study pages |
| `src/styles.css` | The design system: tokens, type, layout, components |
| `src/main.js` | Progressive enhancement: hero entrance, contour background, reveals, parallax, nav indicator, mobile menu, copy email |
| `public/` | Fonts, images and the icon, copied to `dist/` as they are |
| `scripts/` | Build, dev server, static checks and browser tests |
| `test/` | Unit tests (`node --test`) |

### Day and night, and the visitor counter

The site picks day mode (warm paper, olive accent) from 07:00 to 19:00 in the
visitor's own time zone and night mode (near-black, lime accent) otherwise,
before the page paints. The clock switch in the header flips it for the rest
of that visitor's session. Colours for both modes are tokens at the top of
`src/styles.css`.

The hero shows a unique-visitor count from the free Abacus counting API
(`person.visitorCounter` in `content/site.mjs`; set it to `null` to remove
it). Each browser is counted once and remembers its number in
`localStorage`; a first-time visitor gets a small welcome card with it.
Visits from `localhost` count against a separate `-dev` counter. The count is
public and not tamper-proof: anyone can call the API.

### Adding a project

Append an object to `projects` in `content/site.mjs`. `layout` picks how it
appears on the home page: `feature` (large, full width), `dark`
(complementary split on a dark band) or `brief` (compact). Every project also
gets a case-study page at `<slug>.html`. Put screenshots in `public/images/`.
The tests fail if a field the layout needs, an image, or its alt text is missing.

### Optional settings

- `person.resume`: a path under `public/` (e.g. `files/resume.pdf`). While it's
  `null`, no resume link is shown anywhere.
- `person.siteUrl`: the deployed URL, for canonical and Open Graph tags.

## Checks

```bash
npm test             # content integrity, templates, and the static checks on a fresh build
npm run check        # build, then check links, anchors, images, alt text, headings, blocked names
npm run check:links  # the same, plus a live request to every external link
npm run test:visual  # opens every page in Chrome at 4 widths, saves screenshots to .visual/,
                     # and fails on sideways scrolling, console errors, broken images,
                     # a broken mobile menu or nav links that miss their section
npm run test:all     # all of the above, plus a reduced-motion browser pass
```

The browser tests use your installed Google Chrome through `playwright-core`;
no browser is downloaded.

`scripts/blocklist.mjs` lists names that must never appear on the published
site. The checks scan `content/` and everything in `dist/` for them.

## Images

Every screenshot is from the real project, running locally:

- RunoffLab: the project's own `docs/screenshots`, converted to WebP.
- MEDIQ: captured from a local run on its bundled synthetic data, with no AI
  providers configured.
- DiscreteSolver: carried over from the previous version of this site.

## Fonts

Newsreader (display), Inter (text) and JetBrains Mono (metadata), self-hosted
from `public/fonts/` (all under the SIL Open Font License). If they fail to
load, the stacks fall back to system fonts.

## Motion

Every animation uses the same easing and durations (the `--ease`, `--t-*`
tokens in `src/styles.css`), and only transform and opacity, so it stays on the
compositor. The hero plays one entrance once the fonts load; sections reveal
as they scroll in; screenshots are uncovered by a curtain in their project's
stage colour. All of it, including the contour background, is off under
`prefers-reduced-motion`; the contours then draw a single still frame. Small
and touch screens skip the grain layer, the parallax and the contour animation.
