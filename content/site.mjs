// Everything the portfolio says lives in this file. Edit copy, links and
// projects here; `npm run build` turns it into static pages in dist/.
//
// Inline markup allowed in text fields: *emphasis* (rendered in the italic
// serif). Everything else is escaped.

export const person = {
  name: 'Krish Shah',
  firstName: 'Krish',
  lastName: 'Shah',
  role: 'Computer Science student',
  school: 'University of Guelph',
  location: 'Guelph, Ontario',
  email: 'kshah.code@gmail.com',
  // Set to a path under public/ (for example 'files/krish-shah-resume.pdf')
  // once a resume meant for software roles is ready. Left null, no resume
  // link is shown anywhere.
  resume: null,
  // Set to the deployed site's URL (no trailing slash) for canonical and
  // social-preview tags. Left null, those tags are omitted.
  siteUrl: 'https://krishshahdev.tech',
  // Unique-visitor counter, kept by the free Abacus counting API
  // (abacus.jasoncameron.dev). Each browser is counted once; open the site
  // with ?me to stop counting your own browser. Visits from localhost go to
  // `${key}-dev` so testing never touches the real count. The counter's admin
  // key (to reset it) is kept outside the repo. Set to null to remove it.
  visitorCounter: { namespace: 'krishshah-portfolio', key: 'visitors' },
  profiles: [
    { label: 'GitHub', display: 'github.com/KRISH-01-code', href: 'https://github.com/KRISH-01-code' },
    { label: 'LinkedIn', display: 'linkedin.com/in/krish-shah-5093211b5', href: 'https://www.linkedin.com/in/krish-shah-5093211b5/' },
  ],
}

export const hero = {
  headline: 'I build software that lets you test an idea *before you commit to it.*',
  intro:
    'I study Computer Science at the University of Guelph and learn most by building things end to end. ' +
    'My recent projects put a check between a decision and its consequences: a stormwater simulator you run ' +
    'before anything is dug, and a clinical assistant that can draft a note but cannot save it until a person confirms.',
  figure: {
    src: 'images/runofflab-storm.webp',
    width: 2000,
    height: 1209,
    alt:
      'RunoffLab’s 3D view mid-storm: a campus block with a building roof, two parking lots, lawns, a rain garden ' +
      'strip and permeable pavers, with a storm clock reading 12:00, rain 7.2 mm/h and 0.285 m³/s leaving the site.',
    caption: 'RunoffLab replaying a 50 mm design storm from its SWMM time series. 12:00 — 7.2 mm/h of rain, 0.285 m³/s leaving the site.',
  },
}

export const about = {
  title: 'I learn by building the whole thing, *then finding out where it’s wrong.*',
  paragraphs: [
    'I’m working toward a Bachelor of Computing in Computer Science at the University of Guelph. Coursework gave me the ' +
      'foundations — C, pointers and memory, data structures, discrete math — and projects are where I find out what ' +
      'they’re for.',
    'The problems I keep coming back to are practical ones where a wrong answer costs something: how much water a rain ' +
      'garden actually keeps out of a storm drain, or what an assistant should be allowed to write into a patient record. ' +
      'I like software that shows its working — the assumption, the formula, the test — so someone else can check it ' +
      'instead of taking it on trust.',
    'Right now I’m getting better at the unglamorous parts: reading other people’s code, debugging with GDB and Valgrind, ' +
      'and writing the test before I believe a number.',
  ],
  principles: [
    {
      title: 'Start from a question someone actually has.',
      body: 'RunoffLab began as one: which green infrastructure, where, and how big, gives the most benefit for the budget?',
    },
    {
      title: 'Check the output against something known.',
      body: 'RunoffLab’s engine tests compare SWMM against hand calculations before any result is shown.',
    },
    {
      title: 'Say plainly what it can’t do.',
      body: 'MEDIQ lists its limits up front: synthetic data, no anti-spoofing, not a medical device.',
    },
  ],
}

