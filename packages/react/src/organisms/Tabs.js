import { createElement, forwardRef, useCallback, useId, useRef, useState } from 'react';
import { OL8_TABS_HIERARCHIES, OL8_TABS_ORIENTATIONS, OL8_TABS_ACTIVATIONS, OL8_NAVIGATION_SIZES } from '../foundations/geometry.js';
import { NavigationItem } from '../molecules/NavigationItem.js';

/**
 * ORGANISM. Figma 693:171.
 *
 * "Production emits tablist, tab and tabpanel, requires a non empty accessible
 * region name, retains one enabled Tab stop, mirrors horizontal Arrow keys in
 * RTL, and supports horizontal/vertical orientation plus automatic/manual
 * activation." Every clause is enforced here rather than described.
 *
 * Tabs owns the group. Consumers pass items and panels; they never assemble a
 * tablist by hand, which is what keeps selection and focus in one place.
 */
export const Tabs = forwardRef(function Tabs({
  label, items = [], value, defaultValue, onChange,
  hierarchy = 'primary', size = 'standard', material = 'regular',
  orientation = 'horizontal', activation = 'automatic',
  renderPanel, className = '', ...rest
}, ref) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] a tab list requires an accessible name. A region nobody can name is a region nobody can reach.');
  }
  if (!Array.isArray(items) || items.length === 0) throw new Error('[ol8] a tab list needs at least one tab.');
  if (!OL8_TABS_HIERARCHIES.includes(hierarchy)) throw new Error(`[ol8] unknown tabs hierarchy "${hierarchy}"`);
  if (!OL8_NAVIGATION_SIZES.includes(size)) throw new Error(`[ol8] unknown tabs size "${size}"`);
  if (!OL8_TABS_ORIENTATIONS.includes(orientation)) throw new Error(`[ol8] unknown tabs orientation "${orientation}"`);
  if (!OL8_TABS_ACTIVATIONS.includes(activation)) throw new Error(`[ol8] unknown tabs activation "${activation}"`);
  if (items.every(i => i.disabled)) throw new Error('[ol8] a tab list must keep one enabled tab stop.');
  const seen = new Set();
  for (const item of items) {
    if (!item.id) throw new Error('[ol8] every tab needs an id, because exactly one panel is paired with it.');
    if (seen.has(item.id)) throw new Error(`[ol8] two tabs share the id "${item.id}"`);
    seen.add(item.id);
  }

  const prefix = useId();
  const firstEnabled = items.find(i => !i.disabled);
  const [internal, setInternal] = useState(defaultValue ?? firstEnabled?.id);
  const selected = value ?? internal;
  const listRef = useRef(null);

  const select = useCallback((id) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }, [value, onChange]);

  const onKeyDown = useCallback((event) => {
    const buttons = [...(listRef.current?.querySelectorAll('.ol8-nav-item--tab') ?? [])];
    const at = buttons.indexOf(document.activeElement);
    if (at === -1) return;

    if (event.key === 'Enter' || event.key === ' ') {
      if (activation === 'manual') { event.preventDefault(); select(items[at].id); }
      return;
    }

    // "Mirrors horizontal Arrow keys in RTL": the browser's own direction
    // decides which physical key means forward.
    const rtl = getComputedStyle(listRef.current).direction === 'rtl';
    const forward = orientation === 'vertical' ? 'ArrowDown' : (rtl ? 'ArrowLeft' : 'ArrowRight');
    const back = orientation === 'vertical' ? 'ArrowUp' : (rtl ? 'ArrowRight' : 'ArrowLeft');

    let next = -1;
    if (event.key === 'Home') next = items.findIndex(i => !i.disabled);
    else if (event.key === 'End') next = items.map(i => !i.disabled).lastIndexOf(true);
    else if (event.key === forward || event.key === back) {
      const step = event.key === forward ? 1 : -1;
      // "Disabled choices are skipped by roving focus."
      for (let hop = 1; hop <= items.length; hop += 1) {
        const i = (at + step * hop + items.length * hop) % items.length;
        if (!items[i].disabled) { next = i; break; }
      }
    }
    if (next === -1 || next === at) return;
    event.preventDefault();
    buttons[next].focus();
    if (activation !== 'manual') select(items[next].id);
  }, [items, orientation, activation, select]);

  const list = createElement('div', {
    ...rest, ref: (node) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node); else if (ref) ref.current = node;
    },
    className: `ol8-tabs${className ? ` ${className}` : ''}`,
    role: 'tablist',
    'aria-label': label,
    'aria-orientation': orientation,
    'data-ol8-hierarchy': hierarchy,
    'data-ol8-size': size,
    'data-ol8-orientation': orientation,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    onKeyDown,
  }, items.map(item => createElement(NavigationItem, {
    key: item.id, kind: 'tab', size,
    label: item.label, icon: item.icon, badge: item.badge,
    ariaLabel: item.ariaLabel, disabled: item.disabled,
    selected: item.id === selected,
    id: `${prefix}-tab-${item.id}`,
    'aria-controls': `${prefix}-panel-${item.id}`,
    // One enabled tab stop; arrows move focus inside the list.
    tabIndex: item.id === selected ? 0 : -1,
    onClick: () => select(item.id),
  })));

  // "Every consuming composition must pair each item with exactly one owned panel."
  if (!renderPanel) return list;

  return createElement('div', { className: 'ol8-tabs__group' },
    list,
    items.map(item => createElement('div', {
      key: item.id,
      className: 'ol8-tabs__panel',
      role: 'tabpanel',
      id: `${prefix}-panel-${item.id}`,
      'aria-labelledby': `${prefix}-tab-${item.id}`,
      tabIndex: 0,
      hidden: item.id !== selected,
    }, renderPanel(item))),
  );
});
