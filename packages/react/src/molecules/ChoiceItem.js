import { createElement, forwardRef, useId } from 'react';
import { SelectionIndicator } from '../atoms/SelectionIndicator.js';
import { OL8_CHOICE_KINDS, OL8_CHOICE_SIZES, indicatorSizeFor, selectionStateFor } from '../foundations/geometry.js';

/**
 * MOLECULE. A real input owns state, focus and form participation; this never
 * reimplements toggling. `indeterminate` is the one thing markup cannot express,
 * so React sets it through a ref callback rather than an attribute.
 */
export const ChoiceItem = forwardRef(function ChoiceItem({
  kind, children, size = 'standard', checked, defaultChecked, mixed = false,
  disabled = false, invalid = false, description, name, value, required = false,
  material = 'regular', id, className = '', onChange, ...rest
}, ref) {
  if (!OL8_CHOICE_KINDS.includes(kind)) throw new Error(`[ol8] unknown choice kind "${kind}"`);
  if (!OL8_CHOICE_SIZES.includes(size)) throw new Error(`[ol8] unknown choice size "${size}"`);
  const auto = useId();
  const rowId = id ?? `ol8-choice-${auto}`;
  const descId = description ? `${rowId}-desc` : undefined;
  const isOn = checked ?? defaultChecked ?? false;

  return createElement('label', {
    className: `ol8-choice ol8-choice--${kind}${className ? ` ${className}` : ''}`,
    htmlFor: rowId,
    'data-ol8-size': size,
    'data-ol8-kind': kind,
    'data-ol8-availability': disabled ? 'disabled' : 'enabled',
    ...(invalid ? { 'data-ol8-validity': 'invalid' } : {}),
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
  }, [
    createElement('input', {
      key: 'input', ...rest,
      ref: (node) => {
        if (node) node.indeterminate = kind === 'checkbox' && mixed;
        if (typeof ref === 'function') ref(node); else if (ref) ref.current = node;
      },
      type: kind === 'radio' ? 'radio' : 'checkbox',
      className: 'ol8-choice__input', id: rowId, name, value, required, disabled, onChange,
      ...(checked !== undefined ? { checked } : defaultChecked !== undefined ? { defaultChecked } : {}),
      ...(descId ? { 'aria-describedby': descId } : {}),
      ...(invalid ? { 'aria-invalid': 'true' } : {}),
      ...(kind === 'switch' ? { role: 'switch' } : {}),
    }),
    createElement('span', { key: 'surface', className: 'ol8-choice__surface', 'aria-hidden': 'true' }),
    createElement('span', { key: 'indicator', className: 'ol8-choice__indicator' },
      createElement(SelectionIndicator, {
        kind, size: indicatorSizeFor(size), disabled,
        selection: selectionStateFor(kind, { checked: isOn, mixed }),
      })),
    createElement('span', { key: 'text', className: 'ol8-choice__text' }, [
      createElement('span', { key: 'label', className: 'ol8-choice__label' }, children),
      description ? createElement('span', { key: 'desc', className: 'ol8-choice__description', id: descId }, description) : null,
    ]),
  ]);
});
