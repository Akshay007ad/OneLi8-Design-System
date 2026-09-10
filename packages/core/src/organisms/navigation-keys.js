/**
 * Shared roving focus for the navigation organisms.
 *
 * From the navigation contract: "Arrow keys move through enabled Tabs; Home and
 * End reach the boundaries", "Disabled choices are skipped by roving focus",
 * and "mirrors horizontal Arrow keys in RTL". One implementation serves Tabs
 * and Segmented Control so the three organisms cannot drift apart.
 */

/** Which key means forward, given the orientation and the reading direction. */
export function navigationStep(key, orientation, rtl) {
  const forwardInline = rtl ? 'ArrowLeft' : 'ArrowRight';
  const backwardInline = rtl ? 'ArrowRight' : 'ArrowLeft';
  if (orientation === 'vertical') {
    if (key === 'ArrowDown') return 1;
    if (key === 'ArrowUp') return -1;
  } else {
    if (key === forwardInline) return 1;
    if (key === backwardInline) return -1;
  }
  return 0;
}

/** The next enabled index, wrapping, skipping anything disabled. */
export function nextEnabled(items, from, step) {
  const n = items.length;
  if (n === 0) return -1;
  for (let hop = 1; hop <= n; hop += 1) {
    const i = (from + step * hop + n * hop) % n;
    if (!items[i].disabled) return i;
  }
  return from;
}

/** The first or last enabled index. */
export function edgeEnabled(items, edge) {
  const order = edge === 'end' ? [...items.keys()].reverse() : [...items.keys()];
  for (const i of order) if (!items[i].disabled) return i;
  return -1;
}

/**
 * Resolves a key press into the index that should now hold focus, or -1 when
 * the key is not ours to handle.
 */
export function resolveNavigationKey(event, items, activeIndex, { orientation = 'horizontal', rtl = false } = {}) {
  if (event.key === 'Home') return edgeEnabled(items, 'start');
  if (event.key === 'End') return edgeEnabled(items, 'end');
  const step = navigationStep(event.key, orientation, rtl);
  if (step === 0) return -1;
  return nextEnabled(items, activeIndex, step);
}

/** True when the element sits in a right to left context. */
export function isRtl(element) {
  if (typeof window === 'undefined' || !element) return false;
  return window.getComputedStyle(element).direction === 'rtl';
}
