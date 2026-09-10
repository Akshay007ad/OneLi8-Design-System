/**
 * Oneli8 · Segmented Control — headless behavior.
 *
 * Figma (698:4792): "Behavior is a consuming contract: single = Radio Group,
 * multi = independent Toggle Buttons, momentary = grouped actions."
 *
 * The contract says to declare exactly one behaviour, so this module refuses to
 * guess: behaviour is required, and the shape of `selected` must match it.
 * "Presentation never changes behavior", so nothing below reads presentation.
 */
import { renderNavigationItem } from '../../molecules/navigation-item/index.js';
import { resolveNavigationKey, isRtl } from '../navigation-keys.js';

export const OL8_SEGMENT_BEHAVIORS = ['single', 'multi', 'momentary'];
export const OL8_SEGMENT_PRESENTATIONS = [
  'inset-fill', 'line-indicator', 'outlined-selection', 'soft-pill', 'icon-only', 'stacked-label',
];

/**
 * @param {{
 *   label:string, behavior:string,
 *   items:Array<{id:string,label?:string,icon?:string,badge?:any,disabled?:boolean,ariaLabel?:string}>,
 *   selected?:string|string[], presentation?:string, size?:string, material?:string, className?:string,
 * }} options
 */
export function renderSegmentedControl(options) {
  const {
    label, behavior, items = [], selected,
    presentation = 'inset-fill', size = 'standard', material = 'regular', className,
  } = options ?? {};

  assertSegmentedControl({ label, behavior, items, selected, presentation });

  const isSelected = (id) => {
    if (behavior === 'momentary') return false;
    if (behavior === 'multi') return Array.isArray(selected) && selected.includes(id);
    return selected === id;
  };

  // Icon only and stacked label are presentations, so they change how the item
  // lays out its content, never what the item means.
  const layout = presentation === 'stacked-label' ? 'stacked' : 'inline';
  const iconOnly = presentation === 'icon-only';

  const firstEnabled = items.find(i => !i.disabled);
  const focusStop = behavior === 'single'
    ? (items.find(i => isSelected(i.id) && !i.disabled) ?? firstEnabled)
    : null;

  const segments = items.map(item => renderNavigationItem({
    kind: 'segment',
    label: iconOnly ? undefined : item.label,
    icon: item.icon,
    badge: item.badge,
    layout,
    selected: isSelected(item.id),
    disabled: item.disabled,
    ariaLabel: item.ariaLabel ?? (iconOnly ? item.label : undefined),
    extraAttrs: `data-ol8-size="${size}" data-ol8-value="${escapeAttr(item.id)}"`
      // Single selection keeps one focus stop, the way a radio group does.
      + (focusStop ? ` tabindex="${item.id === focusStop.id ? 0 : -1}"` : ''),
  })).join('');

  const attrs = [
    `class="ol8-segmented${className ? ` ${className}` : ''}"`,
    behavior === 'single' ? 'role="radiogroup"' : 'role="group"',
    `aria-label="${escapeAttr(label)}"`,
    `data-ol8-presentation="${presentation}"`,
    `data-ol8-behavior="${behavior}"`,
    `data-ol8-size="${size}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
  ].filter(Boolean).join(' ');

  return `<div ${attrs}>${segments}</div>`;
}

/** Wires an existing `.ol8-segmented` group. Idempotent. */
export function hydrateSegmentedControls(root = document) {
  let count = 0;
  for (const group of root.querySelectorAll('.ol8-segmented')) {
    if (group.dataset.ol8Wired === 'true') continue;
    group.dataset.ol8Wired = 'true';
    count += 1;

    const behavior = group.dataset.ol8Behavior;
    const segmentsOf = () => [...group.querySelectorAll('.ol8-nav-item--segment')];

    const announce = (segment) => segment.dispatchEvent(new CustomEvent('ol8:segmentchange', {
      bubbles: true,
      detail: {
        value: segment.dataset.ol8Value,
        selected: segmentsOf().filter(s => s.getAttribute('aria-pressed') === 'true').map(s => s.dataset.ol8Value),
      },
    }));

    group.addEventListener('click', (event) => {
      const segment = event.target.closest('.ol8-nav-item--segment');
      if (!segment || segment.disabled) return;

      if (behavior === 'momentary') { announce(segment); return; }
      if (behavior === 'multi') {
        segment.setAttribute('aria-pressed', String(segment.getAttribute('aria-pressed') !== 'true'));
        announce(segment);
        return;
      }
      for (const other of segmentsOf()) {
        const on = other === segment;
        other.setAttribute('aria-pressed', String(on));
        other.tabIndex = on ? 0 : -1;
      }
      announce(segment);
    });

    // Only single selection roves, because that is the only behaviour where the
    // group holds one value. Multi and momentary are ordinary buttons in a row.
    if (behavior !== 'single') continue;
    group.addEventListener('keydown', (event) => {
      const segments = segmentsOf();
      const activeIndex = segments.indexOf(document.activeElement);
      if (activeIndex === -1) return;
      const next = resolveNavigationKey(event, segments.map(s => ({ disabled: s.disabled })), activeIndex, {
        orientation: 'horizontal', rtl: isRtl(group),
      });
      if (next === -1 || next === activeIndex) return;
      event.preventDefault();
      segments[next].focus();
      segments[next].click();
    });
  }
  return count;
}

function assertSegmentedControl({ label, behavior, items, selected, presentation }) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] a segmented control requires an accessible name.');
  }
  if (!OL8_SEGMENT_BEHAVIORS.includes(behavior)) {
    throw new Error('[ol8] a segmented control must declare exactly one behavior: single, multi or momentary.');
  }
  if (!OL8_SEGMENT_PRESENTATIONS.includes(presentation)) {
    throw new Error(`[ol8] unknown segmented control presentation "${presentation}"`);
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('[ol8] a segmented control needs at least one segment.');
  }
  if (behavior === 'multi' && selected !== undefined && !Array.isArray(selected)) {
    throw new Error('[ol8] multi selection holds an array of values.');
  }
  if (behavior === 'single' && Array.isArray(selected)) {
    throw new Error('[ol8] single selection holds one value, not an array.');
  }
  if (behavior === 'momentary' && selected !== undefined) {
    throw new Error('[ol8] a momentary control invokes an action and stores no selected state.');
  }
  const seen = new Set();
  for (const item of items) {
    if (!item.id) throw new Error('[ol8] every segment needs an id.');
    if (seen.has(item.id)) throw new Error(`[ol8] two segments share the id "${item.id}"`);
    seen.add(item.id);
  }
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
