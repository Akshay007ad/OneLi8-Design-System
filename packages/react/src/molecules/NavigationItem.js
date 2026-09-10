import { createElement, forwardRef } from 'react';
import { Icon } from '../atoms/Icon.js';
import { NavigationBadge } from '../atoms/NavigationBadge.js';

/**
 * The shared internal molecule behind Tabs, Segmented Control and Tab Bar.
 * Figma draws it three times (688:51, 695:167, 700:292); it is one molecule
 * with three selection languages. The navigation contract keeps it internal, so
 * it is not exported from the package index.
 */
export const NavigationItem = forwardRef(function NavigationItem({
  kind, label, icon, badge, layout = 'inline', size = 'standard',
  selected = false, disabled = false, ariaLabel, href, ...rest
}, ref) {
  if (!label && !icon) throw new Error('[ol8] a navigation item needs a label, an icon, or both.');
  if (!label && !ariaLabel) {
    throw new Error('[ol8] an icon only navigation item requires an ariaLabel, since a glyph is not a name.');
  }
  if (kind === 'destination' && disabled) {
    throw new Error('[ol8] a destination cannot be disabled. A place a person cannot go does not belong in navigation.');
  }

  const content = createElement('span', { className: 'ol8-nav-item__content' },
    icon ? createElement(Icon, { key: 'i', name: icon, size: 18, className: 'ol8-nav-item__icon' }) : null,
    label ? createElement('span', { key: 'l', className: 'ol8-nav-item__label' }, label) : null,
    badge !== undefined && badge !== null && badge !== ''
      ? createElement(NavigationBadge, { key: 'b' }, badge) : null,
  );

  const shared = {
    ...rest, ref,
    className: `ol8-nav-item ol8-nav-item--${kind}`,
    'data-ol8-layout': layout,
    'data-ol8-size': size,
    'aria-label': ariaLabel,
  };

  if (kind === 'destination') {
    if (typeof href !== 'string' || href === '') {
      throw new Error('[ol8] a destination requires an href. Tab Bar navigates, so it uses real links.');
    }
    return createElement('a', { ...shared, href, 'aria-current': selected ? 'page' : undefined }, content);
  }

  return createElement('button', {
    ...shared, type: 'button', disabled,
    ...(kind === 'tab'
      ? { role: 'tab', 'aria-selected': selected }
      : { 'aria-pressed': selected }),
  },
    content,
    // Always present, so selecting does not change the box.
    kind === 'tab' ? createElement('span', { key: 'ind', className: 'ol8-nav-item__indicator', 'aria-hidden': 'true' }) : null,
  );
});
