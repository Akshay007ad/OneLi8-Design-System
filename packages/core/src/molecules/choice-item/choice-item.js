/**
 * Oneli8 · Choice Item (MOLECULE) — headless behavior.
 *
 * Figma (252:301): "Native input, name/value, required, reset, form
 * submission, and onCheckedChange live in code." This module is that code —
 * and deliberately nothing more. It does not reimplement toggling, focus or
 * form participation; a real <input> already does all of it.
 *
 * The one thing that genuinely cannot be expressed in markup or CSS is
 * `indeterminate`, which is a JS-only property. That is why the Mixed state
 * needs hydration and the other states do not.
 */
import { renderSelectionIndicator } from '../../atoms/selection-indicator/selection-indicator.js';

export const OL8_CHOICE_KINDS = ['checkbox', 'radio', 'switch'];
export const OL8_CHOICE_SIZES = ['compact', 'standard', 'comfortable', 'large'];

/** The molecule's four sizes map onto the atom's two. */
export function indicatorSizeFor(size) {
  return size === 'comfortable' || size === 'large' ? 'comfortable' : 'compact';
}

/** Figma's Selection axis, derived from native input state. */
export function selectionStateFor(kind, { checked = false, mixed = false } = {}) {
  if (kind === 'checkbox') return mixed ? 'mixed' : checked ? 'checked' : 'unchecked';
  if (kind === 'radio') return checked ? 'selected' : 'unselected';
  return checked ? 'on' : 'off';
}

/**
 * @param {'checkbox'|'radio'|'switch'} kind
 * @param {string} label
 * @param {{size?:string,checked?:boolean,mixed?:boolean,disabled?:boolean,invalid?:boolean,
 *          description?:string,name?:string,value?:string,required?:boolean,
 *          id?:string,material?:string,className?:string}} [options]
 */
export function renderChoiceItem(kind, label, options = {}) {
  if (!OL8_CHOICE_KINDS.includes(kind)) throw new Error(`[ol8] unknown choice kind "${kind}"`);
  const {
    size = 'standard', checked = false, mixed = false, disabled = false, invalid = false,
    description, name, value, required = false, id, material = 'regular', className,
  } = options;

  if (!OL8_CHOICE_SIZES.includes(size)) throw new Error(`[ol8] unknown choice size "${size}"`);
  if (mixed && kind !== 'checkbox') throw new Error('[ol8] only a checkbox has a Mixed state');
  if (!label || !String(label).trim()) throw new Error('[ol8] Choice Item requires a label');

  const uid = id ?? `ol8-choice-${Math.random().toString(36).slice(2, 9)}`;
  const descId = description ? `${uid}-desc` : null;
  const selection = selectionStateFor(kind, { checked, mixed });

  const inputAttrs = [
    `type="${kind === 'radio' ? 'radio' : 'checkbox'}"`,
    kind === 'switch' ? 'role="switch"' : '',
    `class="ol8-choice__input"`,
    `id="${uid}"`,
    name ? `name="${escapeAttr(name)}"` : '',
    value !== undefined ? `value="${escapeAttr(value)}"` : '',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    required ? 'required' : '',
    invalid ? 'aria-invalid="true"' : '',
    descId ? `aria-describedby="${descId}"` : '',
  ].filter(Boolean).join(' ');

  const rowAttrs = [
    `class="ol8-choice ol8-choice--${kind}${className ? ` ${className}` : ''}"`,
    `for="${uid}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-kind="${kind}"`,
    `data-ol8-availability="${disabled ? 'disabled' : 'enabled'}"`,
    invalid ? 'data-ol8-invalid="true"' : '',
    mixed ? 'data-ol8-mixed="true"' : '',
    material === 'gem' ? 'data-ol8-material="gem"' : '',
  ].filter(Boolean).join(' ');

  const indicator = renderSelectionIndicator(kind, {
    selection, size: indicatorSizeFor(size), disabled,
  });

  return `<label ${rowAttrs}>` +
    `<input ${inputAttrs}>` +
    `<span class="ol8-choice__surface" aria-hidden="true"></span>` +
    `<span class="ol8-choice__indicator">${indicator}</span>` +
    `<span class="ol8-choice__content">` +
      `<span class="ol8-choice__label">${escapeText(label)}</span>` +
      (description ? `<span class="ol8-choice__description" id="${descId}">${escapeText(description)}</span>` : '') +
    `</span></label>`;
}

/**
 * Binds every `.ol8-choice` under `root`. Idempotent.
 * Applies `indeterminate` (JS-only) and keeps the indicator in step with the
 * input — including radios, where selecting one silently clears its siblings.
 */
export function hydrateChoiceItems(root = document) {
  const rows = [...root.querySelectorAll('.ol8-choice')];

  for (const row of rows) {
    const input = row.querySelector(':scope > .ol8-choice__input');
    if (!input) continue;

    input.indeterminate = row.dataset.ol8Mixed === 'true';
    syncIndicator(row);

    if (row.dataset.ol8ChoiceBound === 'true') continue;
    input.addEventListener('change', () => {
      // Any interaction resolves Mixed; the browser has already cleared
      // `indeterminate` on click, so mirror that in our own state.
      delete row.dataset.ol8Mixed;
      syncIndicator(row);
      // A radio turning on turns its whole group off — repaint the siblings.
      if (input.type === 'radio' && input.name) {
        for (const other of (row.ownerDocument ?? document)
          .querySelectorAll(`input.ol8-choice__input[type="radio"][name="${CSS.escape(input.name)}"]`)) {
          const otherRow = other.closest('.ol8-choice');
          if (otherRow && otherRow !== row) syncIndicator(otherRow);
        }
      }
    });
    row.dataset.ol8ChoiceBound = 'true';
  }
  return rows.length;
}

/** Repaints one row's indicator from the live state of its input. */
export function syncIndicator(row) {
  const input = row.querySelector(':scope > .ol8-choice__input');
  const slot = row.querySelector(':scope > .ol8-choice__indicator');
  if (!input || !slot) return;

  const kind = row.dataset.ol8Kind ?? 'checkbox';
  const selection = selectionStateFor(kind, { checked: input.checked, mixed: input.indeterminate });

  row.dataset.ol8Availability = input.disabled ? 'disabled' : 'enabled';
  slot.innerHTML = renderSelectionIndicator(kind, {
    selection,
    size: indicatorSizeFor(row.dataset.ol8Size ?? 'standard'),
    disabled: input.disabled,
  });
}

/** Sets the Mixed (indeterminate) state on a checkbox row. */
export function setChoiceMixed(row, mixed) {
  const input = row.querySelector(':scope > .ol8-choice__input');
  if (!input) return;
  input.indeterminate = !!mixed;
  if (mixed) row.dataset.ol8Mixed = 'true'; else delete row.dataset.ol8Mixed;
  syncIndicator(row);
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
