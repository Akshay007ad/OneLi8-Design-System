/**
 * Oneli8 · Multi-select Field (ORGANISM)
 *
 * Figma: Select and Combobox
 *   Organism / Multi-select Field / Outline · Soft Hexagon 904:2507 (16)
 *   Organism / Multi-select Field / Filled  · Soft Hexagon 978:4472 (16)
 *
 * From the Figma description:
 *   "Outline multi-select organism built from canonical Text Field, Token,
 *    Input Text, and Suggestion Popup owners. Size propagates through all
 *    children." The Filled set adds: "Same atomic composition and size
 *    behavior as Outline; only the canonical field appearance owner changes."
 *
 * That last sentence is why this is ONE component with an appearance axis
 * rather than two. The two Figma sets differ by which field owner they
 * instantiate, and in code that owner is the same stylesheet reading one
 * attribute.
 *
 * WHAT FIGMA DRAWS AND WHAT IT DOES NOT
 * In Figma the tokens are absolutely positioned over the field shell, because
 * a design file draws a picture of a filled field rather than a layout that
 * reflows. The real layout comes from the contract: tokens and the editable
 * input share one wrapping row, "the field starts at its approved Text Field
 * minimum height and grows in 6px or 12px-aligned increments as tokens wrap",
 * and "it never compresses tokens to preserve one nominal row".
 *
 * WHY THE TOKENS ARE NOT A LIST
 * The committed values and the input have to wrap as one run, so they must be
 * siblings in one flex container. Wrapping a <ul> around the tokens would make
 * the whole collection a single flex item that cannot share rows with the
 * input. The order is still truthful, every token carries its own labelled
 * Remove button, and changes are announced through the live region.
 */
import { renderToken } from '../../molecules/token/token.js';
import { renderSelectionPopup } from '../selection-popup/selection-popup.js';

export const OL8_MULTI_SELECT_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_MULTI_SELECT_APPEARANCES = ['outline', 'filled'];
export const OL8_MULTI_SELECT_MATERIALS = ['regular', 'gem'];
/** Constrained resolves from a known set; suggestive may also author values. */
export const OL8_VALUE_POLICIES = ['constrained', 'suggestive'];

/**
 * A committed value may be given as a bare string. In a constrained field that
 * string is an option's value, so the token must show that option's label: a
 * field holding "ui" reads "Interface", never "ui". Only a value with no
 * matching option falls back to showing itself, which is what a suggestive
 * field's authored entries are.
 */
const toEntry = (v, options) => {
  if (typeof v !== 'string') return v;
  const match = options.find(o => o.value === v);
  return match ? { value: match.value, label: match.label } : { value: v, label: v };
};

/**
 * @param {{
 *   label:string, id?:string, name?:string,
 *   values?:Array<string|{value:string,label:string}>,
 *   options?:Array<{value:string,label:string,description?:string,disabled?:boolean}>,
 *   valuePolicy?:string, size?:string, appearance?:string, material?:string,
 *   expanded?:boolean, inputValue?:string, placeholder?:string,
 *   maximumValues?:number, allowDuplicates?:boolean,
 *   showLabel?:boolean, required?:boolean, disabled?:boolean, readOnly?:boolean,
 *   invalid?:boolean, instruction?:string, message?:string, messageTone?:string,
 *   status?:string, statusText?:string, className?:string,
 * }} options
 */
