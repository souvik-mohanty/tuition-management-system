const KEY = 'classops-last-chunk-reload'
const MIN_GAP_MS = 60_000

export const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|Loading chunk|Unable to preload/i

/**
 * After a new deploy, an old tab or cached index.html points at hashed files that no longer exist.
 * Reload once to pick up the new build; the time gap prevents a reload loop if something else is broken.
 */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < MIN_GAP_MS) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    // storage unavailable: still reload once per page load below
  }
  window.location.reload()
  return true
}
