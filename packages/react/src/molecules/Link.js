import { createElement, forwardRef } from 'react';
import { OL8_LINK_FORMS, OL8_LINK_SIZES, OL8_LINK_MOTIONS } from '../foundations/geometry.js';

/**
 * MOLECULE. Figma's five States are visual evidence for review, never props:
 * :hover, :active, :focus-visible, :visited and [aria-current] carry them.
 * Icons are intentionally parked and must not be added as local artwork.
 */
export const Link = forwardRef(function Link({
  children, href, form = 'inline', size = 'standard', current, motion = 'system',
  className = '', ...rest
}, ref) {
  if (!OL8_LINK_FORMS.includes(form)) throw new Error(`[ol8] unknown link form "${form}"`);
  if (!OL8_LINK_SIZES.includes(size)) throw new Error(`[ol8] unknown link size "${size}"`);
  if (!OL8_LINK_MOTIONS.includes(motion)) throw new Error(`[ol8] unknown link motion "${motion}"`);
  if (typeof href !== 'string' || href === '') {
    throw new Error('[ol8] Link requires an href. A link without a destination is a button.');
  }
  if (current !== undefined && form !== 'navigation') {
    throw new Error('[ol8] aria-current belongs to a navigation link, not an inline or standalone one.');
  }

  return createElement('a', {
    ...rest, ref, href,
    className: `ol8-link${className ? ` ${className}` : ''}`,
    'data-ol8-form': form,
    'data-ol8-size': size,
    ...(motion === 'none' ? { 'data-ol8-motion': 'none' } : {}),
    ...(current ? { 'aria-current': current === true ? 'page' : String(current) } : {}),
  }, children);
});
