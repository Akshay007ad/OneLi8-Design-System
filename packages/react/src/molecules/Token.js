import { createElement, useId } from 'react';
import { IconGlyph } from '../atoms/Icon.js';
import { ChipShape } from './ChoiceChip.js';
import { OL8_TOKEN_SIZES, OL8_TOKEN_MARKS, resolveTokenMark } from '../foundations/geometry.js';

/**
 * MOLECULE. A committed value. It draws no silhouette of its own: Figma's Token
 * instantiates the Choice Chip Geometry Owner, and so does this. The one axis
 * it adds is the Mark.
 *
 * A Token is not a Choice Chip. A chip is a checkbox a person toggles; a token
 * is a value already committed, so it is ordinary content whose only
 * interactive part is the optional Remove button.
 */
export function Token({
  children, size = 'standard', selected = false, mark = 'auto', removable = true,
  removeLabel, onRemove, id, className = '', ...rest
}) {
  if (!OL8_TOKEN_SIZES.includes(size)) throw new Error(`[ol8] unknown token size "${size}"`);
  if (!OL8_TOKEN_MARKS.includes(mark)) throw new Error(`[ol8] unknown token mark "${mark}"`);
  if (!children) throw new Error('[ol8] Token requires a label');
  if (mark === 'remove' && !removable) {
    throw new Error('[ol8] mark "remove" offers a removal path a non removable token does not have');
  }
  const auto = useId();
  const uid = id ?? `ol8-token-${auto}`;
  const resolved = resolveTokenMark(mark, { removable, selected });

  // The label stays the token's content: the contract requires the complete
  // value to remain readable, never shortened or overlaid by its mark.
  const markup = resolved === 'remove'
    ? createElement('button', {
        key: 'mark', type: 'button', className: 'ol8-chip__mark ol8-token__remove',
        'aria-label': removeLabel ?? `Remove ${children}`, onClick: onRemove,
      }, createElement(IconGlyph, { name: 'close' }))
    : resolved === 'check'
      ? createElement('span', { key: 'mark', className: 'ol8-chip__mark', 'aria-hidden': 'true' },
          createElement(IconGlyph, { name: 'check' }))
      : null;

  return createElement('span', {
    ...rest,
    className: `ol8-token ol8-chip${className ? ` ${className}` : ''}`,
    'data-ol8-size': size,
    'data-ol8-selection': selected ? 'selected' : 'inactive',
    'data-ol8-mark': resolved,
  }, createElement(ChipShape, { uid, label: children, mark: markup }));
}
