/**
 * Oneli8 · Selection Indicator (ATOM) — headless.
 *
 * Presentational only. It renders the mark a checkbox, radio or switch shows;
 * it never owns state, role or focus. The native <input> in Choice Item does.
 *
 * Kept an atom by the project's rule that atoms compose no other component:
 * the check glyph is inlined as a path here rather than mounting the icon
 * component. renderIconSvg returns a markup string, not a component instance.
 */
import { renderIconSvg } from '../icon/icon.js';

export const OL8_SELECTION_KINDS = ['checkbox', 'radio', 'switch'];
export const OL8_SELECTION_SIZES = ['compact', 'comfortable'];

/** Figma's Selection axis, per kind. */
export const OL8_SELECTION_STATES = {
  checkbox: ['unchecked', 'checked', 'mixed'],
  radio: ['unselected', 'selected'],
  switch: ['off', 'on'],
};

/**
 * @param {'checkbox'|'radio'|'switch'} kind
 * @param {{selection?:string,size?:string,disabled?:boolean,icon?:string,className?:string}} [options]
 */
export function renderSelectionIndicator(kind, options = {}) {
  if (!OL8_SELECTION_KINDS.includes(kind)) throw new Error(`[ol8] unknown selection kind "${kind}"`);
  const states = OL8_SELECTION_STATES[kind];
  const { selection = states[0], size = 'compact', disabled = false, icon, className } = options;

  if (!states.includes(selection)) {
    throw new Error(`[ol8] "${selection}" is not a ${kind} selection state (${states.join(', ')})`);
  }
  if (!OL8_SELECTION_SIZES.includes(size)) throw new Error(`[ol8] unknown selection size "${size}"`);
  if (icon && kind !== 'switch') throw new Error('[ol8] only the switch thumb carries optional artwork');

  const attrs = [
    `class="ol8-selection ol8-selection--${kind}${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-selection="${selection}"`,
    `data-ol8-availability="${disabled ? 'disabled' : 'enabled'}"`,
    'aria-hidden="true"',
  ].join(' ');

  return `<span ${attrs}>${renderMark(kind, selection, icon)}</span>`;
}

function renderMark(kind, selection, icon) {
  if (kind === 'checkbox') {
    if (selection === 'checked') return `<span class="ol8-selection__mark">${renderIconSvg('check')}</span>`;
    if (selection === 'mixed') return '<span class="ol8-selection__mark"></span>';
    return '';
  }
  if (kind === 'radio') {
    return selection === 'selected' ? '<span class="ol8-selection__mark"></span>' : '';
  }
  // switch: the thumb is always present; artwork inside it is optional
  const art = icon ? `<span class="ol8-icon">${renderIconSvg(icon)}</span>` : '';
  return `<span class="ol8-selection__mark">${art}</span>`;
}
