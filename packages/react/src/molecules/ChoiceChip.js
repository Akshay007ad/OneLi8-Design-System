import { createElement, useId } from 'react';
import { IconGlyph } from '../atoms/Icon.js';
import { OL8_CHIP_SIZES } from '../foundations/geometry.js';

/**
 * MOLECULE. The Soft Hexagon, built the way Figma builds it: a fixed 12 unit
 * terminal, a rail that grows with the label, and a mirrored terminal. Only the
 * rail grows, so peer chips of any length keep one shoulder depth and angle.
 *
 * The terminal paths and the shape are private, as they are in Figma, where the
 * terminals are named "Private Geometry" and the contract says they are "not
 * published cap atoms, layer variants, or independently swappable components".
 * Token imports them from this module; the package index does not export them.
 *
 * One viewBox serves all four heights: read from Figma, every terminal path at
 * 30, 36 and 42 shares identical X values and Y values that are the same
 * fractions of the height, so stretching Y alone is exact.
 */
const TERMINAL_FILL =
  'M12 0 L8.96202541 0 C7.44303812 0 6.43037944 0.83333333 5.92405035 2.5 ' +
  'L0.45569618 12.5 C-0.15189877 13.75 -0.15189877 16.25 0.45569618 17.5 ' +
  'L5.92405035 27.5 C6.43037944 29.16666667 7.44303812 30 8.96202541 30 L12 30 Z';
const TERMINAL_EDGE =
  'M12 0 L8.96202541 0 C7.44303812 0 6.43037944 0.83333333 5.92405035 2.5 ' +
  'L0.45569618 12.5 C-0.15189877 13.75 -0.15189877 16.25 0.45569618 17.5 ' +
  'L5.92405035 27.5 C6.43037944 29.16666667 7.44303812 30 8.96202541 30 L12 30';

function Terminal({ uid, side }) {
  const clip = `${uid}-clip-${side}`;
  return createElement('svg', {
    className: `ol8-chip__terminal ol8-chip__terminal--${side}`,
    viewBox: '0 0 12 30', preserveAspectRatio: 'none',
    'aria-hidden': 'true', focusable: 'false',
  }, [
    createElement('clipPath', { key: 'c', id: clip }, createElement('path', { d: TERMINAL_FILL })),
    createElement('path', { key: 'fo', className: 'ol8-chip__focus-outer', d: TERMINAL_EDGE }),
    createElement('path', { key: 'fi', className: 'ol8-chip__focus-inner', d: TERMINAL_EDGE }),
    createElement('path', { key: 'f', className: 'ol8-chip__fill', d: TERMINAL_FILL }),
    createElement('path', { key: 'e', className: 'ol8-chip__edge', d: TERMINAL_EDGE, clipPath: `url(#${clip})` }),
  ]);
}

/**
 * The silhouette and its rail. Figma's "Choice Chip / Geometry Owner".
 * The mark follows the label, which is the anatomy the contract writes down as
 * "Label + optional Remove mark", and one position serves Check and Remove
 * alike so peer marks never end up on opposite sides.
 */
export function ChipShape({ uid, label, mark = null }) {
  return [
    createElement(Terminal, { key: 'l', uid, side: 'leading' }),
    createElement('span', { key: 'r', className: 'ol8-chip__rail' }, [
      createElement('span', { key: 'label', className: 'ol8-chip__label' }, label),
      mark,
    ]),
    createElement(Terminal, { key: 't', uid, side: 'trailing' }),
  ];
}

/**
 * A Choice Chip is a real checkbox. The contract is explicit that every picker
 * option is "a real Checkbox rendered with the approved quiet Choice Chip
 * appearance", with native checked state among the redundant cues, so selection
 * never rests on colour alone.
 */
export function ChoiceChip({
  children, size = 'standard', selected, defaultSelected, showMark = false,
  disabled = false, name, value, id, className = '', onChange, ...rest
}) {
  if (!OL8_CHIP_SIZES.includes(size)) throw new Error(`[ol8] unknown chip size "${size}"`);
  if (!children) throw new Error('[ol8] Choice Chip requires a label');
  const auto = useId();
  const uid = id ?? `ol8-chip-${auto}`;
  const isOn = selected ?? defaultSelected ?? false;

  return createElement('label', {
    className: `ol8-chip${className ? ` ${className}` : ''}`,
    htmlFor: uid,
    'data-ol8-size': size,
    'data-ol8-selection': isOn ? 'selected' : 'inactive',
    'data-ol8-availability': disabled ? 'disabled' : 'enabled',
  }, [
    createElement('input', {
      key: 'input', ...rest,
      type: 'checkbox', className: 'ol8-chip__input', id: uid, name, value, disabled, onChange,
      // A controlled chip with nothing listening is a display of state, not a
      // control. Saying so is what React asks for, and it is the truth: the
      // chip cannot change anything until someone handles the change.
      ...(selected !== undefined
        ? { checked: selected, ...(onChange ? {} : { readOnly: true }) }
        : defaultSelected !== undefined ? { defaultChecked: defaultSelected } : {}),
    }),
    createElement(ChipShape, {
      key: 'shape', uid, label: children,
      mark: showMark
        ? createElement('span', { key: 'mark', className: 'ol8-chip__mark', 'aria-hidden': 'true' },
            createElement(IconGlyph, { name: 'check' }))
        : null,
    }),
  ]);
}