// Projects render in this order. `layout` picks the composition on the home
// page: 'feature' (large, full width), 'dark' (complementary split on a dark
// band) or 'brief' (compact). `theme` picks the project's accent colours
// (defined in src/styles.css): 'environment', 'clinical' or 'logic'. Add a project by appending an object; every
// project also gets its own case-study page at <slug>.html.
export const projects = [
  {
    slug: 'runofflab',
    theme: 'environment',
    layout: 'feature',
    title: 'RunoffLab',
    kind: 'Stormwater engineering',
    year: '2026',
    summary:
      'A stormwater design tool that puts EPA SWMM behind an interactive site plan. Draw rain gardens, permeable pavement ' +
      'or green roofs on a site, then see what they do to runoff, peak flow and water quality — *before anything is built.*',
    problem:
      'Paved sites send most of their rain straight into storm drains, carrying sediment into creeks and overloading pipes ' +
      'in heavy storms. Green infrastructure helps, but every square metre costs money, and the standard engineering ' +
      'model, EPA’s Storm Water Management Model, is driven by text input files and long reports. RunoffLab asks a ' +
      'practical question of it: which features, where, and how big, give the most benefit for the budget?',
    // Case-study page only: who did what, and how the pieces fit together.
    role:
      'A two-person project joining environmental engineering and computer science. My teammate came up with the idea ' +
      'and built the frontend; I built the backend — the FastAPI service that checks designs and runs them through ' +
      'SWMM — and the SQLite project storage.',
    approach: {
      text:
        'The browser holds the site and the design. On simulate, the backend checks the design against the same rules ' +
        'as the editor, writes it out as a SWMM input file — one subcatchment per surface, one LID control per feature — ' +
        'runs SWMM in a temporary folder and reads its binary output back. The frontend only draws what SWMM returned.',
      steps: [
        ['Draw', 'SVG site editor'],
        ['Check', 'Constraint rules'],
        ['Translate', 'SWMM .inp file'],
        ['Simulate', 'SWMM 5.2 via PySWMM'],
        ['Compare', 'Baseline vs design'],
      ],
    },
    features: [
      ['Draw the site', 'An SVG editor for roofs, parking, lawns, drains and pipes, plus five kinds of green infrastructure. Constraint checks run as you edit.'],
      ['Simulate with SWMM', 'Each design becomes a SWMM 5.2 model, run locally through PySWMM: every surface a subcatchment, every feature a native LID control.'],
      ['Compare outcomes', 'Baseline against design: runoff volume, peak outfall flow, the water balance, flooding, and sediment and phosphorus leaving the site.'],
      ['Search for trade-offs', 'The Design Explorer runs hundreds of layouts through SWMM in parallel and highlights the cost-versus-runoff Pareto front.'],
      ['Look beyond one storm', 'Year-long continuous runs, what-if storms and clogged soils, a 3D storm replay and PDF reports with every assumption listed.'],
    ],
    decisions: [
      ['SWMM is the source of truth.', 'The app never estimates a result itself. Tests check the engine against hand calculations, such as runoff from a roof equalling rain minus depression storage.'],
      ['Invalid designs never reach the engine.', 'The same rules run in the editor while you draw and in the API before a simulation, so a design that couldn’t be built never produces numbers.'],
      ['The 3D view says what is real.', 'Water, runoff paths and pipe flow follow the time series; building heights, trees and thunder are labelled as illustration.'],
    ],
    figures: [
      { value: '200', unit: 'designs', label: 'explored in about 5 seconds by the Design Explorer' },
      { value: '−30', unit: '%', label: 'runoff for the sample design in a 50 mm storm' },
      { value: '128', unit: 'tests', label: '76 pytest, 39 Vitest and 13 Playwright' },
      { value: '0', unit: 'API keys', label: 'everything runs locally, including the engine' },
    ],
    figuresNote:
      'Sample numbers come from the bundled fictional 2.4 ha campus with illustrative unit costs. They show what the tool does; they are not a claim about a real site.',
    limits:
      'The site model is flat and made of rectangles. Costs and pollutant concentrations are illustrative defaults, and the built-in year of rainfall is synthetic unless a measured record is imported. There are no user accounts yet, so it isn’t deployed publicly.',
    // Lead image on the case-study page (defaults to the first gallery image).
    lead: hero.figure,
    stack: ['Python', 'FastAPI', 'EPA SWMM 5.2 / PySWMM', 'SQLite', 'Next.js', 'React', 'TypeScript', 'three.js', 'ReportLab', 'pytest', 'Vitest', 'Playwright', 'Docker'],
    gallery: [
      {
        src: 'images/runofflab-editor.webp', width: 1600, height: 1000,
        alt: 'RunoffLab site editor: a plan of a campus block with a selected rain garden strip between two parking lots, and a sidebar showing budget, area and “All constraints pass”.',
        caption: 'Site editor. Checks run while you draw; this design passes and is ready to simulate.',
      },
      {
        src: 'images/runofflab-results.webp', width: 1600, height: 1000,
        alt: 'RunoffLab results: runoff 576 m³ (−30%), peak discharge 0.291 m³/s (−13%), a rainfall and outfall hydrograph comparing baseline and design, and a water-balance chart.',
        caption: 'Results. Baseline against design, straight from SWMM: 250 m³ less stormwater leaves the site.',
      },
      {
        src: 'images/runofflab-explorer.webp', width: 1600, height: 1000,
        alt: 'RunoffLab Design Explorer: a scatter plot of cost against runoff volume for 200 simulated designs, with the best trade-offs highlighted as a stepped green frontier.',
        caption: 'Design Explorer. 200 layouts through SWMM in 5 s; the green frontier is the best runoff for each budget.',
      },
    ],
    links: [],
    // Shown in place of a source link while the repository is private.
    linkNote: 'Repository private for now',
  },
  {
    slug: 'mediq',
    theme: 'clinical',
    layout: 'dark',
    title: 'MEDIQ',
    kind: 'Hackathon · Healthcare prototype',
    year: '2026',
    context: 'Built with a team at Hack Day Guelph (Hacktoberfest × GDG on Campus).',
    award: { place: '2nd Place', event: 'DigitalOcean (Hacktoberfest) × Google Developer Groups Hackathon, October 2026' },
    summary:
      'A hands-free clinical co-pilot prototype. Voice commands run only for a verified doctor, reports float and move ' +
      'under your hands, and AI-drafted visit notes *can’t be saved until a clinician reviews the exact text.*',
    problem:
      'Clinicians lose time to charting and to hunting through records, and in some settings they can’t touch a keyboard at ' +
      'all. An assistant that helps there has to be easy to drive by voice or gesture — and it must never be the one that ' +
      'decides what goes into a patient’s record.',
    role:
      'A team hackathon project. I built the clinical dashboard, the data layer — IndexedDB stores behind a validated ' +
      'repository, with the room and admission rules — and testing. Teammates built the voice, gesture and AI features.',
    approach: {
      text:
        'Everything runs in the browser except AI calls, which go through a small Node server that holds the keys. ' +
        'Voice, hands and AI can move around the app and prepare a draft, but every write — a note, an admission, a ' +
        'transfer — passes one confirmation dialog, and room rules are checked again inside the database transaction.',
      steps: [
        ['Input', 'Voice, hands or typing'],
        ['Verify', 'On-device speaker check'],
        ['Route', 'Rule-based commands'],
        ['Draft', 'SOAP note + safety audit'],
        ['Confirm', 'Clinician reviews exact text'],
      ],
    },
    features: [
      ['Doctor-only voice', 'An on-device speaker-verification model (WeSpeaker ResNet34, ONNX in the browser) checks who is speaking before any command runs, and fails closed when nobody is enrolled.'],
      ['Deterministic commands', 'A rule-based router handles navigation and reports — “show me the patient report”, “close the report” — so no language model decides where you go.'],
      ['Touchless reports', 'MediaPipe hand tracking runs locally: point to aim, pinch to drag a report, pull two hands apart to resize, hold a fist to close.'],
      ['Drafts with a safety audit', 'A structured SOAP draft and an independent audit sit side by side. Local rules always run, so the whole workflow works with no API keys.'],
    ],
    decisions: [
      ['Nothing saves itself.', 'Voice, gestures and AI can only navigate or prepare a draft. Saving goes through one dialog that shows the target, the source and the exact content, and needs an “I have reviewed this exact change” tick.'],
      ['Every result says where it came from.', 'Outputs are tagged by source — model, local rule, record or simulation — so a warning from a local rule is never presented as an AI finding.'],
      ['Secrets stay on the server.', 'Provider keys live only in a local Node process; a build step scans the browser bundle to confirm no key ships to the client.'],
    ],
    quote: 'AI output, voice commands and gestures cannot confirm on their own.',
    quoteSource: 'MEDIQ’s confirmation dialog',
    figures: [
      { value: '153', unit: 'tests', label: 'Vitest unit and component tests' },
      { value: '19', unit: 'tests', label: 'Playwright, including real recorded speech' },
    ],
    limits:
      'A hackathon prototype on synthetic data — not a medical device. Speaker verification has no anti-spoofing, browser storage isn’t tamper-proof, and real-room microphone and gesture behaviour still needs testing on real hardware.',
    stack: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Node.js / Express', 'Zod', 'IndexedDB', 'onnxruntime-web', 'MediaPipe', 'Web Speech API', 'Vitest', 'Playwright'],
    gallery: [
      {
        src: 'images/mediq-confirm.webp', width: 1600, height: 1000,
        alt: 'MEDIQ’s “Save clinician-confirmed visit note” dialog showing the target patient, the source chain, a critical allergy warning, the exact note text and an unticked review checkbox.',
        caption: 'The confirmation gate: target, source, warnings and the exact text, behind a review tick.',
      },
      {
        src: 'images/mediq-safety.webp', width: 1600, height: 1000,
        alt: 'MEDIQ visit note screen with a critical safety warning: proposed amoxicillin conflicts with the synthetic patient’s documented severe penicillin allergy, identified by a local deterministic safety rule.',
        caption: 'A dictated draft proposing amoxicillin trips the allergy rule. Attributed to the local rule, not to AI.',
      },
      {
        src: 'images/mediq-report.webp', width: 1600, height: 1000,
        alt: 'MEDIQ floating clinical summary window over the voice assistant: allergy alert, flags for review, latest vitals and active medications for a synthetic patient.',
        caption: 'A floating report, opened by a typed command. The same windows can be dragged and resized by hand.',
      },
    ],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/GurkiratA/Mediq' }],
  },
  {
    slug: 'discrete-solver',
    theme: 'logic',
    layout: 'brief',
    title: 'DiscreteSolver',
    kind: 'Collaboration · Machine learning',
    year: '2026',
    summary: 'Type a combinatorics word problem; get the operation, the formula and the answer.',
    problem:
      'Combinatorics word problems are easy to misread: the difference between a permutation and a combination is often one ' +
      'word. DiscreteSolver classifies the question first, then shows the formula it used, so the answer can be checked.',
    approach: {
      text:
        'A small Flask app. The operation is decided before any numbers are read: the classifier picks it from the ' +
        'wording, a parser then pulls out n and r, and the formula is shown next to the answer — so a misread question ' +
        'shows up in the working instead of hiding behind a number.',
      steps: [
        ['Ask', 'Plain-English question'],
        ['Classify', 'TF-IDF + linear SVM'],
        ['Extract', 'n and r by regex'],
        ['Solve', 'Formula'],
        ['Show', 'Rendered with KaTeX'],
      ],
    },
    features: [
      ['Classify', 'A TF-IDF and linear support-vector classifier, trained on a labelled set of word problems, picks one of six operations.'],
      ['Extract', 'A regex parser pulls out n and r, including number words like “five”.'],
      ['Show the working', 'The result is rendered with KaTeX: operation, formula and value.'],
    ],
    stack: ['Python', 'Flask', 'scikit-learn', 'pytest', 'KaTeX', 'Docker'],
    gallery: [
      {
        src: 'images/discrete-solver.webp', width: 1440, height: 840,
        alt: 'DiscreteSolver result: classified as Combinations with n = 10 and r = 3, the formula n! over r!(n − r)!, and 10 choose 3 = 120.',
        caption: '“A committee of 3 from 10 people” → Combinations → 120.',
      },
    ],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/KRISH-01-code/discrete_solver' }],
  },
]

