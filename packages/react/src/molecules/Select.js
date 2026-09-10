import { createElement, forwardRef, useId } from 'react';
import { OL8_TEXT_FIELD_SIZES, OL8_TEXT_FIELD_APPEARANCES, OL8_TEXT_FIELD_MATERIALS, OL8_MESSAGE_TONES } from '../foundations/geometry.js';
import { Icon } from '../atoms/Icon.js';
import { FormMessage } from './FormMessage.js';

/** "native='preferred' | 'required' | 'custom-allowed'", default preferred. */
export const OL8_SELECT_NATIVE_POLICIES = ['preferred', 'required', 'custom-allowed'];

/**
 * MOLECULE. Figma 583:338 Trigger, 875:1778 Select.
 *
 * "Geometry and appearance reuse approved Text Field tokens", and Figma proves
 * it: every bound variable on the trigger is a Text Field one. So Select wears
 * the field's own classes.
 *
 * The contract is native first: "ordinary Select uses a labelled native select
 * whenever its option and appearance requirements fit native behavior", and "a
 * native control is not replaced merely to force pixel identity". This renders
 * a real select, so the platform keeps the keyboard, the type ahead, the picker
 * and the announcements.
 */
export const Select = forwardRef(function Select({
  label, options = [], id, size = 'comfortable', appearance = 'outline', material = 'regular',
  showLabel = true, required = false, disabled = false, invalid = false,
  placeholderOption, leadingIcon, instruction, message, messageTone = 'critical',
  native = 'preferred', className = '', ...rest
}, ref) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] Select requires a label. A placeholder is never the label.');
  }
  if (!Array.isArray(options) || options.length === 0) throw new Error('[ol8] Select needs at least one option.');
  if (!OL8_TEXT_FIELD_SIZES.includes(size)) throw new Error(`[ol8] unknown select size "${size}"`);
  if (!OL8_TEXT_FIELD_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown select appearance "${appearance}"`);
  if (!OL8_TEXT_FIELD_MATERIALS.includes(material)) throw new Error(`[ol8] unknown select material "${material}"`);
  if (!OL8_MESSAGE_TONES.includes(messageTone)) throw new Error(`[ol8] unknown message tone "${messageTone}"`);
  if (!OL8_SELECT_NATIVE_POLICIES.includes(native)) throw new Error(`[ol8] unknown native policy "${native}"`);
  if (native === 'custom-allowed') {
    throw new Error('[ol8] a custom select is justified only when the product needs behaviour native Select cannot provide, and only with the complete focus, keyboard, announcement, form, mobile and forced colour contract implemented. Use Combobox, which implements it.');
  }

  const generated = useId();
  const selectId = id ?? generated;
  const instructionId = instruction ? `${selectId}-instruction` : undefined;
  const messageId = message ? `${selectId}-message` : undefined;
  const describedBy = [instructionId, messageId].filter(Boolean).join(' ') || undefined;

  // Grouped options keep their source order, the way the popup groups do.
  const groups = [];
  for (const option of options) {
    const name = option.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(option);
    else groups.push({ name, items: [option] });
  }
  const renderOption = (option) => createElement('option', {
    key: option.value, value: option.value, disabled: option.disabled,
  }, option.label);

  return createElement('div', {
    className: `ol8-field ol8-select${className ? ` ${className}` : ''}`,
    'data-ol8-size': size,
    'data-ol8-appearance': appearance,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    ...(disabled ? { 'data-ol8-disabled': 'true' } : {}),
    ...(invalid ? { 'data-ol8-invalid': 'true' } : {}),
  },
    showLabel
      ? createElement('div', { key: 'label-row', className: 'ol8-field__label-row' },
          createElement('label', { key: 'l', className: 'ol8-field__label', htmlFor: selectId }, label),
          required ? createElement('span', { key: 'r', className: 'ol8-field__requirement', 'aria-hidden': 'true' }, '*') : null,
        )
      : null,

    createElement('div', { key: 'stack', className: 'ol8-field__control-stack' },
      createElement('div', { className: 'ol8-field__control' },
        leadingIcon ? createElement(Icon, { key: 'i', name: leadingIcon, size: 18, className: 'ol8-field__leading-icon' }) : null,
        createElement('select', {
          key: 'select', ...rest, ref,
          id: selectId,
          className: 'ol8-field__input ol8-select__input',
          required, disabled,
          'aria-label': showLabel ? undefined : label,
          'aria-invalid': invalid || undefined,
          'aria-errormessage': invalid ? messageId : undefined,
          'aria-describedby': describedBy,
        },
          // "placeholderOption only when an unselected value is valid or
          // required validation needs an explicit prompt."
          placeholderOption
            ? createElement('option', { key: '__placeholder', value: '', disabled: required }, placeholderOption)
            : null,
          groups.map((group, index) => group.name
            ? createElement('optgroup', { key: `g${index}`, label: group.name }, group.items.map(renderOption))
            : group.items.map(renderOption)),
        ),
        // Decoration: the native control already tells a screen reader it opens a list.
        createElement(Icon, { key: 'disclosure', name: 'chevron-down', size: 18, className: 'ol8-select__disclosure' }),
      ),
    ),

    instruction
      ? createElement('div', { key: 'instruction', className: 'ol8-field__instruction', id: instructionId }, instruction)
      : null,
    message
      ? createElement('div', { key: 'supporting', className: 'ol8-field__supporting' },
          createElement(FormMessage, { tone: messageTone, id: messageId }, message))
      : null,
  );
});
