import { createElement, useId } from 'react';
import { Icon } from '../atoms/Icon.js';
import { OL8_OPTION_SIZES } from '../foundations/geometry.js';

/**
 * MOLECULE. Never focusable. A listbox moves a virtual cursor with
 * aria-activedescendant while real focus stays on the combobox input, so this
 * carries no tabIndex. Options cannot be natively disabled, hence aria-disabled.
 */
export function SelectionOption({
  children, value, size = 'standard', selected = false, active = false,
  disabled = false, description, leadingIcon, id, focusRing = false, className = '', ...rest
}) {
  if (!OL8_OPTION_SIZES.includes(size)) throw new Error(`[ol8] unknown option size "${size}"`);
  const auto = useId();
  const optionId = id ?? `ol8-option-${auto}`;
  const labelId = `${optionId}-label`;
  const descId = description ? `${optionId}-desc` : undefined;
  // A div, not an li: the popup rail is a div with role="listbox", and an li
  // outside a list is invalid markup. The core renderer has always emitted a
  // div here; this had drifted.
  return createElement('div', {
    ...rest,
    className: `ol8-option${className ? ` ${className}` : ''}`,
    role: 'option', id: optionId,
    'data-ol8-size': size,
    'aria-selected': String(selected),
    'aria-labelledby': labelId,
    ...(descId ? { 'aria-describedby': descId } : {}),
    ...(disabled ? { 'aria-disabled': 'true' } : {}),
    ...(active ? { 'data-ol8-active': 'true' } : {}),
    ...(focusRing ? { 'data-ol8-focus-ring': 'true' } : {}),
    ...(value !== undefined ? { 'data-ol8-value': value } : {}),
  }, createElement('span', { className: 'ol8-option__surface' }, [
    leadingIcon ? createElement('span', { key: 'lead', className: 'ol8-option__leading' },
      createElement(Icon, { name: leadingIcon, size: 18 })) : null,
    createElement('span', { key: 'text', className: 'ol8-option__text' }, [
      createElement('span', { key: 'l', className: 'ol8-option__label', id: labelId }, children),
      description ? createElement('span', { key: 'd', className: 'ol8-option__description', id: descId }, description) : null,
    ]),
    selected ? createElement('span', { key: 'check', className: 'ol8-option__selected' },
      createElement(Icon, { name: 'check', size: 18 })) : null,
  ]));
}
