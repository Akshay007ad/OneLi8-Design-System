import { createElement } from 'react';
import { IconGlyph } from './Icon.js';
import { OL8_SELECTION_KINDS, OL8_SELECTION_STATES } from '../foundations/geometry.js';

/**
 * Only the checked checkbox carries artwork. Mixed and selected are drawn by
 * CSS from the token geometry, and an unset control has no mark at all.
 */
function Mark({ kind, state, icon }) {
  if (kind === 'checkbox') {
    if (state === 'checked') return createElement('span', { className: 'ol8-selection__mark' }, createElement(IconGlyph, { name: 'check' }));
    if (state === 'mixed') return createElement('span', { className: 'ol8-selection__mark' });
    return null;
  }
  if (kind === 'radio') return state === 'selected' ? createElement('span', { className: 'ol8-selection__mark' }) : null;
  return createElement('span', { className: 'ol8-selection__mark' },
    icon ? createElement('span', { className: 'ol8-icon' }, createElement(IconGlyph, { name: icon })) : null);
}

/**
 * ATOM. Purely presentational: it draws the mark a checkbox, radio or switch
 * shows and owns no state, role or focus. The native input inside Choice Item
 * owns all of that.
 */
export function SelectionIndicator({ kind, selection, size = 'compact', disabled = false, icon, className = '', ...rest }) {
  if (!OL8_SELECTION_KINDS.includes(kind)) throw new Error(`[ol8] unknown selection kind "${kind}"`);
  const states = OL8_SELECTION_STATES[kind];
  const state = selection ?? states[0];
  if (!states.includes(state)) throw new Error(`[ol8] "${state}" is not a ${kind} selection state`);
  if (icon && kind !== 'switch') throw new Error('[ol8] only the switch thumb carries optional artwork');
  return createElement(
    'span',
    {
      ...rest,
      className: `ol8-selection ol8-selection--${kind}${className ? ` ${className}` : ''}`,
      'data-ol8-size': size,
      'data-ol8-selection': state,
      'data-ol8-availability': disabled ? 'disabled' : 'enabled',
      'aria-hidden': 'true',
    },
    createElement(Mark, { kind, state, icon })
  );
}
