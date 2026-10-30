// Canonical page snapshots invalidate artwork when substantive source content changes.
export function sourceSnapshot(page = {}) {
  const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().filter(key => key !== 'img').map(key => [key, stable(value[key])])) : value
  return JSON.stringify(stable(page))
}
