/**
 * Oneli8 · Combobox — headless behavior.
 *
 * Figma (883:2159): "Reuses approved Text Field, Selection Popup and governed
 * icon atoms", and "Expanded remains Boolean" so the design does not explode
 * into a variant per state.
 *
 * The contract is unusually specific about what code owns here, and every one
 * of these is implemented rather than described:
 *
 *   "Editable Combobox uses a native single-line text input as its editing
 *    surface" — so the caret, selection, composition, dictation, undo and paste
 *    all keep working.
 *   "DOM focus remains on the Combobox and active option is communicated with
 *    aria-activedescendant. Popup descendants are excluded from the page Tab
 *    sequence."
 *   "Current value, active option and keyboard focus are distinct states."
 *   "Escape closes a custom popup without committing the preview and restores
 *    the prior committed value."
 *   "Leaving a constrained Combobox with unmatched text does not silently
 *    commit an invalid option."
 *   "During IME composition, text input is not prematurely committed and
 *    navigation commands do not corrupt the composition string."
 */
import { renderIcon } from '../../atoms/icon/index.js';
import { renderFormMessage } from '../../molecules/form-message/index.js';
import { renderSelectionPopup } from '../selection-popup/index.js';

export const OL8_COMBOBOX_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_COMBOBOX_APPEARANCES = ['outline', 'filled'];
export const OL8_COMBOBOX_MATERIALS = ['regular', 'gem'];

/** Constrained holds one of the options; suggestive may hold authored text. */
export const OL8_VALUE_POLICIES = ['constrained', 'suggestive'];
export const OL8_AUTOCOMPLETE_MODES = ['none', 'list-manual', 'list-automatic'];
export const OL8_FILTER_SOURCES = ['local', 'remote', 'external'];

let sequence = 0;

/**
 * @param {{
 *   label:string, options:Array<{value:string,label:string,description?:string,leadingIcon?:string,disabled?:boolean,group?:string}>,
 *   id?:string, name?:string, inputValue?:string, value?:string,
 *   size?:string, appearance?:string, material?:string,
 *   open?:boolean, active?:string, showLabel?:boolean,
 *   required?:boolean, disabled?:boolean, invalid?:boolean, readOnly?:boolean,
 *   placeholder?:string, leadingIcon?:string, clearable?:boolean,
 *   instruction?:string, message?:string, messageTone?:string,
 *   valuePolicy?:string, autocomplete?:string, filter?:string,
 *   loading?:boolean, emptyText?:string, retrievalError?:string,
 *   popupWidth?:string, className?:string,
 * }} options
 */
