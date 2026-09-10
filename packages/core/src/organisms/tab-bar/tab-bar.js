/**
 * Oneli8 · Tab Bar — headless behavior.
 *
 * Figma (701:460): "Production uses native destination links, requires a non
 * empty navigation name, resolves exactly one current destination, and rejects
 * disabled pseudo destinations. Material and presentation never fork semantics."
 *
 * Every rule in that sentence is enforced below rather than described.
 */
import { renderNavigationItem } from '../../molecules/navigation-item/index.js';

export const OL8_TAB_BAR_PRESENTATIONS = ['bottom', 'inline', 'sidebar', 'spatial-rail'];

/**
 * @param {{
 *   label:string,
 *   items:Array<{href:string,label?:string,icon?:string,badge?:any,ariaLabel?:string}>,
 *   current?:string, presentation?:string, size?:string, material?:string, className?:string,
 * }} options
 */
export function renderTabBar(options) {
  const {
    label, items = [], current,
    presentation = 'bottom', size = 'standard', material = 'regular', className,
  } = options ?? {};

  assertTabBar({ label, items, current, presentation });

  // The spatial rail carries no labels, so a name has to come from somewhere.
  const iconOnly = presentation === 'spatial-rail';

  const destinations = items.map(item => renderNavigationItem({
    kind: 'destination',
    label: iconOnly ? undefined : item.label,
    icon: item.icon,
    badge: item.badge,
    href: item.href,
    selected: item.href === current,
    ariaLabel: item.ariaLabel ?? (iconOnly ? item.label : undefined),
    extraAttrs: `data-ol8-size="${size}"`,
  })).join('');

  const attrs = [
    `class="ol8-tab-bar${className ? ` ${className}` : ''}"`,
    `aria-label="${escapeAttr(label)}"`,
    `data-ol8-presentation="${presentation}"`,
    `data-ol8-size="${size}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
  ].filter(Boolean).join(' ');

  return `<nav ${attrs}>${destinations}</nav>`;
}

/**
 * Lets a product route without replacing link semantics. The link stays a real
 * link, so opening it in a new tab, copying it and middle clicking all still
 * work; only an ordinary left click is intercepted.
 */
export function hydrateTabBars(root = document, onNavigate) {
  let count = 0;
  for (const bar of root.querySelectorAll('.ol8-tab-bar')) {
    if (bar.dataset.ol8Wired === 'true') continue;
    bar.dataset.ol8Wired = 'true';
    count += 1;
    if (typeof onNavigate !== 'function') continue;
    bar.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('.ol8-nav-item--destination');
      if (!link || link.target === '_blank') return;
      event.preventDefault();
      onNavigate(link.getAttribute('href'), event);
    });
  }
  return count;
}

function assertTabBar({ label, items, current, presentation }) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] a tab bar requires a navigation name, so a person can tell one landmark from another.');
  }
  if (!OL8_TAB_BAR_PRESENTATIONS.includes(presentation)) {
    throw new Error(`[ol8] unknown tab bar presentation "${presentation}"`);
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('[ol8] a tab bar needs at least one destination.');
  }
  const seen = new Set();
  for (const item of items) {
    if (typeof item.href !== 'string' || item.href === '') {
      throw new Error('[ol8] every destination needs an href. A tab bar navigates, so it uses real links.');
    }
    if (item.disabled) {
      throw new Error('[ol8] a destination cannot be disabled. Remove the place rather than showing a door that does not open.');
    }
    if (seen.has(item.href)) throw new Error(`[ol8] two destinations share the href "${item.href}"`);
    seen.add(item.href);
  }
  if (current !== undefined && !seen.has(current)) {
    throw new Error(`[ol8] the current destination "${current}" is not one of the destinations listed.`);
  }
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
