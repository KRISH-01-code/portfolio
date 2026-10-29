// Terms that must never appear in the published site: collaborators named on
// an earlier version of the portfolio. `npm run check` and `npm test` fail if
// any of these show up in content/ or dist/.
//
// The names live in blocklist.local.mjs, which is gitignored so the public
// repository doesn't publish the very names it keeps off the site. Without
// that file (a fresh clone, CI) the list is empty and the check is skipped.
let blockedTerms = []
try {
  ;({ blockedTerms } = await import('./blocklist.local.mjs'))
} catch {}
export { blockedTerms }

// Exact URLs that are allowed even though they contain an account name.
export const allowedUrls = ['https://github.com/GurkiratA/Mediq']
