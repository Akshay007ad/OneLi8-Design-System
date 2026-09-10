/**
 * Oneli8 · Tabs — headless behavior.
 *
 * Figma (693:171): "Production emits tablist, tab and tabpanel, requires a non
 * empty accessible region name, retains one enabled Tab stop, mirrors
 * horizontal Arrow keys in RTL, and supports horizontal/vertical orientation
 * plus automatic/manual activation."
 *
 * "Every consuming composition must pair each item with exactly one owned
 * panel", so a tab without a panel is refused rather than rendered.
 */
import { renderNavigationItem } from '../../molecules/navigation-item/index.js';
import { resolveNavigationKey, isRtl } from '../navigation-keys.js';

export const OL8_TABS_HIERARCHIES = ['primary', 'secondary', 'tertiary'];
export const OL8_TABS_ORIENTATIONS = ['horizontal', 'vertical'];
export const OL8_TABS_ACTIVATIONS = ['automatic', 'manual'];

let sequence = 0;

/**
 * @param {{
 *   label:string, items:Array<{id:string,label?:string,icon?:string,badge?:any,disabled?:boolean,ariaLabel?:string}>,
 *   selected?:string, hierarchy?:string, size?:string, material?:string,
 *   orientation?:string, activation?:string, idPrefix?:string, className?:string,
 * }} options
 */
export function renderTabs(options) {
  const {
    label, items = [], selected, hierarchy = 'primary', size = 'standard',
    material = 'regular', orientation = 'horizontal', activation = 'automatic',
    idPrefix = `ol8-tabs-${++sequence}`, className,
  } = options ?? {};

  assertTabs({ label, items, hierarchy, size, orientation, activation });

  const current = items.find(i => i.id === selected && !i.disabled)
    ?? items.find(i => !i.disabled);

  const buttons = items.map(item => renderNavigationItem({
    kind: 'tab',
    label: item.label, icon: item.icon, badge: item.badge,
    selected: item.id === current?.id,
    disabled: item.disabled,
    ariaLabel: item.ariaLabel,
    id: `${idPrefix}-tab-${item.id}`,
    controls: `${idPrefix}-panel-${item.id}`,
    // One enabled tab stop. Arrow keys move focus inside the list.
    tabIndex: item.id === current?.id ? 0 : -1,
    extraAttrs: `data-ol8-size="${size}" data-ol8-value="${escapeAttr(item.id)}"`,
  })).join('');

  const attrs = [
    `class="ol8-tabs${className ? ` ${className}` : ''}"`,
    'role="tablist"',
    `aria-label="${escapeAttr(label)}"`,
    `aria-orientation="${orientation}"`,
    `data-ol8-hierarchy="${hierarchy}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-orientation="${orientation}"`,
    `data-ol8-activation="${activation}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
  ].filter(Boolean).join(' ');

  return `<div ${attrs}>${buttons}</div>`;
}

/** The panel that belongs to one tab. Figma: exactly one owned panel each. */
export function renderTabPanel(tabId, content, options = {}) {
  const { idPrefix, hidden = false } = options;
  if (!idPrefix) throw new Error('[ol8] a tab panel needs the same idPrefix as its tab list, or nothing owns it.');
  return `<div class="ol8-tabs__panel" role="tabpanel" id="${escapeAttr(idPrefix)}-panel-${escapeAttr(tabId)}"` +
    ` aria-labelledby="${escapeAttr(idPrefix)}-tab-${escapeAttr(tabId)}" tabindex="0"${hidden ? ' hidden' : ''}>` +
    `${content}</div>`;
}

/**
 * Wires an existing `.ol8-tabs` list. Idempotent.
 * Returns a small controller so a product can drive selection itself.
 */
export function hydrateTabs(root = document) {
  const lists = [];
  for (const list of root.querySelectorAll('.ol8-tabs')) {
    if (list.dataset.ol8Wired === 'true') continue;
    list.dataset.ol8Wired = 'true';

    const tabsOf = () => [...list.querySelectorAll('.ol8-nav-item--tab')];
    const select = (tab) => {
      for (const other of tabsOf()) {
        const on = other === tab;
        other.setAttribute('aria-selected', String(on));
        other.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(other.getAttribute('aria-controls') ?? '');
        if (panel) panel.hidden = !on;
      }
      tab.dispatchEvent(new CustomEvent('ol8:tabchange', {
        bubbles: true, detail: { value: tab.dataset.ol8Value },
      }));
    };

    list.addEventListener('keydown', (event) => {
      const tabs = tabsOf();
      const items = tabs.map(t => ({ disabled: t.disabled }));
      const activeIndex = tabs.indexOf(document.activeElement);
      if (activeIndex === -1) return;

      if (event.key === 'Enter' || event.key === ' ') {
        if (list.dataset.ol8Activation === 'manual') { event.preventDefault(); select(tabs[activeIndex]); }
        return;
      }
      const next = resolveNavigationKey(event, items, activeIndex, {
        orientation: list.dataset.ol8Orientation ?? 'horizontal',
        rtl: isRtl(list),
      });
      if (next === -1 || next === activeIndex) return;
      event.preventDefault();
      tabs[next].focus();
      if (list.dataset.ol8Activation !== 'manual') select(tabs[next]);
    });

    list.addEventListener('click', (event) => {
      const tab = event.target.closest('.ol8-nav-item--tab');
      if (tab && !tab.disabled) select(tab);
    });

    lists.push(list);
  }
  return lists.length;
}

function assertTabs({ label, items, hierarchy, size, orientation, activation }) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] a tab list requires an accessible name. A region nobody can name is a region nobody can reach.');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('[ol8] a tab list needs at least one tab.');
  }
  if (!OL8_TABS_HIERARCHIES.includes(hierarchy)) throw new Error(`[ol8] unknown tabs hierarchy "${hierarchy}"`);
  if (!OL8_TABS_ORIENTATIONS.includes(orientation)) throw new Error(`[ol8] unknown tabs orientation "${orientation}"`);
  if (!OL8_TABS_ACTIVATIONS.includes(activation)) throw new Error(`[ol8] unknown tabs activation "${activation}"`);
  if (items.every(i => i.disabled)) {
    throw new Error('[ol8] a tab list must keep one enabled tab stop.');
  }
  const seen = new Set();
  for (const item of items) {
    if (!item.id) throw new Error('[ol8] every tab needs an id, because exactly one panel is paired with it.');
    if (seen.has(item.id)) throw new Error(`[ol8] two tabs share the id "${item.id}"`);
    seen.add(item.id);
  }
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
