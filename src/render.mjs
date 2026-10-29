// HTML templates. Every function returns a string; all content passes through
// esc() or inline() so copy in content/site.mjs can't inject markup.

export const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/** Escapes text, then turns *emphasis* into <em>. */
export const inline = (value) => esc(value).replace(/\*([^*]+)\*/g, '<em>$1</em>')

/** Plain text with the emphasis markers removed, for metadata and alt text. */
export const plain = (value) => String(value).replace(/\*([^*]+)\*/g, '$1')

const pad = (n) => String(n).padStart(2, '0')

/** Class that gives a project's elements its own accent colours. */
const theme = (p) => (p.theme ? `theme-${p.theme}` : '')

/** Shared name so a project's title morphs into its case-study heading. */
const vtName = (p) => `style="view-transition-name: title-${esc(p.slug)}"`

const arrow = (dir = 'right') => {
  const paths = {
    right: 'M2.5 8h11M9 3.5 13.5 8 9 12.5',
    down: 'M8 2.5v11M3.5 9 8 13.5 12.5 9',
    out: 'M4.5 11.5 11.5 4.5M5.5 4.5h6v6',
    left: 'M13.5 8h-11M7 3.5 2.5 8 7 12.5',
    up: 'M8 13.5v-11M3.5 7 8 2.5 12.5 7',
  }
  return `<svg class="arrow arrow--${dir}" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[dir]}"/></svg>`
}

const external = (href, label, cls = 'link-arrow') =>
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}${arrow('out')}<span class="visually-hidden"> (opens in a new tab)</span></a>`

const img = ({ src, width, height, alt }, { eager = false, sizes = '100vw' } = {}) =>
  `<img src="${esc(src)}" width="${width}" height="${height}" alt="${esc(alt)}" sizes="${esc(sizes)}" ${
    eager ? 'fetchpriority="high"' : 'loading="lazy"'
  } decoding="async">`

// `parallax` lets the screenshot drift a little inside its frame as the page
// scrolls; only used on the largest images.
const figure = (item, { label, eager, sizes, cls = '', parallax = false } = {}) => `
  <figure class="plate ${cls}">
    <div class="plate__frame"${parallax ? ' data-parallax' : ''}>${img(item, { eager, sizes })}</div>
    <figcaption class="plate__caption">${label ? `<span class="meta">${esc(label)}</span>` : ''}<span>${esc(item.caption)}</span></figcaption>
  </figure>`

const nav = [
  ['work', 'Work'],
  ['about', 'About'],
  ['skills', 'Skills'],
  ['education', 'Education'],
  ['contact', 'Contact'],
]

function header({ home }) {
  const href = (id) => (home ? `#${id}` : `index.html#${id}`)
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead" data-masthead>
  <div class="wrap masthead__inner">
    <a class="masthead__mark" href="${home ? '#top' : 'index.html'}" aria-label="Krish Shah — home">
      <span class="monogram" aria-hidden="true">KS</span>
      <span class="masthead__name">Krish Shah</span>
      <span class="masthead__role meta">Computer Science · Guelph</span>
    </a>
    <nav class="masthead__nav" aria-label="Primary">
      <ol>${nav
        .map(([id, label], i) => `<li><a href="${href(id)}" data-nav="${id}"><span class="meta">${pad(i + 1)}</span>${label}</a></li>`)
        .join('')}</ol>
    </nav>
    <div class="masthead__tools">
      <button class="daynight" type="button" data-daynight aria-label="Switch between day and night mode">
        <span class="daynight__icon" aria-hidden="true"><svg class="daynight__sun" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M3.05 12.95l1.13-1.13M11.82 4.18l1.13-1.13"/></svg><svg class="daynight__moon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z"/></svg></span>
        <span class="daynight__time meta" data-daynight-time></span>
      </button>
      <button class="masthead__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="masthead__toggle-label">Menu</span><span class="burger" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </div>
  <div class="menu" id="menu" hidden data-menu>
    <ol class="wrap menu__list">${nav
      .map(([id, label], i) => `<li style="--i:${i}"><a href="${href(id)}"><span class="meta">${pad(i + 1)}</span>${label}</a></li>`)
      .join('')}</ol>
  </div>