export function renderMultiSelectField(options = {}) {
  const {
    label, id, name,
    values = [], options: items = [],
    valuePolicy = 'constrained', size = 'comfortable',
    appearance = 'outline', material = 'regular',
    expanded = false, inputValue = '', placeholder,
    maximumValues, allowDuplicates = false,
    showLabel = true, required = false, disabled = false, readOnly = false,
    invalid = false, instruction, message, messageTone = 'critical',
    status = 'none', statusText, className,
  } = options;

  if (!label || !String(label).trim()) throw new Error('[ol8] a Multi-select Field requires a label');
  if (!OL8_MULTI_SELECT_SIZES.includes(size)) throw new Error(`[ol8] unknown size "${size}"`);
  if (!OL8_MULTI_SELECT_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown appearance "${appearance}"`);
  if (!OL8_MULTI_SELECT_MATERIALS.includes(material)) throw new Error(`[ol8] unknown material "${material}"`);
  if (!OL8_VALUE_POLICIES.includes(valuePolicy)) throw new Error(`[ol8] unknown value policy "${valuePolicy}"`);
  if (readOnly && invalid) {
    throw new Error('[ol8] a read only field cannot be invalid, because nobody can act on the message');
  }

  const committed = values.map(v => toEntry(v, items));

  // "Constrained mode cannot create a non-option token."
  if (valuePolicy === 'constrained' && items.length) {
    const known = new Set(items.map(o => o.value));
    const stray = committed.find(v => !known.has(v.value));
    if (stray) {
      throw new Error(`[ol8] "${stray.value}" is not one of the options, and a constrained field may not hold an authored value`);
    }
  }
  // "A duplicate is prevented or surfaced according to policy; it is never
  //  added invisibly."
  if (!allowDuplicates) {
    const seen = new Set();
    for (const v of committed) {
      if (seen.has(v.value)) throw new Error(`[ol8] "${v.value}" is committed twice and allowDuplicates is false`);
      seen.add(v.value);
    }
  }
  if (maximumValues !== undefined && committed.length > maximumValues) {
    throw new Error(`[ol8] ${committed.length} values exceed the maximum of ${maximumValues}`);
  }

  const uid = id ?? `ol8-multiselect-${Math.random().toString(36).slice(2, 9)}`;
  const popupId = `${uid}-popup`;
  const statusId = `${uid}-status`;
  const instructionId = instruction ? `${uid}-instruction` : null;
  const messageId = message ? `${uid}-message` : null;
  const full = maximumValues !== undefined && committed.length >= maximumValues;

  // Tokens carry the field's size. A read only field's values are labelled
  // content, so they lose the Remove path rather than keeping a dead button.
  const tokens = committed.map((v, i) => renderToken(v.label, {
    size,
    selected: true,
    mark: readOnly || disabled ? 'none' : 'remove',
    removable: !(readOnly || disabled),
    focusable: false,
    id: `${uid}-token-${i}`,
    className: 'ol8-multiselect__token',
  })).join('');

  const describedBy = [instructionId, messageId, statusId].filter(Boolean).join(' ');

  const input =
    `<input class="ol8-field__input ol8-multiselect__input" id="${uid}"` +
    (name ? ` name="${escapeAttr(name)}"` : '') +
    ` type="text" role="combobox" aria-expanded="${expanded}" aria-controls="${popupId}"` +
    ` aria-autocomplete="list" aria-haspopup="listbox"` +
    (showLabel ? '' : ` aria-label="${escapeAttr(label)}"`) +
    ` value="${escapeAttr(inputValue)}"` +
    (placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : '') +
    (required ? ' required' : '') + (disabled ? ' disabled' : '') + (readOnly ? ' readonly' : '') +
    (invalid ? ' aria-invalid="true"' : '') +
    (messageId ? ` aria-errormessage="${messageId}"` : '') +
    (describedBy ? ` aria-describedby="${describedBy}"` : '') +
    '>';

  const control =
    `<div class="ol8-field__control ol8-multiselect__control">${tokens}${input}</div>`;

  // Figma's root is a vertical stack of the field composition and the popup,
  // twelve apart. The field group keeps its own six unit internal stack, so the
  // two gaps stay separate things rather than one compromise.
  const rootAttrs = [
    `class="ol8-multiselect${className ? ` ${className}` : ''}"`,
    `data-ol8-expanded="${expanded}"`,
    `data-ol8-value-policy="${valuePolicy}"`,
    disabled ? 'data-ol8-availability="disabled"' : '',
    readOnly ? 'data-ol8-readonly="true"' : '',
    full ? 'data-ol8-full="true"' : '',
  ].filter(Boolean).join(' ');

  const fieldAttrs = [
    'class="ol8-field ol8-multiselect__field"',
    `data-ol8-size="${size}"`,
    `data-ol8-appearance="${appearance}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
    invalid ? 'data-ol8-validity="invalid"' : '',
    disabled ? 'data-ol8-availability="disabled"' : '',
  ].filter(Boolean).join(' ');

  return `<div ${rootAttrs}>` +
    `<div ${fieldAttrs}>` +
      (showLabel
        ? `<div class="ol8-field__label-row">` +
          `<label class="ol8-field__label" for="${uid}">${escapeText(label)}</label>` +
          (required ? `<span class="ol8-field__requirement" aria-hidden="true">*</span>` : '') +
          `</div>`
        : '') +
      `<div class="ol8-field__control-stack">${control}</div>` +
      (instruction ? `<div class="ol8-field__instruction" id="${instructionId}">${escapeText(instruction)}</div>` : '') +
      (message
        ? `<div class="ol8-field__supporting"><span class="ol8-field__message" id="${messageId}"` +
          ` data-ol8-tone="${escapeAttr(messageTone)}" role="${messageTone === 'critical' ? 'alert' : 'status'}">` +
          `${escapeText(message)}</span></div>`
        : '') +
    `</div>` +
    (expanded
      ? renderSelectionPopup({
          id: popupId, label, options: items, multiple: true,
          selected: committed.map(v => v.value),
          width: 'anchor', size: size === 'large' ? 'large' : 'standard',
          status, statusText, className: 'ol8-multiselect__popup',
        })
      : `<div id="${popupId}" hidden></div>`) +
    // Selection and removal are announced here, with the remaining count, so a
    // screen reader hears the result rather than inferring it from the DOM.
    `<span class="ol8-multiselect__status" id="${statusId}" role="status" aria-live="polite">` +
      (full ? `Maximum of ${maximumValues} reached` : '') +
    `</span>` +
    `</div>`;
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/**
 * Binds every field under `root`. Idempotent.
 *
 * This implements the keyboard model the contract writes down, which is the
 * part of a multi value field that markup cannot express:
 *
 *   - Tab enters at the input. Tokens are not tab stops, so their Remove
 *     buttons are reached with arrows instead.
 *   - With the caret at logical start, Left walks back through the committed
 *     values and Right walks forward and returns to the input. This uses
 *     logical order rather than screen direction, so it is already correct
 *     in a right to left document.
 *   - Backspace on an empty query activates the preceding token; a second
 *     Backspace or Delete removes it. Two steps, so one stray key cannot
 *     silently drop a value.
 *   - Escape cancels an active token preview and never clears the field.
 *
 * Removal dispatches `ol8:removevalue` rather than mutating the DOM, because
 * the values belong to the application. The event is cancelable: call
 * preventDefault to keep the token.
 */
export function hydrateMultiSelectFields(root = document) {
  const fields = [...root.querySelectorAll('.ol8-multiselect')];

  for (const field of fields) {
    if (field.dataset.ol8MultiselectBound === 'true') continue;
    const input = field.querySelector(':scope .ol8-multiselect__input');
    if (!input) continue;

    const tokens = () => [...field.querySelectorAll(':scope .ol8-multiselect__token')];
    const atStart = () => input.selectionStart === 0 && input.selectionEnd === 0;

    const activate = (token) => {
      for (const other of tokens()) delete other.dataset.ol8Active;
      if (!token) return;
      token.dataset.ol8Active = 'true';
      const button = token.querySelector('.ol8-token__remove');
      if (button) button.focus();
    };
    const clearActive = () => {
      for (const token of tokens()) delete token.dataset.ol8Active;
    };
    const remove = (token) => {
      const button = token.querySelector('.ol8-token__remove');
      const label = token.querySelector('.ol8-chip__label');
      const detail = { value: label ? label.textContent : null, token };
      const proceed = field.dispatchEvent(
        new CustomEvent('ol8:removevalue', { detail, bubbles: true, cancelable: true }));
      if (!proceed) return;
      const list = tokens();
      const next = list[list.indexOf(token) + 1] ?? null;
      announce(field, `${detail.value} removed, ${list.length - 1} remaining`);
      if (next) activate(next); else input.focus();
    };

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && input.value === '' && atStart()) {
        const list = tokens();
        if (!list.length) return;
        event.preventDefault();
        activate(list[list.length - 1]);       // first press activates only
        return;
      }
      if (event.key === 'ArrowLeft' && atStart()) {
        const list = tokens();
        if (!list.length) return;
        event.preventDefault();
        activate(list[list.length - 1]);
      }
    });

    field.addEventListener('keydown', (event) => {
      const token = event.target.closest && event.target.closest('.ol8-multiselect__token');
      if (!token) return;
      const list = tokens();
      const index = list.indexOf(token);
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        activate(list[Math.max(0, index - 1)]);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (index === list.length - 1) { clearActive(); input.focus(); }
        else activate(list[index + 1]);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        remove(token);                          // second press removes
      } else if (event.key === 'Escape') {
        // Escape cancels the preview. It never clears committed values.
        event.preventDefault();
        clearActive();
        input.focus();
      }
    });

    field.addEventListener('click', (event) => {
      const button = event.target.closest && event.target.closest('.ol8-token__remove');
      if (!button) return;
      const token = button.closest('.ol8-multiselect__token');
      if (token) remove(token);
    });

    field.dataset.ol8MultiselectBound = 'true';
  }
  return fields.length;
}

function announce(field, words) {
  const region = field.querySelector(':scope > .ol8-multiselect__status');
  if (region) region.textContent = words;
}
