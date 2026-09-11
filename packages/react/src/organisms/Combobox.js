import { createElement, useId } from 'react';
import { Icon } from '../atoms/Icon.js';
import { FormMessage } from '../molecules/FormMessage.js';
import { SelectionPopup } from './SelectionPopup.js';
import { OL8_COMBOBOX_SIZES, OL8_COMBOBOX_APPEARANCES, OL8_COMBOBOX_MATERIALS,
         OL8_VALUE_POLICIES, OL8_AUTOCOMPLETE_MODES, OL8_FILTER_SOURCES } from '../foundations/geometry.js';

/**
 * ORGANISM. Figma 883:2159: "Reuses approved Text Field, Selection Popup and
 * governed icon atoms", and "Expanded remains Boolean" so the design does not
 * explode into a variant per state.
 *
 * The contract is unusually specific about what code owns, and this markup is
 * shaped by it:
 *
 *   "Editable Combobox uses a native single-line text input as its editing
 *    surface" — so caret, selection, composition, dictation, undo and paste all
 *    keep working, because they are the browser's.
 *   "DOM focus remains on the Combobox and active option is communicated with
 *    aria-activedescendant. Popup descendants are excluded from the page Tab
 *    sequence."
 *   "Current value, active option and keyboard focus are distinct states."
 *
 * React owns none of the keyboard model here. Opening, the active option and
 * committing are application state, so they arrive as props and leave as
 * callbacks; a component that tried to own them would fight the consumer.
 */
export function Combobox({
  label, options = [], id, name, inputValue, value,
  size = 'comfortable', appearance = 'outline', material = 'regular',
  open = false, active, showLabel = true,
  required = false, disabled = false, invalid = false, readOnly = false,
  placeholder, leadingIcon, clearable = false,
  instruction, message, messageTone = 'critical',
  valuePolicy = 'constrained', autocomplete = 'list-manual', filter = 'local',
  loading = false, emptyText, retrievalError,
  popupWidth = 'anchor', onInputValueChange, onClear, className = '', ...rest
}) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] Combobox requires a label, and its accessible name stays distinct from its value.');
  }
  if (!OL8_COMBOBOX_SIZES.includes(size)) throw new Error(`[ol8] unknown combobox size "${size}"`);
  if (!OL8_COMBOBOX_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown combobox appearance "${appearance}"`);
  if (!OL8_COMBOBOX_MATERIALS.includes(material)) throw new Error(`[ol8] unknown combobox material "${material}"`);
  if (!OL8_VALUE_POLICIES.includes(valuePolicy)) throw new Error(`[ol8] unknown value policy "${valuePolicy}"`);
  if (!OL8_AUTOCOMPLETE_MODES.includes(autocomplete)) throw new Error(`[ol8] unknown autocomplete mode "${autocomplete}"`);
  if (!OL8_FILTER_SOURCES.includes(filter)) throw new Error(`[ol8] unknown filter source "${filter}"`);
  if (clearable && required) {
    throw new Error('[ol8] a required Combobox is not clearable, because clearing it would leave a value the form cannot accept.');
  }
  if (readOnly && invalid) {
    throw new Error('[ol8] a read only Combobox cannot be invalid, for the same reason a read only field cannot be.');
  }

  const auto = useId();
  const uid = id ?? `ol8-combobox-${auto}`;
  const popupId = `${uid}-listbox`;
  const instructionId = instruction ? `${uid}-instruction` : undefined;
  const messageId = message ? `${uid}-message` : undefined;
  const describedBy = [instructionId, messageId].filter(Boolean).join(' ') || undefined;

  // Four distinct conditions, never collapsed into one "nothing here".
  const status = loading ? 'loading'
    : retrievalError ? 'error'
    : (options.length === 0 && emptyText) ? 'empty'
    : 'none';
  const statusText = loading ? 'Loading' : retrievalError || emptyText;

  return createElement('div', {
    ...rest,
    className: `ol8-field ol8-combobox${className ? ` ${className}` : ''}`,
    'data-ol8-size': size, 'data-ol8-appearance': appearance,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    ...(disabled ? { 'data-ol8-disabled': 'true' } : {}),
    ...(readOnly ? { 'data-ol8-readonly': 'true' } : {}),
    ...(invalid ? { 'data-ol8-invalid': 'true' } : {}),
    'data-ol8-value-policy': valuePolicy,
    'data-ol8-filter': filter,
    ...(value !== undefined ? { 'data-ol8-committed': value } : {}),
  }, [
    showLabel ? createElement('div', { key: 'lr', className: 'ol8-field__label-row' }, [
      createElement('label', { key: 'l', className: 'ol8-field__label', htmlFor: uid }, label),
      required ? createElement('span', { key: 'r', className: 'ol8-field__requirement', 'aria-hidden': 'true' }, '*') : null,
    ]) : null,
    createElement('div', { key: 'cs', className: 'ol8-field__control-stack' },
      createElement('div', { className: 'ol8-field__control' }, [
        leadingIcon ? createElement(Icon, { key: 'li', name: leadingIcon, size: 18, className: 'ol8-field__leading-icon' }) : null,
        createElement('input', {
          key: 'input', className: 'ol8-field__input ol8-combobox__input', id: uid, type: 'text',
          role: 'combobox', 'aria-expanded': String(open), 'aria-controls': popupId,
          'aria-autocomplete': autocomplete === 'none' ? 'none' : 'list',
          autoComplete: 'off',
          ...(active ? { 'aria-activedescendant': `${popupId}-option-${active}` } : {}),
          name, placeholder, required, disabled, readOnly,
          ...(inputValue !== undefined
            ? { value: inputValue, onChange: (e) => onInputValueChange && onInputValueChange(e.target.value) }
            : {}),
          ...(invalid ? { 'aria-invalid': 'true', ...(messageId ? { 'aria-errormessage': messageId } : {}) } : {}),
          ...(describedBy ? { 'aria-describedby': describedBy } : {}),
          ...(showLabel ? {} : { 'aria-label': label }),
        }),
        // "Clearing is an explicit named action", so it is a real button with a
        // real name rather than an unlabelled cross. It is not a second tab
        // stop: the input is the composite's only one.
        clearable ? createElement('button', {
          key: 'clear', type: 'button', className: 'ol8-combobox__clear', tabIndex: -1,
          disabled, 'aria-label': `Clear ${label}`, onClick: onClear,
        }, createElement(Icon, { name: 'clear', size: 18 })) : null,
        createElement('span', { key: 'disc', className: 'ol8-combobox__disclosure', 'aria-hidden': 'true' },
          createElement(Icon, { name: open ? 'chevron-up' : 'chevron-down', size: 18 })),
      ])),
    instruction ? createElement('div', { key: 'i', className: 'ol8-field__instruction', id: instructionId }, instruction) : null,
    message ? createElement('div', { key: 'm', className: 'ol8-field__supporting' },
      createElement(FormMessage, { tone: messageTone, id: messageId }, message)) : null,
    createElement('div', { key: 'popup', className: 'ol8-combobox__popup', ...(open ? {} : { hidden: true }) },
      createElement(SelectionPopup, {
        id: popupId, label, options, selected: value, active,
        width: popupWidth, size: size === 'large' ? 'large' : 'standard',
        status, statusText,
      })),
  ]);
}
