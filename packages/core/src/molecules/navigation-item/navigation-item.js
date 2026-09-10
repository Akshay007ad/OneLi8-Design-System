/**
 * Oneli8 · Navigation Item — the shared internal molecule.
 *
 * Figma draws three of these: Tab Item (688:51), Segment Item (695:167) and
 * Destination Item (700:292). They are the same molecule with three selection
 * languages, and the navigation contract is explicit that all three are
 * internal: "The public package exports the three Organisms, preventing
 * consumers from breaking group ownership or creating disconnected state
 * behavior." So nothing here is re-exported from the package index.
 *
 * Figma's six States are review evidence, never classes. Hover, Pressed and
 * Focus are browser interactions; Selected and Current are owned by the parent
 * organism; Disabled is the native attribute.
 */
import { renderIcon } from '../../atoms/icon/index.js';
import { renderNavigationBadge } from '../../atoms/navigation-badge/index.js';

export const OL8_NAVIGATION_KINDS = ['tab', 'segment', 'destination'];
export const OL8_NAVIGATION_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_NAVIGATION_LAYOUTS = ['inline', 'stacked'];

/**
 * @param {{
 *   kind:string, label?:string, icon?:string, badge?:string|number,
 *   layout?:string, selected?:boolean, disabled?:boolean,
 *   ariaLabel?:string, id?:string, controls?:string, href?:string,
 *   tabIndex?:number, extraAttrs?:string,
 * }} item
 */
export function renderNavigationItem(item) {
  const {
    kind, label, icon, badge, layout = 'inline',
    selected = false, disabled = false, ariaLabel, id, controls, href,
    tabIndex, extraAttrs = '',
  } = item;

  if (!OL8_NAVIGATION_KINDS.includes(kind)) throw new Error(`[ol8] unknown navigation item kind "${kind}"`);
  if (!OL8_NAVIGATION_LAYOUTS.includes(layout)) throw new Error(`[ol8] unknown navigation layout "${layout}"`);
  if (!label && !icon) throw new Error('[ol8] a navigation item needs a label, an icon, or both.');
  // "Icon-only items require ariaLabel and a product level discoverable Tooltip."
  if (!label && !ariaLabel) {
    throw new Error('[ol8] an icon only navigation item requires an ariaLabel, since a glyph is not a name.');
  }
  // "Disabled TabBar destination is unsupported and blocks; no silent redesign."
  if (kind === 'destination' && disabled) {
    throw new Error('[ol8] a destination cannot be disabled. A place a person cannot go does not belong in navigation.');
  }

  const content =
    `<span class="ol8-nav-item__content">` +
    (icon ? renderIcon(icon, { size: 18, className: 'ol8-nav-item__icon' }) : '') +
    (label ? `<span class="ol8-nav-item__label">${escapeText(label)}</span>` : '') +
    (badge !== undefined && badge !== null && badge !== '' ? renderNavigationBadge(badge) : '') +
    `</span>`;

  // Tab Item marks selection with an indicator bar; Segment and Destination
  // mark it with the selection surface. The bar is always in the DOM so
  // selecting does not change the box.
  const indicator = kind === 'tab' ? `<span class="ol8-nav-item__indicator" aria-hidden="true"></span>` : '';

  const shared = [
    `class="ol8-nav-item ol8-nav-item--${kind}"`,
    `data-ol8-layout="${layout}"`,
    id ? `id="${escapeAttr(id)}"` : '',
    ariaLabel ? `aria-label="${escapeAttr(ariaLabel)}"` : '',
    extraAttrs,
  ].filter(Boolean);

  if (kind === 'destination') {
    if (typeof href !== 'string' || href === '') {
      throw new Error('[ol8] a destination requires an href. Tab Bar navigates, so it uses real links.');
    }
    const attrs = [
      ...shared,
      `href="${escapeAttr(href)}"`,
      selected ? 'aria-current="page"' : '',
    ].filter(Boolean).join(' ');
    return `<a ${attrs}>${content}</a>`;
  }

  const attrs = [
    ...shared,
    'type="button"',
    kind === 'tab' ? 'role="tab"' : '',
    kind === 'tab' ? `aria-selected="${selected}"` : `aria-pressed="${selected}"`,
    kind === 'tab' && controls ? `aria-controls="${escapeAttr(controls)}"` : '',
    disabled ? 'disabled' : '',
    tabIndex !== undefined ? `tabindex="${tabIndex}"` : '',
  ].filter(Boolean).join(' ');

  return `<button ${attrs}>${content}${indicator}</button>`;
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
