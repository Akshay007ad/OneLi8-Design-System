/**
 * Oneli8 · Selection Option (MOLECULE) — headless.
 *
 * Figma (570:122): "Description is associated through aria-describedby and
 * remains outside the option accessible name. Selection Popup composes this
 * owner; keyboard focus remains on the Combobox input through
 * aria-activedescendant."
 *
 * That single sentence sets the whole contract:
 *   - role="option", named by its LABEL only. The description is referenced,
 *     never nested into the name, so aria-labelledby points at the label and
 *     aria-describedby at the description.
 *   - the option is NOT focusable. No tabindex, ever. A listbox moves a
 *     virtual cursor with aria-activedescendant while real focus stays put.
 *   - "active" (the cursor) is distinct from "selected" (the data) and from
 *     :hover (the pointer), so it is its own attribute.
 *   - options cannot use the `disabled` attribute — it is not valid on <li> —
 *     so unavailability is aria-disabled.
 */
import { renderIcon, renderIconSvg, isOl8IconName } from '../../atoms/icon/icon.js';

export const OL8_OPTION_SIZES = ['standard', 'large'];

/**
 * @param {string} label
 * @param {{value?:string,size?:string,selected?:boolean,active?:boolean,disabled?:boolean,
 *          description?:string,leadingIcon?:string,id?:string,focusRing?:boolean,className?:string}} [options]
 */
export function renderSelectionOption(label, options = {}) {
  const {
    value, size = 'standard', selected = false, active = false, disabled = false,
    description, leadingIcon, id, focusRing = false, className,
  } = options;

  if (!OL8_OPTION_SIZES.includes(size)) throw new Error(`[ol8] unknown option size "${size}"`);
  if (!label || !String(label).trim()) throw new Error('[ol8] a selection option requires a label');
  if (leadingIcon && !isOl8IconName(leadingIcon)) throw new Error(`[ol8] unknown icon "${leadingIcon}"`);

  const uid = id ?? `ol8-option-${Math.random().toString(36).slice(2, 9)}`;
  const labelId = `${uid}-label`;
  const descId = description ? `${uid}-desc` : null;

  const attrs = [
    `class="ol8-option${className ? ` ${className}` : ''}"`,
    'role="option"',
    `id="${uid}"`,
    value !== undefined ? `data-ol8-value="${escapeAttr(value)}"` : '',
    `data-ol8-size="${size}"`,
    `aria-selected="${selected ? 'true' : 'false'}"`,
    active ? 'data-ol8-active="true"' : '',
    disabled ? 'aria-disabled="true"' : '',
    focusRing ? 'data-ol8-focus-ring="true"' : '',
    // Named by the label alone; the description is referenced, not nested.
    `aria-labelledby="${labelId}"`,
    descId ? `aria-describedby="${descId}"` : '',
  ].filter(Boolean).join(' ');

  const lead = leadingIcon ? renderIcon(leadingIcon, { size: 18 }) : '';
  const check = `<span class="ol8-option__check" aria-hidden="true">${selected ? renderIconSvg('check') : ''}</span>`;

  return `<li ${attrs}><span class="ol8-option__surface">` +
    lead +
    `<span class="ol8-option__text">` +
      `<span class="ol8-option__label" id="${labelId}">${escapeText(label)}</span>` +
      (description ? `<span class="ol8-option__description" id="${descId}">${escapeText(description)}</span>` : '') +
    `</span>` +
    check +
    `</span></li>`;
}

/** Flips one option's selected state and repaints its trailing check. */
export function setOptionSelected(option, selected) {
  option.setAttribute('aria-selected', selected ? 'true' : 'false');
  const check = option.querySelector('.ol8-option__check');
  if (check) check.innerHTML = selected ? renderIconSvg('check') : '';
}

/**
 * Moves the virtual cursor within a listbox: marks one option active and
 * points the controlling element's aria-activedescendant at it. Real focus is
 * never moved, which is the entire point of the pattern.
 */
export function setActiveOption(listbox, option, controller) {
  for (const other of listbox.querySelectorAll('.ol8-option[data-ol8-active="true"]')) {
    if (other !== option) delete other.dataset.ol8Active;
  }
  if (!option) {
    controller?.removeAttribute('aria-activedescendant');
    return;
  }
  option.dataset.ol8Active = 'true';
  controller?.setAttribute('aria-activedescendant', option.id);
  option.scrollIntoView({ block: 'nearest' });
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