</header>`
}

function footer(person) {
  return `
<footer class="footer">
  <div class="wrap footer__inner">
    <p class="footer__sign">Krish Shah<span class="dot" aria-hidden="true">.</span></p>
    <nav class="footer__nav" aria-label="Footer">
      <ul>${nav.map(([id, label]) => `<li><a class="link" href="index.html#${id}">${label}</a></li>`).join('')}</ul>
      <ul>
        ${person.profiles.map((p) => `<li>${external(p.href, p.label, 'link')}</li>`).join('')}
        <li><a class="link" href="mailto:${esc(person.email)}">Email</a></li>
        ${person.resume ? `<li><a class="link" href="${esc(person.resume)}">Resume</a></li>` : ''}
      </ul>
    </nav>
    <div class="footer__legal meta">
      <p>© ${new Date().getFullYear()} Krish Shah · Built from plain HTML, CSS and a little JavaScript</p>
      <a class="footer__top" href="#top">Back to top${arrow('up')}</a>
    </div>
  </div>
  <div class="footer__mark" aria-hidden="true" data-clip><span>Krish Shah<span class="dot">.</span></span></div>
</footer>`
}

function document({ title, description, body, person, path = '', bodyClass = '' }) {
  const canonical = person.siteUrl ? `${person.siteUrl}/${path}` : null
  const ogImage = person.siteUrl ? `${person.siteUrl}/images/runofflab-storm.webp` : null
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="Krish Shah">
<meta name="theme-color" content="#0b0b0e">
<meta name="color-scheme" content="light dark">
<!-- Day from 07:00 to 19:00 in the visitor's own time zone, night otherwise,
     unless they switched it this session. Set before the stylesheet paints. -->
<script>(function(){var d=document.documentElement,t=null,h=new Date().getHours();try{t=sessionStorage.getItem('theme')}catch(e){}d.dataset.theme=t==='day'||t==='night'?t:h>=7&&h<19?'day':'night';if(d.dataset.theme==='day')document.querySelector('meta[name=theme-color]').content='#f5f2ec'})()</script>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:site_name" content="Krish Shah">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:url" content="${esc(canonical)}">` : ''}
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="styles.css">
<!-- The entrance waits for main.js to mark the page ready once fonts load;
     the timer shows everything anyway if the script never runs. -->
<script>document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('is-ready')},2000)</script>
<script src="main.js" defer></script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}${person.visitorCounter ? ` data-counter="${esc(JSON.stringify(person.visitorCounter))}"` : ''}>
${body}
</body>
</html>
`
}

// ---------------------------------------------------------------- home page

// The hero plays one entrance once the fonts are in: elements marked
// data-enter arrive in the order of their --e step (see "entrance" in
// styles.css). The name rises line by line out of its own mask.
const enter = (step, kind = '') => `data-enter${kind ? `="${kind}"` : ''} style="--e:${step}"`

function hero({ person, hero, projects }) {
  return `
