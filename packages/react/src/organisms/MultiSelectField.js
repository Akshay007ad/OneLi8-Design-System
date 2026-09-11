import { createElement, useId } from 'react';
import { Token } from '../molecules/Token.js';
import { SelectionPopup } from './SelectionPopup.js';
import { OL8_MULTI_SELECT_SIZES, OL8_MULTI_SELECT_APPEARANCES,
         OL8_MULTI_SELECT_MATERIALS, OL8_VALUE_POLICIES } from '../foundations/geometry.js';

/**
 * A committed value may be given as a bare string. In a constrained field that
 * string is an option's value, so the token must show that option's label: a
 * field holding "ui" reads "Interface", never "ui". Only a value with no
 * matching option falls back to showing itself.
 */
const toEntry = (v, options) => {
  if (typeof v !== 'string') return v;
  const match = options.find(o => o.value === v);
  return match ? { value: match.value, label: match.label } : { value: v, label: v };
};

/**
 * ORGANISM. Several committed values in one field, built from the canonical
 * Text Field, Token and Selection Popup owners exactly as the Figma organism
 * is. Outline and Filled are one component with an appearance axis, because the
 * two Figma sets differ only by which field owner they instantiate.
 *
 * The committed values and the editable input are siblings in one wrapping run,
 * because they have to wrap together. The field grows rather than compressing
 * tokens to hold one nominal row.
 */
export function MultiSelectField({
  label, id, name, values = [], options = [],
  valuePolicy = 'constrained', size = 'comfortable', appearance = 'outline',
  material = 'regular', expanded = false, inputValue, placeholder,
  maximumValues, allowDuplicates = false, showLabel = true, required = false,
  disabled = false, readOnly = false, invalid = false, instruction, message,
  messageTone = 'critical', status = 'none', statusText,
  onRemoveValue, onInputValueChange, className = '', ...rest
}) {
  if (!label) throw new Error('[ol8] a Multi-select Field requires a label');
  if (!OL8_MULTI_SELECT_SIZES.includes(size)) throw new Error(`[ol8] unknown size "${size}"`);
  if (!OL8_MULTI_SELECT_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown appearance "${appearance}"`);
  if (!OL8_MULTI_SELECT_MATERIALS.includes(material)) throw new Error(`[ol8] unknown material "${material}"`);
  if (!OL8_VALUE_POLICIES.includes(valuePolicy)) throw new Error(`[ol8] unknown value policy "${valuePolicy}"`);
  if (readOnly && invalid) {
    throw new Error('[ol8] a read only field cannot be invalid, because nobody can act on the message');
  }

  const committed = values.map(v => toEntry(v, options));
  if (valuePolicy === 'constrained' && options.length) {
    const known = new Set(options.map(o => o.value));
    const stray = committed.find(v => !known.has(v.value));
    if (stray) throw new Error(`[ol8] "${stray.value}" is not one of the options, and a constrained field may not hold an authored value`);
  }
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

  const auto = useId();
  const uid = id ?? `ol8-multiselect-${auto}`;
  const popupId = `${uid}-popup`;
  const statusId = `${uid}-status`;
  const instructionId = instruction ? `${uid}-instruction` : undefined;
  const messageId = message ? `${uid}-message` : undefined;
  const full = maximumValues !== undefined && committed.length >= maximumValues;
  const locked = readOnly || disabled;
  const describedBy = [instructionId, messageId, statusId].filter(Boolean).join(' ') || undefined;

  return createElement('div', {
    ...rest,
    className: `ol8-multiselect${className ? ` ${className}` : ''}`,
    'data-ol8-expanded': String(expanded),
    'data-ol8-value-policy': valuePolicy,
    ...(disabled ? { 'data-ol8-availability': 'disabled' } : {}),
    ...(readOnly ? { 'data-ol8-readonly': 'true' } : {}),
    ...(full ? { 'data-ol8-full': 'true' } : {}),
  }, [
    createElement('div', {
      key: 'field',
      className: 'ol8-field ol8-multiselect__field',
      'data-ol8-size': size, 'data-ol8-appearance': appearance,
      ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
      ...(invalid ? { 'data-ol8-validity': 'invalid' } : {}),
      ...(disabled ? { 'data-ol8-availability': 'disabled' } : {}),
    }, [
      showLabel ? createElement('div', { key: 'lr', className: 'ol8-field__label-row' }, [
        createElement('label', { key: 'l', className: 'ol8-field__label', htmlFor: uid }, label),
        required ? createElement('span', { key: 'r', className: 'ol8-field__requirement', 'aria-hidden': 'true' }, '*') : null,
      ]) : null,
      createElement('div', { key: 'cs', className: 'ol8-field__control-stack' },
        createElement('div', { key: 'c', className: 'ol8-field__control ol8-multiselect__control' }, [
          ...committed.map((v, i) => createElement(Token, {
            key: v.value, size, selected: true,
            mark: locked ? 'none' : 'remove', removable: !locked, focusable: false,
            className: 'ol8-multiselect__token',
            id: `${uid}-token-${i}`,
            onRemove: onRemoveValue ? () => onRemoveValue(v) : undefined,
          }, v.label)),
          createElement('input', {
            key: 'input',
            className: 'ol8-field__input ol8-multiselect__input', id: uid, name, type: 'text',
            role: 'combobox', 'aria-expanded': String(expanded), 'aria-controls': popupId,
            'aria-autocomplete': 'list', 'aria-haspopup': 'listbox',
            ...(showLabel ? {} : { 'aria-label': label }),
            ...(inputValue !== undefined
              ? { value: inputValue, onChange: (e) => onInputValueChange && onInputValueChange(e.target.value) }
              : {}),
            placeholder, required, disabled, readOnly,
            ...(invalid ? { 'aria-invalid': 'true', 'aria-errormessage': messageId } : {}),
            ...(describedBy ? { 'aria-describedby': describedBy } : {}),
          }),
        ])),
      instruction ? createElement('div', { key: 'i', className: 'ol8-field__instruction', id: instructionId }, instruction) : null,
      message ? createElement('div', { key: 'm', className: 'ol8-field__supporting' },
        createElement('span', {
          className: 'ol8-field__message', id: messageId, 'data-ol8-tone': messageTone,
          role: messageTone === 'critical' ? 'alert' : 'status',
        }, message)) : null,
    ]),
    expanded
      ? createElement(SelectionPopup, {
          key: 'popup', id: popupId, label, options, multiple: true,
          selected: committed.map(v => v.value),
          width: 'anchor', size: size === 'large' ? 'large' : 'standard',
          status, statusText, className: 'ol8-multiselect__popup',
        })
      : createElement('div', { key: 'popup', id: popupId, hidden: true }),
    createElement('span', {
      key: 'status', className: 'ol8-multiselect__status', id: statusId,
      role: 'status', 'aria-live': 'polite',
    }, full ? `Maximum of ${maximumValues} reached` : ''),
  ]);
}
