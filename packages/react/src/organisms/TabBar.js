import { createElement, forwardRef, useCallback } from 'react';
import { OL8_TAB_BAR_PRESENTATIONS, OL8_NAVIGATION_SIZES } from '../foundations/geometry.js';
import { NavigationItem } from '../molecules/NavigationItem.js';

/**
 * ORGANISM. Figma 701:460.
 *
 * "Production uses native destination links, requires a non empty navigation
 * name, resolves exactly one current destination, and rejects disabled pseudo
 * destinations."
 *
 * `onNavigate` lets a router take over without replacing link semantics: the
 * destination stays a real link, so opening in a new tab, copying the address
 * and middle clicking all keep working.
 */
export const TabBar = forwardRef(function TabBar({
  label, items = [], current, onNavigate,
  presentation = 'bottom', size = 'standard', material = 'regular',
  className = '', ...rest
}, ref) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] a tab bar requires a navigation name, so a person can tell one landmark from another.');
  }
  if (!OL8_TAB_BAR_PRESENTATIONS.includes(presentation)) throw new Error(`[ol8] unknown tab bar presentation "${presentation}"`);
  if (!OL8_NAVIGATION_SIZES.includes(size)) throw new Error(`[ol8] unknown tab bar size "${size}"`);
  if (!Array.isArray(items) || items.length === 0) throw new Error('[ol8] a tab bar needs at least one destination.');
  const seen = new Set();
  for (const item of items) {
    if (typeof item.href !== 'string' || item.href === '') {
      throw new Error('[ol8] every destination needs an href. A tab bar navigates, so it uses real links.');
    }
    if (item.disabled) {
      throw new Error('[ol8] a destination cannot be disabled. Remove the place rather than showing a door that does not open.');
    }
    if (seen.has(item.href)) throw new Error(`[ol8] two destinations share the href "${item.href}"`);
    seen.add(item.href);
  }
  if (current !== undefined && !seen.has(current)) {
    throw new Error(`[ol8] the current destination "${current}" is not one of the destinations listed.`);
  }

  const handleClick = useCallback((href) => (event) => {
    if (!onNavigate) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(href, event);
  }, [onNavigate]);

  // The spatial rail carries no labels, so a name has to come from somewhere.
  const iconOnly = presentation === 'spatial-rail';

  return createElement('nav', {
    ...rest, ref,
    className: `ol8-tab-bar${className ? ` ${className}` : ''}`,
    'aria-label': label,
    'data-ol8-presentation': presentation,
    'data-ol8-size': size,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
  }, items.map(item => createElement(NavigationItem, {
    key: item.href, kind: 'destination', size,
    label: iconOnly ? undefined : item.label,
    icon: item.icon, badge: item.badge, href: item.href,
    ariaLabel: item.ariaLabel ?? (iconOnly ? item.label : undefined),
    selected: item.href === current,
    onClick: handleClick(item.href),
  })));
});