<section class="hero" id="top" aria-labelledby="hero-name">
  <canvas class="hero__contours" aria-hidden="true" data-contours></canvas>
  <div class="wrap hero__inner">
    <div class="hero__strip meta" ${enter(0)}>
      <span>Portfolio — ${new Date().getFullYear()}</span>
      <span class="hero__strip-role">${esc(person.role)}, ${esc(person.school)}</span>
      <span class="hero__strip-end">${esc(person.location)}</span>
    </div>
    <h1 class="hero__name" id="hero-name">
      <span class="line"><span class="line__i" style="--e:1">${esc(person.firstName)}</span></span>
      <span class="line"><span class="line__i" style="--e:2">${esc(person.lastName)}<span class="dot" aria-hidden="true">.</span></span></span>
    </h1>
    <div class="hero__body">
      <div class="hero__copy">
        <p class="hero__headline" ${enter(3)}>${inline(hero.headline)}</p>
        <p class="hero__intro" ${enter(4)}>${esc(hero.intro)}</p>
        <div class="hero__actions" ${enter(5)}>
          <a class="btn btn--solid" href="#work"><span>Selected work</span>${arrow('down')}</a>
          ${person.profiles.map((p) => external(p.href, p.label, 'btn btn--line')).join('')}
          ${person.resume ? `<a class="btn btn--line" href="${esc(person.resume)}">Resume${arrow('right')}</a>` : ''}
        </div>
        <p class="hero__email" ${enter(6)}><span class="meta">Email</span> <a class="link" href="mailto:${esc(person.email)}">${esc(person.email)}</a></p>
      </div>
      <div class="hero__visual" ${enter(3, 'plate')}>
        <div class="hero__plate-bar meta" aria-hidden="true"><span>Fig. 01 — RunoffLab</span><span>Storm replay · SWMM 5.2</span></div>
        ${figure(hero.figure, { eager: true, sizes: '(min-width: 1100px) 56vw, 100vw', cls: 'plate--hero', parallax: true })}
      </div>
    </div>
    <nav class="index" aria-label="Selected work">
      <p class="index__label meta" ${enter(6)}>Index <span aria-hidden="true">—</span> ${pad(projects.length)} projects</p>
      <ol>${projects
        .map(
          (p, i) => `
        <li class="${theme(p)}" ${enter(7 + i)}><a class="index__card" href="#${p.slug}">
          <span class="index__thumb" aria-hidden="true"><span style="background-image:url('${esc(p.gallery[0].src)}')"></span></span>
          <span class="index__num meta">${pad(i + 1)}</span>
          <span class="index__title">${esc(p.title)}</span>
          <span class="index__kind meta">${esc(p.kind)}</span>
          ${arrow('right')}
        </a></li>`,
        )
        .join('')}
      </ol>
    </nav>
  </div>
