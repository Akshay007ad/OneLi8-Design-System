/**
 * Oneli8 · Icon atom — headless behavior.
 *
 * Two entry points, one output:
 *   renderIcon(name, opts)  -> markup string (build time / SSR)
 *   hydrateIcons(root)      -> fills in [data-ol8-icon] placeholders (runtime)
 *
 * Icons render INLINE (never <img>) because the Figma contract says the consumer
 * supplies semantic color — that needs `currentColor`, which <img> cannot inherit.
 */
import { OL8_ICONS, OL8_ICON_VIEWBOX } from './icons.generated.js';

/** Universal sizes from the Figma "Icon Frame" (418:51). */
export const OL8_ICON_SIZES = [9, 12, 18, 24, 30, 36, 48, 60, 72, 96, 108];

/** @param {string} name */
export function isOl8IconName(name) {
  return Object.hasOwn(OL8_ICONS, name);
}

/** The inner leaf only — the <svg>, in canonical 24-unit source space. */
export function renderIconSvg(name) {
  if (!isOl8IconName(name)) throw new Error(`[ol8] unknown icon "${name}"`);
  return `<svg viewBox="${OL8_ICON_VIEWBOX}" fill="none" focusable="false">${OL8_ICONS[name].body}</svg>`;
}

/** The complete atom: outer box + leaf. */
export function renderIcon(name, options = {}) {
  if (!isOl8IconName(name)) throw new Error(`[ol8] unknown icon "${name}"`);
  const { size = 24, label, className } = options;
  if (!OL8_ICON_SIZES.includes(size)) {
    throw new Error(`[ol8] size ${size} is not an Icon Frame universal size (${OL8_ICON_SIZES.join(', ')})`);
  }
  const entry = OL8_ICONS[name];
  const attrs = [
    `class="ol8-icon${className ? ` ${className}` : ''}"`,
    `data-ol8-icon="${name}"`,
    `data-ol8-icon-size="${size}"`,
    entry.mirrorInRTL ? 'data-ol8-icon-mirror="true"' : '',
    label ? `role="img" aria-label="${escapeAttr(label)}"` : 'aria-hidden="true"',
  ].filter(Boolean).join(' ');
  return `<span ${attrs}>${renderIconSvg(name)}</span>`;
}

/**
 * Upgrades every `[data-ol8-icon]` placeholder under `root` in place. Idempotent.
 *   <span data-ol8-icon="add" data-ol8-icon-size="18"></span>
 *   <span data-ol8-icon="close" data-ol8-icon-label="Dismiss"></span>
 */
export function hydrateIcons(root = document) {
  for (const el of root.querySelectorAll('[data-ol8-icon]')) {
    if (el.dataset.ol8IconHydrated === 'true') continue;
    const name = el.dataset.ol8Icon ?? '';
    if (!isOl8IconName(name)) { console.warn(`[ol8] unknown icon "${name}"`, el); continue; }

    const entry = OL8_ICONS[name];
    const label = el.dataset.ol8IconLabel;

    el.classList.add('ol8-icon');
    if (!el.dataset.ol8IconSize) el.dataset.ol8IconSize = '24';
    if (entry.mirrorInRTL) el.dataset.ol8IconMirror = 'true';

    if (label) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', label);
      el.removeAttribute('aria-hidden');
    } else {
      el.setAttribute('aria-hidden', 'true');
      el.removeAttribute('role');
    }

    el.innerHTML = renderIconSvg(name);
    el.dataset.ol8IconHydrated = 'true';
  }
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export { OL8_ICONS };
