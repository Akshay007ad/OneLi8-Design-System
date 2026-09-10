/**
 * Oneli8 · Selection Popup — headless behavior.
 *
 * Figma (574:534): "Width and Size govern layout only; content must be
 * canonical Selection Option instances. Runtime listbox naming, ownership,
 * scrolling, active descendant, grouped results, loading/empty/error statuses
 * and announcements live in code."
 *
 * So this module owns exactly those: the listbox and its name, the grouping,
 * the four statuses, and the rule that a status is never an option.
 */
import { renderSelectionOption } from '../../molecules/selection-option/index.js';
import { renderIcon } from '../../atoms/icon/index.js';

export const OL8_POPUP_WIDTHS = ['content', 'anchor', 'wide'];
export const OL8_POPUP_SIZES = ['standard', 'large'];

/** Empty query, no matches, loading, and retrieval failure are distinct conditions. */
export const OL8_POPUP_STATUSES = ['none', 'loading', 'empty', 'error'];

/**
 * @param {{
 *   id:string, label:string,
 *   options?:Array<{value:string,label:string,description?:string,leadingIcon?:string,disabled?:boolean,group?:string}>,
 *   selected?:string|string[], active?:string, width?:string, size?:string,
 *   status?:string, statusText?:string, multiple?:boolean, className?:string,
 * }} options
 */
export function renderSelectionPopup(options) {
  const {
    id, label, options: items = [], selected, active,
    width = 'anchor', size = 'standard', status = 'none', statusText,
    multiple = false, className,
  } = options ?? {};

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
  for (const item of items) {
    const name = item.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(item);
    else groups.push({ name, items: [item] });
  }

  const rail = groups.map((group, index) => {
    const groupId = group.name ? `${id}-group-${index}` : null;
    const rendered = group.items.map(item => renderSelectionOption(item.label, {
      value: item.value,
      size,
      selected: isSelected(item.value),
      active: item.value === active,
      disabled: item.disabled,
      description: item.description,
      leadingIcon: item.leadingIcon,
      id: `${id}-option-${item.value}`,
    })).join('');

    if (!group.name) return rendered;
    return `<div role="group" aria-labelledby="${escapeAttr(groupId)}">` +
      `<span class="ol8-popup__group-label" id="${escapeAttr(groupId)}">${escapeText(group.name)}</span>` +
      `${rendered}</div>`;
  }).join('');

  // A status is a region, never an option: "No results is never represented by
  // a selectable option."
  const statusRegion = status === 'none' ? '' :
    `<div class="ol8-popup__status" data-ol8-status="${status}" role="status" aria-live="polite">` +
    (status === 'loading' ? renderIcon('loading', { size: 18 }) : '') +
    (status === 'error' ? renderIcon('critical', { size: 18 }) : '') +
    `<span>${escapeText(statusText)}</span></div>`;

  const attrs = [
    `class="ol8-popup${className ? ` ${className}` : ''}"`,
    `data-ol8-width="${width}"`,
    `data-ol8-size="${size}"`,
  ].join(' ');

  return `<div ${attrs}>` +
    `<div class="ol8-popup__rail" role="listbox" id="${escapeAttr(id)}" aria-label="${escapeAttr(label)}"` +
    (multiple ? ' aria-multiselectable="true"' : '') +
    `>${rail}</div>` +
    statusRegion +
    `</div>`;
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
