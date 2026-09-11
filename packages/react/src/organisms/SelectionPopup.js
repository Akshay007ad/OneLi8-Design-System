import { createElement } from 'react';
import { Icon } from '../atoms/Icon.js';
import { SelectionOption } from '../molecules/SelectionOption.js';
import { OL8_POPUP_WIDTHS, OL8_POPUP_SIZES, OL8_POPUP_STATUSES } from '../foundations/geometry.js';

/**
 * ORGANISM. The option collection a Select, Combobox or Multi-select Field
 * points at. It owns no focus: a listbox moves a virtual cursor with
 * aria-activedescendant while real focus stays on the input that owns it.
 *
 * A status is a region, never an option, because "No results" is not something
 * a person can choose.
 */
export function SelectionPopup({
  id, label, options = [], selected, active, width = 'anchor', size = 'standard',
  status = 'none', statusText, multiple = false, className = '', ...rest
}) {
  if (!id) throw new Error('[ol8] a selection popup needs an id, because the combobox that owns it points at it.');
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] a listbox requires an accessible name, distinct from the value it holds.');
  }
  if (!OL8_POPUP_WIDTHS.includes(width)) throw new Error(`[ol8] unknown popup width "${width}"`);
  if (!OL8_POPUP_SIZES.includes(size)) throw new Error(`[ol8] unknown popup size "${size}"`);
  if (!OL8_POPUP_STATUSES.includes(status)) throw new Error(`[ol8] unknown popup status "${status}"`);
  if (status !== 'none' && !statusText) {
    throw new Error('[ol8] a popup status needs words. A spinner alone tells a screen reader nothing.');
  }

  const isSelected = (value) => Array.isArray(selected) ? selected.includes(value) : selected === value;

  // Grouped results keep their source order; grouping never reorders matches.
  const groups = [];
  for (const item of options) {
    const name = item.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(item);
    else groups.push({ name, items: [item] });
  }

  const rail = groups.map((group, index) => {
    const groupId = group.name ? `${id}-group-${index}` : null;
    const rendered = group.items.map(item => createElement(SelectionOption, {
      key: item.value, value: item.value, size,
      selected: isSelected(item.value), active: item.value === active,
      disabled: item.disabled, description: item.description,
      leadingIcon: item.leadingIcon, id: `${id}-option-${item.value}`,
    }, item.label));
    if (!group.name) return rendered;
    return createElement('div', { key: `g${index}`, role: 'group', 'aria-labelledby': groupId }, [
      createElement('span', { key: 'l', className: 'ol8-popup__group-label', id: groupId }, group.name),
      ...rendered,
    ]);
  });

  return createElement('div', {
    ...rest,
    className: `ol8-popup${className ? ` ${className}` : ''}`,
    'data-ol8-width': width, 'data-ol8-size': size,
  }, [
    createElement('div', {
      key: 'rail', className: 'ol8-popup__rail', role: 'listbox', id, 'aria-label': label,
      ...(multiple ? { 'aria-multiselectable': 'true' } : {}),
    }, rail),
    status === 'none' ? null : createElement('div', {
      key: 'status', className: 'ol8-popup__status', 'data-ol8-status': status,
      role: 'status', 'aria-live': 'polite',
    }, [
      status === 'loading' ? createElement(Icon, { key: 'i', name: 'loading', size: 18 }) : null,
      status === 'error' ? createElement(Icon, { key: 'i', name: 'critical', size: 18 }) : null,
      createElement('span', { key: 's' }, statusText),
    ]),
  ]);
}
