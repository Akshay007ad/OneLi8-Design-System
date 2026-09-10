import { createElement, forwardRef } from 'react';

/**
 * ATOM. Figma 989:484: "Content comes from item.badge; geometry and colors are
 * semantic token controlled." One atom serves all three navigation organisms.
 *
 * The count sits beside a label that already names the destination, so it is
 * not announced twice. A product that needs it announced spells it into the
 * item's own accessible name.
 */
export const NavigationBadge = forwardRef(function NavigationBadge({ children, className = '', ...rest }, ref) {
  if (children === undefined || children === null || children === '') {
    throw new Error('[ol8] a navigation badge with nothing to say should not be rendered at all.');
  }
  return createElement('span', {
    ...rest, ref, 'aria-hidden': 'true',
    className: `ol8-nav-badge${className ? ` ${className}` : ''}`,
  }, children);
});
