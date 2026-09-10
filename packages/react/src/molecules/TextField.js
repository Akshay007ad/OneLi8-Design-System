import { createElement, forwardRef, useCallback, useId, useRef } from 'react';
import {
  OL8_TEXT_FIELD_SIZES, OL8_TEXT_FIELD_APPEARANCES, OL8_TEXT_FIELD_MATERIALS,
  OL8_MESSAGE_TONES, OL8_VALIDATION_STATUSES, OL8_CHARACTER_LIMIT_BEHAVIORS,
} from '../foundations/geometry.js';
import { Icon } from '../atoms/Icon.js';
import { FormMessage } from './FormMessage.js';

/**
 * MOLECULE. Figma 182:33 Outline, 186:53 Filled, 211:36 and 215:226 Gem.
 *
 * Figma's five Conditions are review evidence, never props. They arrive here as
 * :hover, aria-invalid, readOnly and disabled on the native input, which is also
 * what carries type, value, autofill, IME, undo and dictation.
 *
 * Gem is a material adapter. It changes token bound material and nothing else.
 */
export const TextField = forwardRef(function TextField({
  label, id, size = 'comfortable', appearance = 'outline', material = 'regular',
  showLabel = true, required = false, disabled = false, readOnly = false, invalid = false,
  leadingIcon, prefix, suffix, trailingAction,
  instruction, message, messageTone = 'critical', messageIcon = true,
  validationStatus = 'idle', characterLimit, characterLimitBehavior = 'soft',
  value, defaultValue, onChange, className = '', ...rest
}, ref) {
  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] Text Field requires a label. A placeholder is never the label.');
  }
  if (!OL8_TEXT_FIELD_SIZES.includes(size)) throw new Error(`[ol8] unknown text field size "${size}"`);
  if (!OL8_TEXT_FIELD_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown text field appearance "${appearance}"`);
  if (!OL8_TEXT_FIELD_MATERIALS.includes(material)) throw new Error(`[ol8] unknown text field material "${material}"`);
  if (!OL8_MESSAGE_TONES.includes(messageTone)) {
    throw new Error(`[ol8] unknown message tone "${messageTone}". Pending is a validationStatus, not a tone.`);
  }
  if (!OL8_VALIDATION_STATUSES.includes(validationStatus)) {
    throw new Error(`[ol8] unknown validation status "${validationStatus}"`);
  }
  if (!OL8_CHARACTER_LIMIT_BEHAVIORS.includes(characterLimitBehavior)) {
    throw new Error(`[ol8] unknown character limit behavior "${characterLimitBehavior}"`);
  }
  if (characterLimit !== undefined && (!Number.isInteger(characterLimit) || characterLimit <= 0)) {
    throw new Error('[ol8] characterLimit counts graphemes, so it must be a positive whole number.');
  }
  if (readOnly && invalid) {
    throw new Error('[ol8] a read only field cannot be invalid. If a person cannot correct the value, the problem belongs to system feedback rather than to an editable field error.');
  }

  const generated = useId();
  const fieldId = id ?? generated;
  const instructionId = instruction ? `${fieldId}-instruction` : undefined;
  const messageId = message ? `${fieldId}-message` : undefined;
  const counterId = characterLimit !== undefined ? `${fieldId}-counter` : undefined;
  const describedBy = [instructionId, messageId, counterId].filter(Boolean).join(' ') || undefined;

  const inputRef = useRef(null);
  const attach = useCallback((node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // "Clicking or tapping anywhere inside the control frame focuses the native
  // input, except an independent trailing action."
  const focusInput = useCallback((event) => {
    if (event.target === inputRef.current) return;
    if (event.target.closest?.('.ol8-field__trailing-action')) return;
    event.preventDefault();
    inputRef.current?.focus();
  }, []);

  // A native maxLength counts UTF-16 units, which would cut an emoji in half,
  // so a hard limit is enforced here in graphemes instead.
  const handleChange = useCallback((event) => {
    if (characterLimit !== undefined && characterLimitBehavior === 'hard') {
      const clipped = clipToGraphemes(event.target.value, characterLimit);
      if (clipped !== event.target.value) event.target.value = clipped;
    }
    onChange?.(event);
  }, [characterLimit, characterLimitBehavior, onChange]);

  const shown = value ?? defaultValue ?? '';
  const tone = validationStatus === 'pending' ? 'pending' : messageTone;

  return createElement('div', {
    className: `ol8-field${className ? ` ${className}` : ''}`,
    'data-ol8-size': size,
    'data-ol8-appearance': appearance,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    ...(disabled ? { 'data-ol8-disabled': 'true' } : {}),
    ...(readOnly ? { 'data-ol8-readonly': 'true' } : {}),
    ...(invalid ? { 'data-ol8-invalid': 'true' } : {}),
    ...(validationStatus !== 'idle' ? { 'data-ol8-validation': validationStatus } : {}),
  },
    showLabel
      ? createElement('div', { key: 'label-row', className: 'ol8-field__label-row' },
          createElement('label', { key: 'label', className: 'ol8-field__label', htmlFor: fieldId }, label),
          required
            ? createElement('span', { key: 'req', className: 'ol8-field__requirement', 'aria-hidden': 'true' }, '*')
            : null,
        )
      : null,

    createElement('div', { key: 'stack', className: 'ol8-field__control-stack' },
      createElement('div', { className: 'ol8-field__control', onMouseDown: focusInput },
        leadingIcon
          ? createElement(Icon, { key: 'lead', name: leadingIcon, size: 18, className: 'ol8-field__leading-icon' })
          : null,
        prefix
          ? createElement('span', { key: 'prefix', className: 'ol8-field__affix', 'aria-hidden': 'true' }, prefix)
          : null,
        createElement('input', {
          key: 'input', ...rest, ref: attach,
          id: fieldId,
          className: 'ol8-field__input',
          value, defaultValue, onChange: handleChange,
          required, disabled, readOnly,
          'aria-label': showLabel ? undefined : label,
          'aria-invalid': invalid || undefined,
          'aria-errormessage': invalid ? messageId : undefined,
          'aria-describedby': describedBy,
        }),
        suffix
          ? createElement('span', { key: 'suffix', className: 'ol8-field__affix', 'aria-hidden': 'true' }, suffix)
          : null,
        trailingAction
          ? createElement('button', {
              key: 'trailing', type: 'button', className: 'ol8-field__trailing-action',
              disabled, onClick: trailingAction.onClick, 'aria-label': trailingAction.label,
              'aria-pressed': trailingAction.pressed,
            }, createElement(Icon, { name: trailingAction.icon, size: 18 }))
          : null,
      ),
    ),

    instruction
      ? createElement('div', { key: 'instruction', className: 'ol8-field__instruction', id: instructionId }, instruction)
      : null,

    (message || counterId)
      ? createElement('div', { key: 'supporting', className: 'ol8-field__supporting' },
          message
            ? createElement(FormMessage, { key: 'message', tone, icon: messageIcon, id: messageId }, message)
            : createElement('span', { key: 'spacer', className: 'ol8-field__supporting-spacer' }),
          counterId
            ? createElement('span', { key: 'counter', className: 'ol8-field__counter', id: counterId },
                `${countGraphemes(shown)} / ${characterLimit}`)
            : null,
        )
      : null,
  );
});

/**
 * Counts what a reader would call characters, so an emoji built from several
 * code points counts as one. The contract asks for extended grapheme clusters
 * rather than UTF-16 code units or bytes.
 */
export function countGraphemes(value) {
  return segment(value).length;
}

/** Keeps the first `limit` graphemes, so a cluster is never cut in half. */
export function clipToGraphemes(value, limit) {
  const parts = segment(value);
  return parts.length <= limit ? String(value ?? '') : parts.slice(0, limit).join('');
}

function segment(value) {
  const text = String(value ?? '');
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(s => s.segment);
  }
  return [...text];
}
