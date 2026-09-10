import { createElement, forwardRef } from 'react';
import { Icon, IconGlyph } from '../atoms/Icon.js';
import { assertVariant, iconSizeForButton } from '../foundations/geometry.js';

/**
 * MOLECULE. Figma's six States are visual evidence for review, not classes.
 * In code they are :hover, :active, :focus-visible, [disabled] and
 * [data-ol8-loading]. There is no .ol8-btn--hover.
 */
export const Button = forwardRef(function Button({
  children, variant = 'primary', size = 'standard', material = 'regular',
  leadingIcon, trailingIcon, loading = false, disabled = false, pressed,
  fullWidth = false, href, type = 'button', className = '',
  keepLeadingIconWhileLoading = false, ...rest
}, ref) {
  assertVariant(variant, size, material);
  const isLink = typeof href === 'string';
  const inert = disabled || loading;
  const iconSize = iconSizeForButton(size);

  // The spinner takes the leading slot by default, so the control never shows
  // two competing leading glyphs and its width stays predictable.
  const content = [];
  if (loading) {
    if (keepLeadingIconWhileLoading && leadingIcon) {
      content.push(createElement(Icon, { key: 'leading', name: leadingIcon, size: iconSize }));
    }
    content.push(createElement('span', { key: 'spinner', className: 'ol8-btn__spinner ol8-icon', 'aria-hidden': 'true' },
      createElement(IconGlyph, { name: 'loading' })));
  } else if (leadingIcon) {
    content.push(createElement(Icon, { key: 'leading', name: leadingIcon, size: iconSize }));
  }
  content.push(createElement('span', { key: 'label', className: 'ol8-btn__label' }, children));
  if (trailingIcon) content.push(createElement(Icon, { key: 'trailing', name: trailingIcon, size: iconSize }));

  const shared = {
    ...rest, ref,
    className: `ol8-btn ol8-btn--${variant}${className ? ` ${className}` : ''}`,
    'data-ol8-size': size,
    ...(loading ? { 'data-ol8-loading': 'true', 'aria-busy': 'true' } : {}),
    ...(pressed !== undefined ? { 'aria-pressed': String(pressed) } : {}),
    ...(fullWidth ? { 'data-ol8-fullwidth': 'true' } : {}),
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    ...(loading && keepLeadingIconWhileLoading ? { 'data-ol8-loading-keep-icon': 'true' } : {}),
  };
  // A link cannot be natively disabled, so it leaves the tab order instead.
  return isLink
    ? createElement('a', { ...shared, ...(inert ? { role: 'button', 'aria-disabled': 'true', tabIndex: -1 } : { href }) }, content)
    : createElement('button', { ...shared, type, ...(inert ? { disabled: true } : {}) }, content);
});
