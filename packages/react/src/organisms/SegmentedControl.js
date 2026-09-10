import { createElement, forwardRef, useCallback, useRef, useState } from 'react';
import { OL8_SEGMENT_BEHAVIORS, OL8_SEGMENT_PRESENTATIONS, OL8_NAVIGATION_SIZES } from '../foundations/geometry.js';
import { NavigationItem } from '../molecules/NavigationItem.js';

/**
 * ORGANISM. Figma 698:4792.
 *
 * "Behavior is a consuming contract: single = Radio Group, multi = independent
 * Toggle Buttons, momentary = grouped actions." The contract says to declare
 * exactly one, so this component refuses to guess and checks that the shape of
 * `value` matches the behaviour that was declared.
 *
 * "Presentation never changes behavior", so nothing below reads presentation
 * except to decide how an item lays its own content out.
 */
export const SegmentedControl = forwardRef(function SegmentedControl({
  label, behavior, items = [], value, defaultValue, onChange,
  presentation = 'inset-fill', size = 'standard', material = 'regular',
  className = '', ...rest
}, ref) {
  if (typeof label !== 'string' || label === '') throw new Error('[ol8] a segmented control requires an accessible name.');
  if (!OL8_SEGMENT_BEHAVIORS.includes(behavior)) {
    throw new Error('[ol8] a segmented control must declare exactly one behavior: single, multi or momentary.');
  }
  if (!OL8_SEGMENT_PRESENTATIONS.includes(presentation)) throw new Error(`[ol8] unknown segmented control presentation "${presentation}"`);
  if (!OL8_NAVIGATION_SIZES.includes(size)) throw new Error(`[ol8] unknown segmented control size "${size}"`);
  if (!Array.isArray(items) || items.length === 0) throw new Error('[ol8] a segmented control needs at least one segment.');
  if (behavior === 'multi' && value !== undefined && !Array.isArray(value)) {
    throw new Error('[ol8] multi selection holds an array of values.');
  }
  if (behavior === 'single' && Array.isArray(value)) {
    throw new Error('[ol8] single selection holds one value, not an array.');
  }
  if (behavior === 'momentary' && (value !== undefined || defaultValue !== undefined)) {
    throw new Error('[ol8] a momentary control invokes an action and stores no selected state.');
  }

  const [internal, setInternal] = useState(defaultValue ?? (behavior === 'multi' ? [] : undefined));
  const current = value ?? internal;
  const groupRef = useRef(null);

  const isSelected = (id) => {
    if (behavior === 'momentary') return false;
    if (behavior === 'multi') return Array.isArray(current) && current.includes(id);
    return current === id;
  };

  const activate = useCallback((id) => {
    if (behavior === 'momentary') { onChange?.(id); return; }
    const next = behavior === 'multi'
      ? (Array.isArray(current) && current.includes(id)
          ? current.filter(v => v !== id)
          : [...(current ?? []), id])
      : id;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }, [behavior, current, value, onChange]);

  // Only single selection roves, because it is the only behaviour where the
  // group holds one value. Multi and momentary are ordinary buttons in a row.
  const onKeyDown = useCallback((event) => {
    if (behavior !== 'single') return;
    const buttons = [...(groupRef.current?.querySelectorAll('.ol8-nav-item--segment') ?? [])];
    const at = buttons.indexOf(document.activeElement);
    if (at === -1) return;
    const rtl = getComputedStyle(groupRef.current).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next = -1;
    if (event.key === 'Home') next = items.findIndex(i => !i.disabled);
    else if (event.key === 'End') next = items.map(i => !i.disabled).lastIndexOf(true);
    else if (event.key === forward || event.key === back) {
      const step = event.key === forward ? 1 : -1;
      for (let hop = 1; hop <= items.length; hop += 1) {
        const i = (at + step * hop + items.length * hop) % items.length;
        if (!items[i].disabled) { next = i; break; }
      }
    }
    if (next === -1 || next === at) return;
    event.preventDefault();
    buttons[next].focus();
    activate(items[next].id);
  }, [behavior, items, activate]);

  const iconOnly = presentation === 'icon-only';
  const layout = presentation === 'stacked-label' ? 'stacked' : 'inline';
  const focusStop = behavior === 'single'
    ? (items.find(i => isSelected(i.id) && !i.disabled) ?? items.find(i => !i.disabled))
    : null;

  return createElement('div', {
    ...rest, ref: (node) => {
      groupRef.current = node;
      if (typeof ref === 'function') ref(node); else if (ref) ref.current = node;
    },
    className: `ol8-segmented${className ? ` ${className}` : ''}`,
    role: behavior === 'single' ? 'radiogroup' : 'group',
    'aria-label': label,
    'data-ol8-presentation': presentation,
    'data-ol8-behavior': behavior,
    'data-ol8-size': size,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    onKeyDown,
  }, items.map(item => createElement(NavigationItem, {
    key: item.id, kind: 'segment', size, layout,
    label: iconOnly ? undefined : item.label,
    icon: item.icon, badge: item.badge,
    ariaLabel: item.ariaLabel ?? (iconOnly ? item.label : undefined),
    disabled: item.disabled,
    selected: isSelected(item.id),
    ...(focusStop ? { tabIndex: item.id === focusStop.id ? 0 : -1 } : {}),
    onClick: () => activate(item.id),
  })));
});