// Each skill names where it was used: a project slug, or 'course' for
// university coursework. Only list things there is evidence for.
export const skills = [
  {
    group: 'Languages',
    items: [
      ['Python', ['runofflab', 'discrete-solver']],
      ['TypeScript', ['mediq']],
      ['C', ['course']],
      ['JavaScript', ['discrete-solver']],
      ['HTML & CSS', ['mediq', 'discrete-solver']],
    ],
  },
  {
    group: 'Interfaces',
    items: [
      ['React', ['mediq']],
      ['Tailwind CSS', ['mediq']],
    ],
  },
  {
    group: 'Back end & data',
    items: [
      ['FastAPI', ['runofflab']],
      ['Flask', ['discrete-solver']],
      ['Node.js & Express', ['mediq']],
      ['SQLite', ['runofflab']],
      ['IndexedDB', ['mediq']],
    ],
  },
  {
    group: 'Testing & tools',
    items: [
      ['pytest', ['runofflab', 'discrete-solver']],
      ['Vitest & Playwright', ['mediq']],
      ['Docker', ['runofflab', 'mediq']],
      ['Git & Linux', ['course']],
      ['GDB, Valgrind, Make', ['course']],
    ],
  },
  {
    group: 'Problem areas',
    items: [
      ['Hydrologic simulation (EPA SWMM)', ['runofflab']],
      ['Optimisation & Pareto search', ['runofflab']],
      ['On-device ML in the browser', ['mediq']],
      ['Text classification', ['discrete-solver']],
      ['Human-in-the-loop design', ['mediq']],
    ],
  },
]

export const education = {
  school: 'University of Guelph',
  degree: 'Bachelor of Computing, Computer Science',
  dates: 'Expected April 2029',
  honours: 'Dean’s Honour List (CCMPS)',
}

// A short, verified record. Add hackathons, roles or awards here as they happen.
export const record = [
  { year: '2026', title: 'MEDIQ', detail: '2nd Place — DigitalOcean (Hacktoberfest) × Google Developer Groups Hackathon', tag: 'Hackathon · 2nd', project: 'mediq' },
  { year: '2026', title: 'RunoffLab', detail: 'Stormwater design tool built on EPA SWMM', tag: 'Project', project: 'runofflab' },
  { year: '2026', title: 'DiscreteSolver', detail: 'Combinatorics classifier and solver', tag: 'Collaboration', project: 'discrete-solver' },
]

export const contact = {
  title: 'Hiring for a software internship, or curious about a project? *Write to me.*',
  lede: 'Send a message with the form, or email me directly. My code is on GitHub.',
  // Messages from the contact form are delivered to person.email by
  // FormSubmit (formsubmit.co), a free form-to-email service with no account.
  // The first message ever sent triggers an activation email to that address;
  // click its link once and every message after arrives normally. Set to
  // false to remove the form.
  form: true,
}
