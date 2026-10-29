// Progressive enhancement only: the pages are complete without this file.
;(() => {
  const masthead = document.querySelector('[data-masthead]')
  const toggle = document.querySelector('[data-menu-toggle]')
  const menu = document.querySelector('[data-menu]')

  // Case studies are numbered in the order this visitor reads them, and each
  // one leads to a project they haven't seen yet. Home is offered only once
  // all of them have been read. Without storage the fixed order stands.
  const pad = (n) => String(n).padStart(2, '0')
  const readTrail = () => {
    try {
      return JSON.parse(sessionStorage.getItem('tour')) ?? []
    } catch {
      return null
    }
  }
  const tourEl = document.querySelector('[data-tour]')
  const trail = readTrail()
  if (tourEl && trail) {
    const { slug, projects } = JSON.parse(tourEl.dataset.tour)
    const known = trail.filter((s) => projects.some((p) => p.slug === s))
    if (!known.includes(slug)) known.push(slug)
    try {
      sessionStorage.setItem('tour', JSON.stringify(known))
    } catch {}
    const total = pad(projects.length)
    const num = document.querySelector('[data-tour-num]')
    if (num) num.textContent = `Case study ${pad(known.indexOf(slug) + 1)} / ${total}`
    // The next unread project, counting on from this one in the site's order.
    const at = projects.findIndex((p) => p.slug === slug)
    const next = [...projects.slice(at + 1), ...projects.slice(0, at)].find((p) => !known.includes(p.slug))
    const card = tourEl.querySelector('.next')
    const svg = card?.querySelector('.next__title svg')?.outerHTML ?? ''
    if (card) {
      const [label, title, kind] = card.children
      card.href = next ? `${next.slug}.html` : 'index.html'
      label.textContent = next ? `Next project — ${pad(known.length + 1)} / ${total}` : `That’s all ${projects.length} projects`
      title.innerHTML = svg
      title.prepend(next ? next.title : 'Back to home')
      kind.textContent = next ? next.kind : 'About, skills, education and contact'
    }
  }
  // Back on the home page after reading everything, the next tour starts fresh.
  const tourEnd = Number(document.querySelector('[data-tour-end]')?.dataset.tourEnd)
  if (tourEnd && readTrail()?.length >= tourEnd) {
    try {
      sessionStorage.removeItem('tour')
    } catch {}
  }

  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  // Small and touch screens skip the costlier effects (see styles.css).
  const light = window.matchMedia('(max-width: 860px), (pointer: coarse)').matches

  // Day and night. The page head picks the mode from the visitor's clock
  // (day 07:00–19:00) before anything paints; here the switch shows their
  // local time, follows the clock while the page stays open, and lets them
  // flip it for the rest of the session. Switching back to what the clock
  // says hands control back to the clock.
  const root = document.documentElement
  const themeMeta = document.querySelector('meta[name="theme-color"]')
  const dayNight = document.querySelector('[data-daynight]')
  const dayNightTime = document.querySelector('[data-daynight-time]')
  const byClock = () => {
    const h = new Date().getHours()
    return h >= 7 && h < 19 ? 'day' : 'night'
  }
  const chosenTheme = () => {
    try {
      const t = sessionStorage.getItem('theme')
      return t === 'day' || t === 'night' ? t : null
    } catch {
      return null
    }
  }
  const applyTheme = (t) => {
    if (root.dataset.theme === t) return
    root.dataset.theme = t
    if (themeMeta) themeMeta.content = t === 'day' ? '#f5f2ec' : '#0b0b0e'
    window.dispatchEvent(new Event('themechange'))
  }
  const clock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
  const tickTheme = () => {
    if (!chosenTheme()) applyTheme(byClock())
    if (dayNightTime) dayNightTime.textContent = clock.format(new Date())
    const other = root.dataset.theme === 'day' ? 'night' : 'day'
    dayNight?.setAttribute('aria-label', `Switch to ${other} mode`)
    dayNight?.setAttribute('title', `${root.dataset.theme === 'day' ? 'Day' : 'Night'} mode, from your local time. Click for ${other}.`)
  }
  tickTheme()
  setInterval(tickTheme, 30000)
  dayNight?.addEventListener('click', () => {
    const next = root.dataset.theme === 'day' ? 'night' : 'day'
    try {
      if (next === byClock()) sessionStorage.removeItem('theme')
      else sessionStorage.setItem('theme', next)
    } catch {}
    dayNight.classList.remove('is-spun')
    void dayNight.offsetWidth
    dayNight.classList.add('is-spun')
    const swap = () => (applyTheme(next), tickTheme())
    if (!motion || !document.startViewTransition) return swap()
    const r = dayNight.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    root.style.setProperty('--vx', `${x}px`)
    root.style.setProperty('--vy', `${y}px`)
    root.style.setProperty('--vr', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`)
    root.classList.add('theme-swap')
    document.startViewTransition(swap).finished.finally(() => root.classList.remove('theme-swap'))
  })

  // Digits that roll into place like an odometer. The number itself is
  // also written out once, hidden, for assistive technology.
  const odometer = (el, n, minDigits = 1) => {
    const digits = String(n).padStart(minDigits, '0').split('')
    el.textContent = ''
    const said = document.createElement('span')
    said.className = 'visually-hidden'
    said.textContent = n.toLocaleString()
    el.append(said)
    const reels = digits.map((d, i) => {
      const col = document.createElement('span')
      col.className = 'odo'
      col.setAttribute('aria-hidden', 'true')
      const reel = document.createElement('span')
      reel.style.setProperty('--i', i)
      reel.innerHTML = '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>'
      col.append(reel)
      el.append(col)
      return reel
    })
    requestAnimationFrame(() => requestAnimationFrame(() => reels.forEach((reel, i) => reel.style.setProperty('--n', digits[i]))))
  }

  // Split-flap tiles: at least six digits, like a departures board, with the
  // leading zeros dimmed. Each digit shuffles through random digits, then
  // they settle one after another, left to right.
  const flaps = (el, n) => {
    const text = String(n).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const lead = text.search(/[1-9]/)
    el.textContent = ''
    el.setAttribute('aria-label', `${n.toLocaleString('en-CA')} unique visitors`)
    const tiles = [...text].map((ch, i) => {
      const tile = document.createElement('span')
      tile.setAttribute('aria-hidden', 'true')
      const d = document.createElement('span')
      d.className = 'flap__d'
      d.textContent = ch
      tile.append(d)
      tile.className = /\d/.test(ch) ? `flap${i < lead ? ' flap--lead' : ''}` : 'flap flap--sep'
      el.append(tile)
      return { tile, d, ch }
    })
    if (!motion) return
    const digits = tiles.filter((t) => !t.tile.classList.contains('flap--sep'))
    digits.forEach((t) => (t.d.textContent = '0'))
    const run = () => {
      const start = performance.now()
      const step = (now) => {
        let busy = false
        digits.forEach((t, i) => {
          if (t.done) return
          const settle = 700 + i * 220
          const next = now - start >= settle ? t.ch : String(Math.floor(Math.random() * 10))
          if (next === t.ch && now - start >= settle) t.done = true
          else busy = true
          if (t.d.textContent !== next || t.done) {
            t.d.textContent = next
            t.tile.classList.remove('is-flip')
            void t.tile.offsetWidth
            t.tile.classList.add('is-flip')
          }
        })
        if (busy) setTimeout(() => requestAnimationFrame(step), 60)
      }
      requestAnimationFrame(step)
    }
    if (!('IntersectionObserver' in window)) return run()
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (io.disconnect(), run()), { threshold: 0.5 })
    io.observe(el)
  }

  // Unique visitors, kept by the Abacus counting API. A browser is counted
  // the first time it visits and remembers its number, so coming back (or
  // reloading) only reads the total. Without storage there is no telling a
  // return visit from a new one, so those visits only read. Local testing
  // counts against a separate -dev counter. If the API is unreachable,
  // nothing about the counter shows.
  //
  // The count appears three ways: the visitor log on the home page (split-
  // flap tiles), a live badge in the corner of every page, and, once, a
  // welcome card with the visitor's own number.
  const counter = document.body.dataset.counter
  if (counter && window.fetch) {
    const { namespace, key: baseKey } = JSON.parse(counter)
    const local = location.protocol === 'file:' || /^(localhost|127\.|\[::1\])/.test(location.hostname)
    const key = local ? `${baseKey}-dev` : baseKey
    const remembered = `visitor:${namespace}/${key}`
    let mine = null
    let storage = true
    try {
      mine = Number(localStorage.getItem(remembered)) || null
    } catch {
      storage = false
    }
    const first = storage && !mine
    fetch(`https://abacus.jasoncameron.dev/${first ? 'hit' : 'get'}/${namespace}/${key}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(({ value }) => {
        if (!(value > 0)) return
        if (first) {
          mine = value
          try {
            localStorage.setItem(remembered, String(value))
          } catch {}
        }
        const log = document.querySelector('[data-visits]')
        if (log) {
          log.hidden = false
          flaps(log.querySelector('[data-flaps]'), value)
          const you = log.querySelector('[data-visits-you]')
          if (you && mine) you.innerHTML = `You’re visitor <strong>#${mine.toLocaleString('en-CA')}</strong>.`
        }
        badge(value, mine, log ? '#visitors' : 'index.html#visitors', first ? 9800 : 1200)
        if (first) welcome(value)
      })
      .catch(() => {})
  }
  // A first-time visitor gets a card with their number, once.
  const welcome = (n) => {
    const toast = document.createElement('div')
    toast.className = 'visit-toast'
    toast.setAttribute('role', 'status')
    toast.innerHTML =
      '<div class="visit-toast__num">#<span data-n></span></div>' +
      `<p class="visit-toast__text"><strong>You’re visitor number ${n.toLocaleString('en-CA')}.</strong><span>Thanks for stopping by. You’re counted once, however often you come back.</span></p>` +
      '<button class="visit-toast__close" type="button" aria-label="Dismiss">×</button>'
    document.body.append(toast)
    const hide = () => {
      toast.classList.remove('is-on')
      setTimeout(() => toast.remove(), 600)
    }
    toast.querySelector('button').addEventListener('click', hide)
    setTimeout(() => {
      toast.classList.add('is-on')
      odometer(toast.querySelector('[data-n]'), n)
    }, 1400)
    setTimeout(hide, 9000)
  }
  const badge = (total, mine, href, delay) => {
    const a = document.createElement('a')
    a.className = 'visit-badge'
    a.href = href
    a.innerHTML =
      '<span class="live-dot" aria-hidden="true"></span><span class="visit-badge__count" data-n></span><span>visitors</span>' +
      (mine ? `<span class="visit-badge__you">· you’re #${mine.toLocaleString('en-CA')}</span>` : '')
    document.body.append(a)
    setTimeout(() => {
      a.classList.add('is-on')
      odometer(a.querySelector('[data-n]'), total)
    }, delay)
  }
  // One scroll listener for the whole page. Everything that reacts to
  // scrolling registers here and runs at most once per frame.
  const onScrollFrame = []
  let scrollQueued = false
  const runScrollFrame = () => {
    scrollQueued = false
    for (const fn of onScrollFrame) fn()
  }
  window.addEventListener('scroll', () => !scrollQueued && ((scrollQueued = true), requestAnimationFrame(runScrollFrame)), { passive: true })

  // Masthead background once the page has scrolled; touched only on change.
  let scrolled = null
  const syncMasthead = () => {
    const now = window.scrollY > 8
    if (now !== scrolled) masthead?.setAttribute('data-scrolled', String((scrolled = now)))
  }
  syncMasthead()
  onScrollFrame.push(syncMasthead)

  // Mobile menu. Opening and closing both animate (styles.css); closing waits
  // for its short fade before the panel is hidden. aria-expanded and focus
  // change straight away so assistive technology isn't kept waiting.
  let closing = 0
  const setMenu = (open, { focusToggle = false } = {}) => {
    if (!toggle || !menu) return
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true'
    if (open === wasOpen) return
    toggle.setAttribute('aria-expanded', String(open))
    toggle.querySelector('.masthead__toggle-label').textContent = open ? 'Close' : 'Menu'
    document.body.style.overflow = open ? 'hidden' : ''
    clearTimeout(closing)
    menu.classList.remove('is-closing')
    if (open) {
      menu.hidden = false
      menu.inert = false
      menu.querySelector('a')?.focus()
      return
    }
    if (focusToggle) toggle.focus()
    if (!motion) return void (menu.hidden = true)
    menu.inert = true
    menu.classList.add('is-closing')
    closing = setTimeout(() => {
      menu.hidden = true
      menu.inert = false
      menu.classList.remove('is-closing')
    }, 300)
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'))
  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false)
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, { focusToggle: true })
  })
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => e.matches && setMenu(false))

  // Button labels roll on hover: a copy of the label waits one line below and
  // both slide up together (styles.css). The copy is hidden from assistive
  // technology. Only where there's a pointer that can hover.
  const rolls = motion && finePointer
  const labelOf = (button) => button.querySelector('.btn__text') ?? button
  const setLabel = (button, text) => {
    const roll = button.querySelector('.btn__roll')
    if (!roll) return void (button.textContent = text)
    for (const t of roll.children) t.textContent = text
  }
  if (rolls) {
    for (const button of document.querySelectorAll('.btn')) {
      const text = [...button.childNodes].find((n) => n.nodeType === 3 && n.data.trim()) ?? button.querySelector(':scope > span:not([class])')
      if (!text) continue
      const label = text.textContent.trim()
      const roll = document.createElement('span')
      roll.className = 'btn__roll'
      roll.innerHTML = '<span class="btn__text"></span><span class="btn__text" aria-hidden="true"></span>'
      for (const t of roll.children) t.textContent = label
      text.replaceWith(roll)
    }
  }

  // Copy the email address.
  for (const button of document.querySelectorAll('[data-copy]')) {
    const status = button.parentElement.querySelector('[data-copy-status]')
    const label = labelOf(button).textContent
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy)
        setLabel(button, 'Copied')
        if (status) status.textContent = 'Email address copied to the clipboard.'
      } catch {
        setLabel(button, 'Press ⌘C / Ctrl+C')
        const range = document.createRange()
        const email = button.closest('.contact__side')?.querySelector('.contact__email')
        if (email) {
          range.selectNodeContents(email)
          const sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
      setTimeout(() => {
        setLabel(button, label)
        if (status) status.textContent = ''
      }, 2400)
    })
  }

  // Headings marked data-split rise word by word. Each word gets a clipping
  // wrapper; emphasis and other markup inside the heading are kept.
  if (motion) {
    for (const heading of document.querySelectorAll('[data-split]')) {
      let n = 0
      const split = (node) => {
        for (const child of [...node.childNodes]) {
          if (child.nodeType === 1) split(child)
          if (child.nodeType !== 3) continue
          const frag = document.createDocumentFragment()
          for (const part of child.data.split(/(\s+)/)) {
            if (!part) continue
            if (/^\s+$/.test(part)) {
              frag.append(part)
              continue
            }
            const outer = document.createElement('span')
            const inner = document.createElement('span')
            outer.className = 'w'
            inner.className = 'w__i'
            inner.style.setProperty('--w', n++)
            inner.textContent = part
            outer.append(inner)
            frag.append(outer)
          }
          child.replaceWith(frag)
        }
      }
      split(heading)
    }
  }

  // Entrance reveals. Lists marked data-stagger bring their items in one after
  // another. Without IntersectionObserver everything is just shown.
  for (const list of document.querySelectorAll('[data-stagger]')) {
    ;[...list.children].forEach((child, k) => child.style.setProperty('--k', k))
  }
  const revealables = document.querySelectorAll('[data-reveal], [data-stagger]')
  if (!('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'))
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
    revealables.forEach((el) => io.observe(el))
  }

  // Count the headline figures up from zero the first time they come into view.
  const countUp = (el) => {
    const text = el.firstChild
    const match = text?.nodeType === 3 && text.data.trim().match(/^([−-]?)(\d+)$/)
    if (!match || match[2] === '0') return
    const [, sign, digits] = match
    const target = Number(digits)
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1400)
      text.data = sign + Math.round(target * (1 - Math.pow(1 - t, 4)))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  if (motion && 'IntersectionObserver' in window) {
    const counter = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.querySelectorAll('.figures__value').forEach(countUp)
          counter.unobserve(entry.target)
        }
      },
      { threshold: 0.4 },
    )
    document.querySelectorAll('.figures').forEach((el) => counter.observe(el))
  }

  // The name's letters pop: hovering one bounces it, clicking sends a wave
  // out from that letter through the rest of the name. Each letter is its
  // own span; the heading keeps the plain name for assistive technology.
  const name = document.querySelector('.hero__name')
  if (motion && name) {
    name.setAttribute('aria-label', [...name.querySelectorAll('.line__i')].map((l) => l.firstChild.textContent).join(' '))
    const letters = []
    for (const line of name.querySelectorAll('.line__i')) {
      line.setAttribute('aria-hidden', 'true')
      for (const node of [...line.childNodes]) {
        if (node.nodeType !== 3) {
          if (node.classList?.contains('dot')) letters.push(node)
          continue
        }
        const frag = document.createDocumentFragment()
        for (const ch of node.data) {
          const span = document.createElement('span')
          span.className = 'ch'
          span.textContent = ch
          frag.append(span)
          letters.push(span)
        }
        node.replaceWith(frag)
      }
    }
    const pop = (el) => {
      el.classList.remove('is-pop')
      void el.offsetWidth
      el.classList.add('is-pop')
    }
    for (const el of letters) {
      el.addEventListener('animationend', (e) => e.animationName === 'pop' && el.classList.remove('is-pop'))
      el.addEventListener('pointerenter', () => pop(el))
      el.addEventListener('click', () => {
        const at = letters.indexOf(el)
        letters.forEach((other, k) => setTimeout(() => pop(other), Math.abs(k - at) * 70))
      })
    }
    // The lines clip the entrance; once it has played, let the pops overflow.
    setTimeout(() => name.classList.add('is-live'), 2400)
  }

  // Start the hero entrance once the fonts are in, so the name doesn't swap
  // typeface mid-animation. A slow font load doesn't hold the page for long.
  const ready = () => document.documentElement.classList.add('is-ready')
  if (document.fonts?.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(ready)
  else ready()

  // Runs `frame(dt)` every animation frame while `el` is on screen and the tab
  // is visible; stops otherwise so nothing burns battery in the background.
  const whileVisible = (el, frame) => {
    let raf = 0
    let last = 0
    let seen = false
    const loop = (now) => {
      frame(Math.min(0.05, (now - (last || now)) / 1000))
      last = now
      raf = requestAnimationFrame(loop)
    }
    const sync = () => {
      const run = seen && !document.hidden
      if (run && !raf) (last = 0), (raf = requestAnimationFrame(loop))
      if (!run && raf) cancelAnimationFrame(raf), (raf = 0)
    }
    new IntersectionObserver(([entry]) => ((seen = entry.isIntersecting), sync())).observe(el)
    document.addEventListener('visibilitychange', sync)
  }

  // Contour lines behind the hero: iso-lines of a slowly drifting height
  // field, traced with marching squares. The pointer raises a soft hill the
  // lines bend around. Under reduced motion one still frame is drawn.
  const contours = document.querySelector('[data-contours]')
  if (contours && 'IntersectionObserver' in window) {
    const ctx = contours.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    let ink = css.getPropertyValue('--ink').trim() || '#14161c'
    let accent = css.getPropertyValue('--accent').trim() || '#2a45b3'
    const cell = 18
    const levels = 14
    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let field = new Float32Array(0)
    let t = 7
    const hill = { x: -1e4, y: -1e4, a: 0 }
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = contours.clientWidth
      h = contours.clientHeight
      contours.width = Math.round(w * dpr)
      contours.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / cell) + 1
      rows = Math.ceil(h / cell) + 1
      field = new Float32Array(cols * rows)
    }
    // Segments for each corner case (top-left 8, top-right 4, bottom-right 2,
    // bottom-left 1) as pairs of edges: 0 top, 1 right, 2 bottom, 3 left.
    const cases = [[], [3, 2], [2, 1], [3, 1], [0, 1], [3, 0, 2, 1], [0, 2], [3, 0], [3, 0], [0, 2], [3, 2, 0, 1], [0, 1], [3, 1], [2, 1], [3, 2], []]
    const draw = () => {
      const s = 1 / 360
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cell
          const y = r * cell
          const u = x * s
          const v = y * s
          let f = Math.sin(u * 1.3 + t * 0.9) * Math.cos(v * 1.1 - t * 0.6) + 0.6 * Math.sin(u * 0.7 - v * 1.5 + t * 0.5) + 0.35 * Math.cos(u * 2.2 + v * 0.9 - t * 0.8)
          if (hill.a > 0.001) {
            const dx = x - hill.x
            const dy = y - hill.y
            f += hill.a * Math.exp(-(dx * dx + dy * dy) / 70000)
          }
          field[r * cols + c] = f
        }
      }
      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = 1
      for (let l = 0; l < levels; l++) {
        const iso = -1.7 + (l * 3.6) / (levels - 1)
        ctx.beginPath()
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols - 1; c++) {
            const a = field[r * cols + c]
            const b = field[r * cols + c + 1]
            const d = field[(r + 1) * cols + c]
            const e = field[(r + 1) * cols + c + 1]
            const segs = cases[(a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (e > iso ? 2 : 0) | (d > iso ? 1 : 0)]
            if (!segs.length) continue
            const x = c * cell
            const y = r * cell
            const point = (edge) => {
              if (edge === 0) return [x + (cell * (iso - a)) / (b - a), y]
              if (edge === 1) return [x + cell, y + (cell * (iso - b)) / (e - b)]
              if (edge === 2) return [x + (cell * (iso - d)) / (e - d), y + cell]
              return [x, y + (cell * (iso - a)) / (d - a)]
            }
            for (let k = 0; k < segs.length; k += 2) {
              const [x1, y1] = point(segs[k])
              const [x2, y2] = point(segs[k + 1])
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
            }
          }
        }
        // Every fifth line is an index contour; one carries the accent.
        const accentLine = l === 9
        ctx.strokeStyle = accentLine ? accent : ink
        ctx.globalAlpha = accentLine ? 0.55 : l % 5 === 0 ? 0.16 : 0.08
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    resize()
    new ResizeObserver(() => (resize(), draw())).observe(contours)
    window.addEventListener('themechange', () => {
      ink = css.getPropertyValue('--ink').trim() || ink
      accent = css.getPropertyValue('--accent').trim() || accent
      draw()
    })
    draw()
    contours.classList.add('is-on')
    // Small and touch screens keep the still frame: the drift is too slow to
    // be worth a canvas redraw on every frame there.
    if (motion && !light) {
      const target = { x: -1e4, y: -1e4, a: 0 }
      if (finePointer) {
        const hero = contours.parentElement
        hero.addEventListener('pointermove', (e) => {
          const r = contours.getBoundingClientRect()
          if (hill.a < 0.01) (hill.x = e.clientX - r.left), (hill.y = e.clientY - r.top)
          Object.assign(target, { x: e.clientX - r.left, y: e.clientY - r.top, a: 0.55 })
        })
        hero.addEventListener('pointerleave', () => (target.a = 0))
      }
      // One loop. While the pointer is shaping the lines they redraw every
      // frame so they follow it fluidly; the slow drift on its own only needs
      // about 30 frames a second.
      let acc = 0
      whileVisible(contours, (dt) => {
        const k = 1 - Math.pow(0.002, dt)
        const dx = (target.x - hill.x) * k
        const dy = (target.y - hill.y) * k
        const da = (target.a - hill.a) * (1 - Math.pow(0.05, dt))
        hill.x += dx
        hill.y += dy
        hill.a += da
        t += dt * 0.05
        acc += dt
        const shaping = hill.a > 0.01 && (Math.abs(dx) + Math.abs(dy) > 0.2 || Math.abs(da) > 0.001)
        if (!shaping && acc < 1 / 30) return
        acc = 0
        draw()
      })
    }
  }

  // Scroll parallax: the largest screenshots drift a few percent inside their
  // frames (styles.css gives them room). Only frames near the viewport move.
  // Not on small or touch screens.
  const drifting = [...document.querySelectorAll('[data-parallax]')]
  if (motion && !light && drifting.length) {
    const update = () => {
      const vh = window.innerHeight
      for (const el of drifting) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -100 || r.top > vh + 100) continue
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)))
        el.style.setProperty('--py', (p * -1.2).toFixed(3))
      }
    }
    onScrollFrame.push(update)
    window.addEventListener('resize', update)
    update()
  }

  // Cursor: a dot that sits exactly on the pointer and a ring that follows it
  // on a short spring, stretching a little in the direction of travel. The
  // ring opens over links, carries a word over the larger targets, and the
  // dot becomes a text bar over text you can select. Desktop pointers only,
  // and not under reduced motion; everyone else keeps the system cursor. It
  // follows the pointer type, not the window size, so a mouse in a narrow
  // window still gets it.
  if (motion && finePointer) {
    const cursor = document.createElement('div')
    cursor.className = 'cursor'
    cursor.setAttribute('aria-hidden', 'true')
    cursor.setAttribute('data-clip', '')
    cursor.innerHTML = '<canvas class="cursor__trail"></canvas><div class="cursor__glow"><div class="cursor__glow-i"></div></div><div class="cursor__ring"><div class="cursor__ring-i"><span class="cursor__label"></span></div></div><div class="cursor__dot"><div class="cursor__dot-i"></div></div>'
    document.body.append(cursor)
    document.documentElement.classList.add('has-cursor')
    const [trailCanvas, glow, ring, dot] = cursor.children
    const label = cursor.querySelector('.cursor__label')
    const labels = [
      ['.index__card', 'View'],
      ['.project__title a, .record__title, .link-arrow--strong', 'Read'],
      ['.next', 'Next'],
      ['.contact__email', 'Write'],
    ]
    const pointer = { x: -100, y: -100 }
    const follow = { x: -100, y: -100 }
    const light = { x: -100, y: -100 }
    let shown = false
    let labelled = false
    let raf = 0
    let last = 0
    const loop = (now) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      // Critically damped follow, time constant ~70 ms, frame-rate independent.
      const k = 1 - Math.exp(-dt / 0.07)
      const dx = pointer.x - follow.x
      const dy = pointer.y - follow.y
      follow.x += dx * k
      follow.y += dy * k
      // The glow lags further behind (~260 ms), so it trails the ring.
      const kl = 1 - Math.exp(-dt / 0.26)
      light.x += (pointer.x - light.x) * kl
      light.y += (pointer.y - light.y) * kl
      glow.style.transform = `translate3d(${light.x.toFixed(1)}px, ${light.y.toFixed(1)}px, 0)`
      // Stretch along the motion, up to 14%, none while showing a label.
      const speed = Math.hypot(dx, dy)
      const s = labelled ? 0 : Math.min(0.14, speed / 900)
      // No rotation while a label shows, so the word stays level.
      const angle = labelled ? 0 : Math.atan2(dy, dx)
      ring.style.transform = `translate3d(${follow.x.toFixed(2)}px, ${follow.y.toFixed(2)}px, 0) rotate(${angle.toFixed(3)}rad) scale(${(1 + s).toFixed(3)}, ${(1 - s * 0.6).toFixed(3)})`
      if (speed > 0.1 || Math.hypot(pointer.x - light.x, pointer.y - light.y) > 0.5) raf = requestAnimationFrame(loop)
      else (raf = 0), (last = 0)
    }
    const kick = () => raf || (raf = requestAnimationFrame(loop))
    const state = (target) => {
      const hit = labels.find(([sel]) => target?.closest?.(sel))
      labelled = Boolean(hit)
      if (hit) label.textContent = hit[1]
      const active = !hit && Boolean(target?.closest?.('a, button, [role="button"], label, summary, .ch'))
      const text = !hit && !active && Boolean(target?.closest?.('p, li, dd, dt, blockquote, figcaption, h1, h2, h3, h4, .meta'))
      cursor.classList.toggle('is-label', labelled)
      cursor.classList.toggle('is-active', active)
      cursor.classList.toggle('is-text', text)
      cursor.classList.toggle('is-dark', Boolean(target?.closest?.('.band--night, .band--ink, .footer')))
    }
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      if (!shown) {
        // Arrive in place rather than flying in from a corner.
        follow.x = light.x = e.clientX
        follow.y = light.y = e.clientY
        cursor.classList.add('is-on')
        shown = true
      }
      state(e.target)
      kick()
    }, { passive: true })
    // Scrolling moves the page under a still pointer: look again.
    onScrollFrame.push(() => shown && state(document.elementFromPoint(pointer.x, pointer.y)))
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-on') || (shown = false))
    window.addEventListener('blur', () => cursor.classList.remove('is-on') || (shown = false))
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'))
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'))

    // Comet trail and click sparks, on one canvas over the page. The trail is
    // the pointer's last ~180 ms of travel, drawn as a tapering lime stroke;
    // a click throws a small ring of sparks. Draws only while something is
    // still fading, then stops.
    const tctx = trailCanvas.getContext('2d')
    const accentOf = () => getComputedStyle(document.documentElement).getPropertyValue('--cursor').trim() || '#d4ff3f'
    let lime = accentOf()
    window.addEventListener('themechange', () => (lime = accentOf()))
    const sizeTrail = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      trailCanvas.width = Math.round(window.innerWidth * dpr)
      trailCanvas.height = Math.round(window.innerHeight * dpr)
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    sizeTrail()
    window.addEventListener('resize', sizeTrail)
    const trail = []
    const sparks = []
    let trailRaf = 0
    const drawTrail = (now) => {
      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      while (trail.length && now - trail[0].t > 180) trail.shift()
      tctx.lineCap = 'round'
      tctx.strokeStyle = lime
      for (let i = 1; i < trail.length; i++) {
        const age = 1 - (now - trail[i].t) / 180
        tctx.globalAlpha = age * 0.6
        tctx.lineWidth = 1 + age * 5
        tctx.beginPath()
        tctx.moveTo(trail[i - 1].x, trail[i - 1].y)
        tctx.lineTo(trail[i].x, trail[i].y)
        tctx.stroke()
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]
        const t = (now - p.t) / 520
        if (t >= 1) {
          sparks.splice(i, 1)
          continue
        }
        const ease = 1 - Math.pow(1 - t, 3)
        const r = 8 + ease * 34
        tctx.globalAlpha = 1 - t
        tctx.lineWidth = 2
        tctx.beginPath()
        tctx.moveTo(p.x + Math.cos(p.a) * r * 0.6, p.y + Math.sin(p.a) * r * 0.6)
        tctx.lineTo(p.x + Math.cos(p.a) * r, p.y + Math.sin(p.a) * r)
        tctx.stroke()
      }
      tctx.globalAlpha = 1
      trailRaf = trail.length > 1 || sparks.length ? requestAnimationFrame(drawTrail) : (tctx.clearRect(0, 0, window.innerWidth, window.innerHeight), 0)
    }
    const kickTrail = () => trailRaf || (trailRaf = requestAnimationFrame(drawTrail))
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return
      trail.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      kickTrail()
    }, { passive: true })
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return
      const t = performance.now()
      for (let k = 0; k < 10; k++) sparks.push({ x: e.clientX, y: e.clientY, a: (k / 10) * Math.PI * 2 + Math.random() * 0.3, t })
      kickTrail()
    })
    // Scrolling moves the page, not the pointer; drop the old path.
    window.addEventListener('scroll', () => (trail.length = 0), { passive: true })

    // Magnetic targets: buttons and navigation lean toward the pointer while
    // it is over them and spring back when it leaves. Uses the `translate`
    // property so it never fights the elements' own hover transforms.
    const magnets = new Map()
    let pull = 0
    const settle = () => {
      pull = 0
      for (const [el, m] of magnets) {
        m.x += (m.tx - m.x) * m.k
        m.y += (m.ty - m.y) * m.k
        if (Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y) < 0.05) (m.x = m.tx), (m.y = m.ty)
        el.style.translate = m.x || m.y ? `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px` : ''
        if (m.x !== m.tx || m.y !== m.ty) pull = pull || requestAnimationFrame(settle)
      }
    }
    for (const el of document.querySelectorAll('.btn, .masthead__nav a, .masthead__mark, .footer__top, .case__exits a')) {
      const m = { x: 0, y: 0, tx: 0, ty: 0, k: 0.2 }
      magnets.set(el, m)
      const strength = el.matches('.btn') ? 0.35 : 0.25
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return
        const r = el.getBoundingClientRect()
        // Measure from where the element would sit unpulled.
        m.tx = (e.clientX - (r.left - m.x + r.width / 2)) * strength
        m.ty = (e.clientY - (r.top - m.y + r.height / 2)) * strength
        m.k = 0.25
        pull = pull || requestAnimationFrame(settle)
      })
      el.addEventListener('pointerleave', () => {
        m.tx = m.ty = 0
        m.k = 0.08
        pull = pull || requestAnimationFrame(settle)
      })
    }
  }

  // Inertial scrolling for the mouse wheel and trackpad on desktop: the page
  // eases toward where the wheel says it should be instead of stepping, the
  // same time constant everywhere. Keyboard, scrollbar, find-in-page and
  // pinch-zoom stay native, and so does anything when a panel has locked the
  // page. Reduced motion, touch screens and small windows keep native scroll.
  let inertia = null
  if (motion && finePointer && !light) {
    let target = window.scrollY
    let current = window.scrollY
    let raf = 0
    let last = 0
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight
    const halt = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }
    const loop = (now) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      current += (target - current) * (1 - Math.exp(-dt / 0.11))
      if (Math.abs(target - current) < 0.4) current = target
      window.scrollTo({ top: current, behavior: 'instant' })
      raf = current === target ? (halt(), 0) : requestAnimationFrame(loop)
    }
    window.addEventListener(
      'wheel',
      (e) => {
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
        if (document.body.style.overflow === 'hidden' || e.target.closest?.('.menu')) return
        e.preventDefault()
        // Start from wherever the page really is (keys or the scrollbar may
        // have moved it since).
        if (!raf) target = current = window.scrollY
        const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1
        target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit))
        if (!raf) raf = requestAnimationFrame(loop)
      },
      { passive: false },
    )
    for (const type of ['keydown', 'pointerdown']) window.addEventListener(type, halt, { passive: true })
    inertia = { halt }
  }

  // Highlight the section in view in the primary navigation. The hero is
  // watched too, so nothing stays highlighted once you are back at the top.
  const links = new Map([...document.querySelectorAll('[data-nav]')].map((a) => [a.dataset.nav, a]))
  // One cobalt rule slides between links to mark the current section.
  const nav = document.querySelector('.masthead__nav')
  const navInk = nav && document.createElement('span')
  let current = null
  const placeInk = () => {
    if (!navInk) return
    const a = links.get(current)
    const wasOn = navInk.classList.contains('is-on')
    navInk.classList.toggle('is-on', Boolean(a))
    if (!a || !a.offsetWidth) return
    // Underline the label's words, not the number or the padding.
    const range = document.createRange()
    range.selectNode(a.lastChild)
    const box = range.getBoundingClientRect()
    const left = box.left - nav.getBoundingClientRect().left
    // Appearing, it starts in place; after that it slides between links.
    if (!wasOn) navInk.style.transition = 'opacity 0.4s'
    navInk.style.transform = `translateX(${left.toFixed(1)}px) scaleX(${box.width.toFixed(1)})`
    if (!wasOn) navInk.offsetWidth, (navInk.style.transition = '')
  }
  if (navInk) {
    navInk.className = 'nav-ink'
    navInk.setAttribute('aria-hidden', 'true')
    nav.append(navInk)
    nav.classList.add('has-ink')
    window.addEventListener('resize', placeInk)
    document.fonts?.ready.then(placeInk)
  }
  const highlight = (id) => {
    links.forEach((a, key) => (key === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')))
    current = links.has(id) ? id : null
    placeInk()
  }
  let travelling = false
  const sections = [...links.keys(), 'top'].map((id) => document.getElementById(id)).filter(Boolean)
  if (links.size && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        if (travelling) return
        for (const entry of entries) if (entry.isIntersecting) highlight(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => spy.observe(s))
  }

  // In-page links glide all the way, with no jump: an ease-in-out curve (the
  // same shape as --ease-io in styles.css) whose length grows with the square
  // root of the distance, so short hops are quick and crossing the whole page
  // stays near a second. The navigation holds on the destination meanwhile,
  // and any wheel, touch or key press hands control straight back.
  const instant = (top) => window.scrollTo({ top, behavior: 'instant' })
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const glideTime = (distance) => Math.min(1150, 380 + Math.sqrt(distance) * 10)
  let glide = 0
  const stop = () => {
    cancelAnimationFrame(glide)
    travelling = false
  }
  for (const type of ['wheel', 'touchstart', 'keydown']) window.addEventListener(type, stop, { passive: true })

  const travel = (to, done) => {
    stop()
    inertia?.halt()
    const max = document.documentElement.scrollHeight - window.innerHeight
    to = Math.max(0, Math.min(to, max))
    if (!motion) return instant(to), done()
    const from = window.scrollY
    const duration = glideTime(Math.abs(to - from))
    const start = performance.now()
    travelling = true
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      instant(from + (to - from) * easeInOut(t))
      if (t < 1) glide = requestAnimationFrame(step)
      else (travelling = false), done()
    }
    glide = requestAnimationFrame(step)
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a || a.classList.contains('skip-link') || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const id = decodeURIComponent(a.hash.slice(1))
    const toTop = id === 'top'
    const target = toTop ? document.getElementById('main') : document.getElementById(id)
    if (!target) return
    e.preventDefault()
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    const to = toTop ? 0 : target.getBoundingClientRect().top + window.scrollY - offset - margin
    highlight(links.has(id) ? id : null)
    // Sections keep their hash for sharing and Back; the top gets a clean URL.
    const url = toTop ? location.pathname + location.search : `#${id}`
    if (toTop) history.replaceState(null, '', url)
    else if (location.hash !== url) history.pushState(null, '', url)
    travel(to, () => {
      if (!target.hasAttribute('tabindex') && !target.matches('a, button, input, select, textarea')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    })
  })
})()