export function renderCombobox(options) {
  const {
    label, options: items = [], id = `ol8-combobox-${++sequence}`, name,
    inputValue, value, size = 'comfortable', appearance = 'outline', material = 'regular',
    open = false, active, showLabel = true,
    required = false, disabled = false, invalid = false, readOnly = false,
    placeholder, leadingIcon, clearable = false,
    instruction, message, messageTone = 'critical',
    valuePolicy = 'constrained', autocomplete = 'list-manual', filter = 'local',
    loading = false, emptyText, retrievalError,
    popupWidth = 'anchor', className,
  } = options ?? {};

  assertCombobox({ label, size, appearance, material, valuePolicy, autocomplete, filter, required, clearable, readOnly, invalid });

  const popupId = `${id}-listbox`;
  const instructionId = instruction ? `${id}-instruction` : null;
  const messageId = message ? `${id}-message` : null;
  const describedBy = [instructionId, messageId].filter(Boolean).join(' ');
  const popupSize = size === 'large' ? 'large' : 'standard';

  // Four distinct conditions, never collapsed into one "nothing here".
  const status = loading ? 'loading'
    : retrievalError ? 'error'
    : (items.length === 0 && emptyText) ? 'empty'
    : 'none';
  const statusText = loading ? 'Loading' : retrievalError || emptyText;

  const attrs = [
    `class="ol8-field ol8-combobox${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-appearance="${appearance}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
    disabled ? 'data-ol8-disabled="true"' : '',
    readOnly ? 'data-ol8-readonly="true"' : '',
    invalid ? 'data-ol8-invalid="true"' : '',
    `data-ol8-value-policy="${valuePolicy}"`,
    `data-ol8-filter="${filter}"`,
    value !== undefined ? `data-ol8-committed="${escapeAttr(value)}"` : '',
  ].filter(Boolean).join(' ');

  return `<div ${attrs}>` +
    (showLabel
      ? `<div class="ol8-field__label-row">` +
        `<label class="ol8-field__label" for="${escapeAttr(id)}">${escapeText(label)}</label>` +
        (required ? `<span class="ol8-field__requirement" aria-hidden="true">*</span>` : '') +
        `</div>`
      : '') +
    `<div class="ol8-field__control-stack">` +
      `<div class="ol8-field__control">` +
        (leadingIcon ? renderIcon(leadingIcon, { size: 18, className: 'ol8-field__leading-icon' }) : '') +
        // A real text input, so every platform text service keeps working.
        `<input class="ol8-field__input ol8-combobox__input" id="${escapeAttr(id)}" type="text"` +
          ` role="combobox" aria-expanded="${open}" aria-controls="${popupId}"` +
          ` aria-autocomplete="${autocomplete === 'none' ? 'none' : 'list'}"` +
          ' autocomplete="off"' +
          (active ? ` aria-activedescendant="${popupId}-option-${escapeAttr(active)}"` : '') +
          (name ? ` name="${escapeAttr(name)}"` : '') +
          (inputValue !== undefined ? ` value="${escapeAttr(inputValue)}"` : '') +
          (placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : '') +
          (required ? ' required' : '') +
          (disabled ? ' disabled' : '') +
          (readOnly ? ' readonly' : '') +
          (invalid ? ' aria-invalid="true"' : '') +
          (invalid && messageId ? ` aria-errormessage="${messageId}"` : '') +
          (describedBy ? ` aria-describedby="${escapeAttr(describedBy)}"` : '') +
          (showLabel ? '' : ` aria-label="${escapeAttr(label)}"`) +
        `>` +
        // "Clearing is an explicit named action", so it is a real button with
        // a real name rather than an unlabelled cross.
        (clearable
          ? `<button class="ol8-combobox__clear" type="button" tabindex="-1"` +
            `${disabled ? ' disabled' : ''} aria-label="Clear ${escapeAttr(label)}">` +
            renderIcon('clear', { size: 18 }) + `</button>`
          : '') +
        // The indicator is not a second tab stop: "popup indicator and listbox
        // options are not additional page Tab stops".
        `<span class="ol8-combobox__disclosure" aria-hidden="true">` +
          renderIcon(open ? 'chevron-up' : 'chevron-down', { size: 18 }) + `</span>` +
      `</div>` +
    `</div>` +
    (instruction ? `<div class="ol8-field__instruction" id="${instructionId}">${escapeText(instruction)}</div>` : '') +
    (message
      ? `<div class="ol8-field__supporting">${renderFormMessage(message, { tone: messageTone, id: messageId })}</div>`
      : '') +
    `<div class="ol8-combobox__popup"${open ? '' : ' hidden'}>` +
      renderSelectionPopup({
        id: popupId, label, options: items, selected: value, active,
        width: popupWidth, size: popupSize, status, statusText,
      }) +
    `</div>` +
    `</div>`;
}

/**
 * Wires an existing `.ol8-combobox`. Idempotent.
 *
 * Focus never leaves the input. The active option is a virtual cursor carried
 * by aria-activedescendant, which is what lets a screen reader read the option
 * while the caret stays where the person is typing.
 */
export function hydrateComboboxes(root = document) {
  let count = 0;
  for (const box of root.querySelectorAll('.ol8-combobox')) {
    if (box.dataset.ol8Wired === 'true') continue;
    box.dataset.ol8Wired = 'true';
    count += 1;

    const input = box.querySelector('.ol8-combobox__input');
    const popup = box.querySelector('.ol8-combobox__popup');
    const listbox = box.querySelector('[role="listbox"]');
    if (!input || !popup || !listbox) continue;

    // The value that was actually committed, so Escape and an unmatched blur
    // have something truthful to restore.
    let committed = box.dataset.ol8Committed ?? '';
    let committedText = input.value;
    let composing = false;

    const optionsOf = () => [...listbox.querySelectorAll('[role="option"]:not([aria-disabled="true"])')];
    const activeOption = () => listbox.querySelector('[data-ol8-active="true"]');

    const setOpen = (open) => {
      popup.hidden = !open;
      input.setAttribute('aria-expanded', String(open));
      if (!open) setActive(null);
    };

    const setActive = (option) => {
      for (const other of listbox.querySelectorAll('[role="option"]')) delete other.dataset.ol8Active;
      if (!option) { input.removeAttribute('aria-activedescendant'); return; }
      option.dataset.ol8Active = 'true';
      input.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    };

    const commit = (option) => {
      if (!option) return;
      committed = option.dataset.ol8Value ?? '';
      committedText = option.querySelector('.ol8-option__label')?.textContent ?? option.textContent.trim();
      input.value = committedText;
      box.dataset.ol8Committed = committed;
      for (const other of listbox.querySelectorAll('[role="option"]')) {
        other.setAttribute('aria-selected', String(other === option));
      }
      setOpen(false);
      box.dispatchEvent(new CustomEvent('ol8:comboboxcommit', { bubbles: true, detail: { value: committed } }));
    };

    const move = (step, edge) => {
      const options = optionsOf();
      if (options.length === 0) return;
      if (popup.hidden) setOpen(true);
      const at = options.indexOf(activeOption());
      let next;
      if (edge === 'start') next = 0;
      else if (edge === 'end') next = options.length - 1;
      else if (at === -1) next = step > 0 ? 0 : options.length - 1;
      else next = (at + step + options.length) % options.length;
      setActive(options[next]);
    };

    // "During IME composition, text input is not prematurely committed and
    // navigation commands do not corrupt the composition string."
    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; });

    input.addEventListener('keydown', (event) => {
      if (composing || event.isComposing) return;

      // Alt with an arrow opens or closes without changing the value.
      if (event.altKey && event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); return; }
      if (event.altKey && event.key === 'ArrowUp') { event.preventDefault(); setOpen(false); return; }

      switch (event.key) {
        case 'ArrowDown': event.preventDefault(); move(1); break;
        case 'ArrowUp': event.preventDefault(); move(-1); break;
        case 'Home': if (!popup.hidden) { event.preventDefault(); move(0, 'start'); } break;
        case 'End': if (!popup.hidden) { event.preventDefault(); move(0, 'end'); } break;
        case 'Enter':
          if (!popup.hidden && activeOption()) { event.preventDefault(); commit(activeOption()); }
          break;
        case 'Escape':
          // Closes without committing the preview, and puts back what was there.
          event.preventDefault();
          if (popup.hidden) return;
          input.value = committedText;
          setOpen(false);
          break;
        default: break;
      }
    });

    input.addEventListener('input', () => {
      if (composing) return;
      if (popup.hidden) setOpen(true);
      box.dispatchEvent(new CustomEvent('ol8:comboboxinput', { bubbles: true, detail: { inputValue: input.value } }));
    });

    input.addEventListener('blur', () => {
      // "Leaving a constrained Combobox with unmatched text does not silently
      // commit an invalid option." It restores what was actually committed.
      if (box.dataset.ol8ValuePolicy === 'constrained' && input.value !== committedText) {
        input.value = committedText;
        box.dispatchEvent(new CustomEvent('ol8:comboboxrestore', { bubbles: true, detail: { value: committed } }));
      }
      setOpen(false);
    });

    // Pointer activation commits, and mousedown is prevented so focus never
    // leaves the input on the way there.
    listbox.addEventListener('mousedown', (event) => event.preventDefault());
    listbox.addEventListener('click', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && option.getAttribute('aria-disabled') !== 'true') commit(option);
    });

    box.querySelector('.ol8-combobox__disclosure')?.addEventListener('mousedown', (event) => {
      event.preventDefault();
      input.focus();
      setOpen(popup.hidden);
    });

    box.querySelector('.ol8-combobox__clear')?.addEventListener('click', () => {
      input.value = '';
      committed = '';
      committedText = '';
      box.dataset.ol8Committed = '';
      input.focus();
      box.dispatchEvent(new CustomEvent('ol8:comboboxclear', { bubbles: true }));
    });
  }
  return count;
}

function assertCombobox({ label, size, appearance, material, valuePolicy, autocomplete, filter, required, clearable, readOnly, invalid }) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] Combobox requires a label, and its accessible name stays distinct from its value.');
  }
  if (!OL8_COMBOBOX_SIZES.includes(size)) throw new Error(`[ol8] unknown combobox size "${size}"`);
  if (!OL8_COMBOBOX_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown combobox appearance "${appearance}"`);
  if (!OL8_COMBOBOX_MATERIALS.includes(material)) throw new Error(`[ol8] unknown combobox material "${material}"`);
  if (!OL8_VALUE_POLICIES.includes(valuePolicy)) throw new Error(`[ol8] unknown value policy "${valuePolicy}"`);
  if (!OL8_AUTOCOMPLETE_MODES.includes(autocomplete)) throw new Error(`[ol8] unknown autocomplete mode "${autocomplete}"`);
  if (!OL8_FILTER_SOURCES.includes(filter)) throw new Error(`[ol8] unknown filter source "${filter}"`);
  // "clearable for an optional value only."
  if (clearable && required) {
    throw new Error('[ol8] a required Combobox is not clearable, because clearing it would leave a value the form cannot accept.');
  }
  if (readOnly && invalid) {
    throw new Error('[ol8] a read only Combobox cannot be invalid, for the same reason a read only field cannot be.');
  }
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