</section>`
}

const sectionHead = (num, label, titleHtml, id) => `
  <header class="section-head" data-reveal>
    <p class="section-head__label meta"><b>§ ${pad(num)}</b> ${esc(label)}</p>
    <h2 class="section-head__title" id="${id}" data-split>${titleHtml}</h2>
  </header>`

const stackList = (stack) => `<ul class="stack" aria-label="Technologies">${stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`

const awardLine = (p) =>
  p.award ? `<p class="award"><span class="award__place">${esc(p.award.place)}</span><span class="award__event">${esc(p.award.event)}</span></p>` : ''

const projectLinks = (p) => `
  <div class="project__links">
    <a class="link-arrow link-arrow--strong" href="${p.slug}.html">Read the ${esc(p.title)} case study${arrow('right')}</a>
    ${p.links.map((l) => external(l.href, l.label)).join('')}
    ${p.linkNote ? `<span class="project__note meta">${esc(p.linkNote)}</span>` : ''}
  </div>`

const figuresRow = (p, cls = '') => `
  <div class="figures-block" data-reveal>
  <dl class="figures ${cls}">${p.figures
    .map((f) => `<div><dt class="figures__value">${esc(f.value)}<span>${esc(f.unit)}</span></dt><dd>${esc(f.label)}</dd></div>`)
    .join('')}</dl>
  ${p.figuresNote ? `<p class="figures__note">${esc(p.figuresNote)}</p>` : ''}
  </div>`

function projectFeature(p, i, total) {
  const [main, ...rest] = [p.gallery[1], p.gallery[0], p.gallery[2]]
  return `
<article class="project project--feature ${theme(p)}" id="${p.slug}" aria-labelledby="${p.slug}-title">
  <header class="project__head">
    <p class="project__meta meta" data-reveal><span class="project__num">${pad(i + 1)} / ${pad(total)}</span><span>Featured</span><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></p>
    <h3 class="project__title project__title--xl" id="${p.slug}-title" ${vtName(p)} data-reveal><a href="${p.slug}.html">${esc(p.title)}</a></h3>
    <p class="project__summary" data-reveal style="--d:1">${inline(p.summary)}</p>
  </header>
  <div class="stage mosaic">
    <div class="mosaic__main" data-reveal="plate">${figure(main, { label: 'Fig. 02', sizes: '(min-width: 1100px) 62vw, 100vw' })}</div>
    ${rest.map((g, k) => `<div class="mosaic__side" data-reveal="plate" style="--d:${k + 1}">${figure(g, { label: `Fig. 0${3 + k}`, sizes: '(min-width: 1100px) 30vw, 100vw' })}</div>`).join('')}
  </div>
  ${figuresRow(p)}
  <div class="project__spread">
    <section class="project__col" data-reveal aria-labelledby="${p.slug}-problem">
      <h4 class="col-label meta" id="${p.slug}-problem">The problem</h4>
      <p class="project__problem">${esc(p.problem)}</p>
    </section>
    <section class="project__col" data-reveal style="--d:1" aria-labelledby="${p.slug}-does">
      <h4 class="col-label meta" id="${p.slug}-does">What it does</h4>
      <ol class="feature-list feature-list--numbered" data-stagger>${p.features
        .map(([t, d], k) => `<li><span class="meta">${pad(k + 1)}</span><div><strong>${esc(t)}</strong><p>${esc(d)}</p></div></li>`)
        .join('')}</ol>
    </section>
  </div>
  <footer class="project__foot" data-reveal>
    ${stackList(p.stack)}
    ${projectLinks(p)}
  </footer>
</article>`
}

function gateDiagram() {
  // Mirrors MEDIQ's documented flow: inputs can navigate or draft; only the
  // confirmation dialog writes to the (synthetic) record.
  return `
  <figure class="gate" data-reveal>
    <ol class="gate__flow" data-stagger>
      <li class="gate__step"><span class="meta">Input</span><b>Verified voice</b><small>speaker check, then rule-based router</small></li>
      <li class="gate__step"><span class="meta">Input</span><b>Hand gestures</b><small>MediaPipe, on-device</small></li>
      <li class="gate__step"><span class="meta">Input</span><b>AI + local rules</b><small>SOAP draft and safety audit</small></li>
      <li class="gate__step gate__step--wide"><span class="meta">Can do</span><b>Navigate · open reports · prepare a draft</b><small>nothing is written yet</small></li>
      <li class="gate__step gate__step--gate"><span class="meta">Human step</span><b>Clinician reviews the exact text</b><small>review tick required, Cancel always available</small></li>
      <li class="gate__step gate__step--end"><span class="meta">Then</span><b>Saved to the synthetic record</b><small>with its source and warnings</small></li>
    </ol>
    <figcaption class="meta">Fig. 08 — What each part of MEDIQ is allowed to do</figcaption>
  </figure>`
}

function projectDark(p, i, total) {
  const [lead, second, third] = p.gallery
  return `
<article class="band band--night ${theme(p)}" id="${p.slug}" aria-labelledby="${p.slug}-title">
  <div class="wrap project project--dark">
    <div class="project__text">
      <header class="project__head">
        <p class="project__meta meta" data-reveal><span class="project__num">${pad(i + 1)} / ${pad(total)}</span><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></p>
        <h3 class="project__title project__title--lg" id="${p.slug}-title" ${vtName(p)} data-reveal><a href="${p.slug}.html">${esc(p.title)}</a></h3>
        <p class="project__summary" data-reveal style="--d:1">${inline(p.summary)}</p>
        <div class="project__credits" data-reveal style="--d:2">
          ${awardLine(p)}
          ${p.context ? `<p class="project__context">${esc(p.context)}</p>` : ''}
        </div>
      </header>
      <ol class="feature-list feature-list--numbered" data-stagger>${p.features
        .map(([t, d], k) => `<li><span class="meta">${pad(k + 1)}</span><div><strong>${esc(t)}</strong><p>${esc(d)}</p></div></li>`)
        .join('')}</ol>
    </div>
    <div class="project__visual">
      <div data-reveal="plate">${figure(lead, { label: 'Fig. 05', sizes: '(min-width: 1100px) 56vw, 100vw', cls: 'plate--lead', parallax: true })}</div>
      <div class="duo">
        <div data-reveal="plate" style="--d:1">${figure(second, { label: 'Fig. 06', sizes: '(min-width: 1100px) 28vw, 100vw' })}</div>
        ${third ? `<div data-reveal="plate" style="--d:2">${figure(third, { label: 'Fig. 07', sizes: '(min-width: 1100px) 28vw, 100vw' })}</div>` : ''}
      </div>
      <blockquote class="pull" data-reveal>
        <p>“${esc(p.quote)}”</p>
        <footer class="meta">— ${esc(p.quoteSource)}</footer>
      </blockquote>
    </div>
    ${gateDiagram()}
    <footer class="project__foot project__foot--dark" data-reveal>
      ${figuresRow(p, 'figures--compact')}
      ${stackList(p.stack)}
      ${projectLinks(p)}
    </footer>
  </div>
</article>`
}

function projectBrief(p, i, total) {
  return `
<article class="project project--brief wrap ${theme(p)}" id="${p.slug}" aria-labelledby="${p.slug}-title">
  <div class="stage brief__visual"><div data-reveal="plate">${figure(p.gallery[0], { label: 'Fig. 09', sizes: '(min-width: 1100px) 40vw, 100vw' })}</div></div>
  <div class="brief__text" data-reveal>
    <p class="project__meta meta"><span class="project__num">${pad(i + 1)} / ${pad(total)}</span><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></p>
    <h3 class="project__title project__title--md" id="${p.slug}-title" ${vtName(p)}><a href="${p.slug}.html">${esc(p.title)}</a></h3>
    <p class="project__summary project__summary--sm">${inline(p.summary)}</p>
    <ol class="feature-list feature-list--inline" data-stagger>${p.features.map(([t, d]) => `<li><strong>${esc(t)}.</strong> ${esc(d)}</li>`).join('')}</ol>
    ${stackList(p.stack)}
    ${projectLinks(p)}
  </div>
</article>`
}

const layouts = { feature: projectFeature, dark: projectDark, brief: projectBrief }

function work(projects) {
  return `
<section class="section section--work" id="work" aria-labelledby="work-title">
  <div class="wrap">${sectionHead(1, 'Selected work', 'Projects, with the reasoning <em>left in.</em>', 'work-title')}</div>
  <div class="work-list">
    ${projects
      .map((p, i) => {
        const render = layouts[p.layout] ?? projectBrief
        const html = render(p, i, projects.length)
        return p.layout === 'feature' ? `<div class="wrap">${html}</div>` : html
      })
      .join('')}
  </div>
</section>`
}

function aboutSection({ about, person, education }) {
  return `
<section class="section section--about band band--sand" id="about" aria-labelledby="about-title">
  <div class="wrap">
    ${sectionHead(2, 'About', inline(about.title), 'about-title')}
    <div class="about">
      <div class="about__body" data-reveal>
        ${about.paragraphs.map((t, k) => `<p${k === 0 ? ' class="about__lede"' : ''}>${esc(t)}</p>`).join('')}
      </div>
      <aside class="card about__card" data-reveal style="--d:1" aria-label="At a glance">
        <p class="card__label meta">At a glance</p>
        <dl>
          <div><dt class="meta">Studying</dt><dd>${esc(education.degree)}, ${esc(education.school)}</dd></div>
          <div><dt class="meta">Graduating</dt><dd>${esc(education.dates)}</dd></div>
          <div><dt class="meta">Honours</dt><dd>${esc(education.honours)}</dd></div>
          <div><dt class="meta">Based in</dt><dd>${esc(person.location)}</dd></div>
          <div><dt class="meta">Drawn to</dt><dd>Simulation, interfaces people can trust, and software that shows its working</dd></div>
        </dl>
      </aside>
    </div>
    <ol class="principles">${about.principles
      .map(
        (pr, k) => `<li data-reveal style="--d:${k}"><span class="principles__num">${['i', 'ii', 'iii'][k] ?? k + 1}.</span><h3>${esc(pr.title)}</h3><p>${esc(pr.body)}</p></li>`,
      )
      .join('')}</ol>
  </div>
</section>`
}

function skillsSection(skills, projects) {
  const titles = Object.fromEntries(projects.map((p) => [p.slug, p.title]))
  const where = (refs) =>
    refs
      .map((r) => (r === 'course' ? '<span>Coursework</span>' : `<a href="${r}.html">${esc(titles[r] ?? r)}</a>`))
      .join('<span aria-hidden="true">, </span>')
  return `
<section class="section" id="skills" aria-labelledby="skills-title">
  <div class="wrap">
    ${sectionHead(3, 'Skills', 'What I’ve used, <em>and where.</em>', 'skills-title')}
    <div class="skills">
      ${skills
        .map(
          (g, k) => `
      <section class="skills__row" data-reveal style="--d:${k % 3}" aria-labelledby="skills-${k}">
        <h3 class="skills__group meta" id="skills-${k}"><span>${pad(k + 1)}</span>${esc(g.group)}</h3>
        <ul class="skills__items" data-stagger>${g.items
          .map(([name, refs]) => `<li><span class="skills__name">${esc(name)}</span><span class="skills__where meta"><span class="visually-hidden">used in </span>${where(refs)}</span></li>`)
          .join('')}</ul>
      </section>`,
        )
        .join('')}
    </div>
    <p class="skills__note meta">Each entry names where I used it. No ratings, no logos.</p>
  </div>
</section>`
}

function educationSection(education, record, projects) {
  return `
<section class="section" id="education" aria-labelledby="education-title">
  <div class="wrap">
    ${sectionHead(4, 'Education & record', 'Where I study, <em>and what I’ve built so far.</em>', 'education-title')}
    <div class="edu" data-reveal>
      <div class="edu__school">
        <p class="meta">${esc(education.dates)}</p>
        <h3>${esc(education.school)}</h3>
        <p class="edu__degree">${esc(education.degree)}</p>
        <p class="edu__honours"><span class="tag">Honours</span> ${esc(education.honours)}</p>
      </div>
    </div>
    <ol class="record">${record
      .map(
        (r) => `
      <li class="record__row ${theme(projects.find((p) => p.slug === r.project) ?? {})}" data-reveal>
        <span class="record__year meta">${esc(r.year)}</span>
        <a class="record__title" href="${r.project}.html">${esc(r.title)}${arrow('right')}</a>
        <span class="record__detail">${esc(r.detail)}</span>
        <span class="record__tag meta">${esc(r.tag)}</span>
      </li>`,
      )
      .join('')}
    </ol>
  </div>
</section>`
}

// The visitor log: the unique-visitor count on split-flap tiles. Hidden until
// main.js has a number from the counter, so it never shows empty.
function visitorsSection(person) {
  if (!person.visitorCounter) return ''
  return `
<section class="section visitors" id="visitors" aria-labelledby="visitors-title" data-visits hidden>
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="section-head__label meta"><b>§ ✦</b> Visitor log</p>
      <h2 class="section-head__title" id="visitors-title" data-split>People who’ve <em>stopped by.</em></h2>
    </header>
    <div class="visitors__board" data-reveal>
      <p class="flaps" data-flaps></p>
      <div class="visitors__side">
        <p class="visitors__live meta"><span class="live-dot" aria-hidden="true"></span>Live count · unique visitors</p>
        <p class="visitors__you" data-visits-you></p>
        <p class="visitors__note">Each browser is counted once, however many times it comes back.</p>
      </div>
    </div>
  </div>
</section>`
}

function contactSection(contact, person) {
  const [user, domain] = person.email.split('@')
  return `
<section class="section section--contact band band--ink" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <p class="section-head__label meta" data-reveal><b>§ 05</b> Contact</p>
    <div class="contact">
      <h2 class="contact__title" id="contact-title" data-reveal data-split>${inline(contact.title)}</h2>
      <div class="contact__side" data-reveal style="--d:1">
        <p>${esc(contact.lede)}</p>
        <a class="contact__email" href="mailto:${esc(person.email)}">${esc(user)}<wbr>@${esc(domain)}</a>
        <div class="contact__actions">
          <button class="btn btn--light" type="button" data-copy="${esc(person.email)}">Copy address</button>
          <span class="visually-hidden" role="status" aria-live="polite" data-copy-status></span>
        </div>
        <ul class="contact__rows">
          ${person.profiles
            .map(
              (p) => `<li><a href="${esc(p.href)}" target="_blank" rel="noopener noreferrer"><span>${esc(p.label)}</span><span class="meta">${esc(p.display)}</span>${arrow('out')}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`,
            )
            .join('')}
          ${person.resume ? `<li><a href="${esc(person.resume)}"><span>Resume</span><span class="meta">PDF</span>${arrow('right')}</a></li>` : ''}
        </ul>
      </div>
      ${contact.form ? contactForm(person) : ''}
    </div>
  </div>
</section>`
}

// The contact form. Works without JavaScript as a plain POST to FormSubmit;
// main.js checks the fields (including whether the email's domain can
// receive mail) and sends it in place instead.
function contactForm(person) {
  const field = (id, label, input) => `
        <div class="field">
          <label class="field__label meta" for="cf-${id}">${label}</label>
          ${input}
          <p class="field__msg" id="cf-${id}-msg"></p>
        </div>`
  return `
      <form class="cform" action="https://formsubmit.co/${esc(person.email)}" method="POST" novalidate data-cform="${esc(person.email)}" data-reveal aria-labelledby="cform-title">
        <p class="cform__title meta" id="cform-title">Send a message</p>
        <div class="cform__row">${field('name', 'Your name', '<input id="cf-name" name="name" type="text" autocomplete="name" required maxlength="100" aria-describedby="cf-name-msg">')}${field(
          'email',
          'Your email',
          '<input id="cf-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required maxlength="254" aria-describedby="cf-email-msg">',
        )}
        </div>${field('message', 'Message', '<textarea id="cf-message" name="message" rows="5" required minlength="10" maxlength="5000" aria-describedby="cf-message-msg"></textarea>')}
        <input type="hidden" name="_subject" value="New message from krishshahdev.tech">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <div class="cform__trap" aria-hidden="true"><label>Leave this empty <input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>
        <div class="cform__foot">
          <button class="btn btn--light cform__send" type="submit">Send message${arrow('right')}</button>
          <p class="cform__status" role="status" aria-live="polite"></p>
        </div>
      </form>`
}

export function renderHome(site) {
  const { person, projects } = site
  const body = `
${header({ home: true })}
<main id="main" tabindex="-1" data-tour-end="${projects.length}">
${hero(site)}
${work(projects)}
${aboutSection(site)}
${skillsSection(site.skills, projects)}
${educationSection(site.education, site.record, projects)}
${visitorsSection(person)}
${contactSection(site.contact, person)}
</main>
${footer(person)}`
  return document({
    title: 'Krish Shah — Computer Science, University of Guelph',
    description:
      'Portfolio of Krish Shah, a Computer Science student at the University of Guelph. Selected work: RunoffLab, a stormwater design tool built on EPA SWMM, and MEDIQ, a hands-free clinical assistant prototype.',
    body,
    person,
  })
}

// ---------------------------------------------------------- case-study pages

export function renderProject(site, p) {
  const { person, projects } = site
  const index = projects.indexOf(p)
  const next = projects[index + 1]
  // Screens not used as the lead image sit beside the sections they show;
  // any left over go in the gallery at the end.
  const screens = p.lead ? [...p.gallery] : p.gallery.slice(1)
  let fig = 1
  const inlineFigure = () => {
    const g = screens.shift()
    return g ? `<div class="case__figure" data-reveal="plate">${figure(g, { label: `Fig. ${pad(++fig)}`, sizes: '(min-width: 1100px) 66vw, 100vw' })}</div>` : ''
  }
  const sections = []
  const section = (id, label, html) => sections.push({ id, label, html })
  section('problem', 'The problem', `<p class="case__lede">${esc(p.problem)}</p>`)
  if (p.role) section('role', 'My role', `<p>${esc(p.role)}</p>`)
  if (p.approach)
    section(
      'how',
      'How it works',
      `<ol class="flow" data-stagger>${p.approach.steps
        .map(([t, d], k) => `<li><span class="meta">${pad(k + 1)}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`)
        .join('')}</ol>
      <p>${esc(p.approach.text)}</p>`,
    )
  section(
    'does',
    'What it does',
    `<ol class="feature-list feature-list--numbered" data-stagger>${p.features
      .map(([t, d], k) => `<li><span class="meta">${pad(k + 1)}</span><div><strong>${esc(t)}</strong><p>${esc(d)}</p></div></li>`)
      .join('')}</ol>`,
  )
  if (p.decisions)
    section(
      'decisions',
      'Decisions worth noting',
      `<ul class="decision-list" data-stagger>${p.decisions.map(([t, d]) => `<li><strong>${esc(t)}</strong> ${esc(d)}</li>`).join('')}</ul>`,
    )
  if (p.figures) section('numbers', 'In numbers', figuresRow(p, 'figures--compact'))
  if (p.limits) section('limits', 'Limits, stated plainly', `<p>${esc(p.limits)}</p>`)
  section('stack', 'Built with', stackList(p.stack))
  // Pictures follow these sections, where they illustrate the text.
  const after = new Set(['does', 'decisions', 'numbers'])

  const body = `
${header({ home: false })}
<main id="main" tabindex="-1" class="case">
  <div class="wrap">
    <nav class="crumbs meta" aria-label="Breadcrumb"><a href="index.html">${arrow('left')}Home</a><span aria-hidden="true">/</span><a href="index.html#work">Selected work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav>
    <header class="case__head">
      <p class="project__meta meta" data-reveal><span class="project__num" data-tour-num>Case study ${pad(index + 1)} / ${pad(projects.length)}</span><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></p>
      <h1 class="case__title" ${vtName(p)}>${esc(p.title)}<span class="dot" aria-hidden="true">.</span></h1>
      <p class="case__summary" data-reveal style="--d:1">${inline(p.summary)}</p>
      ${p.award ? `<div data-reveal style="--d:2">${awardLine(p)}</div>` : ''}
    </header>
    <dl class="case__facts" data-reveal data-stagger style="--d:2">
      <div><dt class="meta">Year</dt><dd>${esc(p.year)}</dd></div>
      <div><dt class="meta">Type</dt><dd>${esc(p.kind)}</dd></div>
      ${p.context ? `<div><dt class="meta">Context</dt><dd>${esc(p.context)}</dd></div>` : ''}
      <div><dt class="meta">Links</dt><dd class="case__links">${
        p.links.map((l) => external(l.href, l.label)).join('') || `<span class="muted">${esc(p.linkNote ?? 'None yet')}</span>`
      }</dd></div>
    </dl>
    <div data-reveal="plate" style="--d:3">${figure(p.lead ?? p.gallery[0], { label: 'Fig. 01', eager: true, sizes: '100vw', cls: 'case__lead', parallax: true })}</div>
    <nav class="case__toc meta" aria-label="On this page"><ol>${sections
      .map((x, k) => `<li><a href="#c-${x.id}"><span>${pad(k + 1)}</span>${esc(x.label)}</a></li>`)
      .join('')}</ol></nav>
    <div class="case__body">
      ${sections
        .map(
          (x, k) => `
      <section class="case__section" data-reveal aria-labelledby="c-${x.id}">
        <h2 class="case__label" id="c-${x.id}"><span class="meta">${pad(k + 1)}</span>${esc(x.label)}</h2>
        <div class="case__content">${x.html}</div>
      </section>${after.has(x.id) ? inlineFigure() : ''}`,
        )
        .join('')}
    </div>
    ${
      screens.length
        ? `<section class="case__gallery" data-reveal="plate" aria-label="More screens">${screens
            .map((g) => figure(g, { label: `Fig. ${pad(++fig)}`, sizes: '(min-width: 900px) 50vw, 100vw' }))
            .join('')}</section>`
        : ''
    }
    <nav class="case__end" aria-label="Keep reading" data-tour="${esc(JSON.stringify({ slug: p.slug, projects: projects.map(({ slug, title, kind }) => ({ slug, title, kind })) }))}">
      ${
        next
          ? `<a class="next" href="${next.slug}.html">
        <span class="meta">Next project — ${pad(index + 2)} / ${pad(projects.length)}</span>
        <span class="next__title">${esc(next.title)}${arrow('right')}</span>
        <span class="next__kind meta">${esc(next.kind)}</span>
      </a>`
          : `<a class="next" href="index.html">
        <span class="meta">That’s all ${projects.length} projects</span>
        <span class="next__title">Back to home${arrow('right')}</span>
        <span class="next__kind meta">About, skills, education and contact</span>
      </a>`
      }
      <div class="case__exits">
        <a class="btn btn--line" href="index.html#work">All projects</a>
        <a class="btn btn--line" href="index.html#contact">Contact</a>
      </div>
    </nav>
  </div>
</main>
${footer(person)}`
  return document({
    title: `${p.title} — Krish Shah`,
    description: plain(p.summary),
    body,
    person,
    path: `${p.slug}.html`,
    bodyClass: theme(p),
  })
}
