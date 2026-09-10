import { createElement, forwardRef } from 'react';
import { Icon } from '../atoms/Icon.js';
import { assertVariant, artworkSizeForIconButton, OL8_ICON_BUTTON_SHAPES } from '../foundations/geometry.js';

/**
 * MOLECULE. Two boxes deliberately: the outer element is the protected target
 * and the inner surface is the visible box, so a Compact control still keeps a
 * 48px hit area. An accessible name is mandatory and enforced here.
 */
export const IconButton = forwardRef(function IconButton({
  icon, accessibleName, variant = 'primary', size = 'standard', shape = 'rounded',
  material = 'regular', loading = false, disabled = false, pressed,
  type = 'button', className = '', ...rest
}, ref) {
  assertVariant(variant, size, material);
  if (!OL8_ICON_BUTTON_SHAPES.includes(shape)) throw new Error(`[ol8] unknown icon button shape "${shape}"`);
  if (typeof accessibleName !== 'string' || accessibleName.trim() === '') {
    throw new Error('[ol8] IconButton requires accessibleName. An icon alone announces nothing.');
  }
  const inert = disabled || loading;
  return createElement('button', {
    ...rest, ref, type,
    className: `ol8-icon-btn ol8-icon-btn--${variant}${className ? ` ${className}` : ''}`,
    'data-ol8-size': size,
    'data-ol8-shape': shape,
    'aria-label': accessibleName,
    ...(inert ? { disabled: true } : {}),
    ...(loading ? { 'data-ol8-loading': 'true', 'aria-busy': 'true' } : {}),
    ...(pressed !== undefined ? { 'aria-pressed': String(pressed) } : {}),
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
  }, createElement('span', { className: 'ol8-icon-btn__surface' },
    createElement(Icon, { name: loading ? 'loading' : icon, size: artworkSizeForIconButton(size) })));
});
