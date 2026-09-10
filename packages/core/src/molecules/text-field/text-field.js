/**
 * Oneli8 · Text Field — headless behavior.
 *
 * Two sources govern this file and they govern different things.
 *
 * Figma (182:33 Outline, 186:53 Filled, 211:36 and 215:226 Gem) governs what is
 * drawn: anatomy, geometry, colour and material. Its description is explicit
 * that "runtime input type, name, value, autofill, IME, validationStatus,
 * grapheme limiting, required/disabled/readOnly and native input semantics live
 * in code". Its five Conditions are review evidence, never classes: here they
 * are :hover, aria-invalid, readonly and :disabled on the real input.
 *
 * The Text Field contract governs what the API means: the property vocabulary,
 * the defaults, the state precedence and the prohibitions. Figma has no opinion
 * on those, so there is nothing to reconcile.
 */
import { renderIcon } from '../../atoms/icon/index.js';
import { renderFormMessage } from '../form-message/index.js';

export const OL8_TEXT_FIELD_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_TEXT_FIELD_APPEARANCES = ['outline', 'filled'];
export const OL8_TEXT_FIELD_MATERIALS = ['regular', 'gem'];

/** The four semantic tones a message can carry. Pending is not one of them. */
export const OL8_MESSAGE_TONES = ['critical', 'caution', 'positive', 'informative'];

/** "Pending is a validation process status, not a fifth message tone." */
export const OL8_VALIDATION_STATUSES = ['idle', 'pending', 'resolved'];

/** Soft lets a person overshoot and then correct. Hard is for real technical limits. */
export const OL8_CHARACTER_LIMIT_BEHAVIORS = ['soft', 'hard'];

let sequence = 0;
const nextId = () => `ol8-field-${++sequence}`;

/** @param {import('./text-field.js').Ol8TextFieldOptions} options */
export function renderTextField(options = {}) {
  const {
    label, name, id = nextId(), type = 'text', value, placeholder,
    size = 'comfortable', appearance = 'outline', material = 'regular',
    showLabel = true, required = false, disabled = false, readOnly = false, invalid = false,
    leadingIcon, prefix, suffix, trailingAction,
    instruction, message, messageTone = 'critical', messageIcon = true,
    validationStatus = 'idle', characterLimit, characterLimitBehavior = 'soft',
    className,
  } = options;

  assertContract({ label, size, appearance, material, messageTone, validationStatus,
    characterLimit, characterLimitBehavior, readOnly, invalid });

  const instructionId = instruction ? `${id}-instruction` : null;
  const messageId = message ? `${id}-message` : null;
  const counterId = characterLimit !== undefined ? `${id}-counter` : null;
  const describedBy = [instructionId, messageId, counterId].filter(Boolean).join(' ');

  const labelRow = showLabel
    ? `<div class="ol8-field__label-row">` +
      `<label class="ol8-field__label" for="${escapeAttr(id)}">${escapeText(label)}</label>` +
      (required ? `<span class="ol8-field__requirement" aria-hidden="true">*</span>` : '') +
      `</div>`
    : '';

  const control =
    `<div class="ol8-field__control">` +
    (leadingIcon ? renderIcon(leadingIcon, { size: 18, className: 'ol8-field__leading-icon' }) : '') +
    (prefix ? `<span class="ol8-field__affix" aria-hidden="true">${escapeText(prefix)}</span>` : '') +
    `<input class="ol8-field__input" id="${escapeAttr(id)}" type="${escapeAttr(type)}"` +
      (name ? ` name="${escapeAttr(name)}"` : '') +
      (value !== undefined ? ` value="${escapeAttr(value)}"` : '') +
      (placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : '') +
      (required ? ' required' : '') +
      (disabled ? ' disabled' : '') +
      (readOnly ? ' readonly' : '') +
      (invalid ? ' aria-invalid="true"' : '') +
      (invalid && messageId ? ` aria-errormessage="${messageId}"` : '') +
      // A native maxlength counts UTF-16 units, which would cut an emoji in half.
      // The limit is enforced here instead, in graphemes, per the contract.
      (characterLimit !== undefined ? ` data-ol8-limit="${characterLimit}" data-ol8-limit-behavior="${characterLimitBehavior}"` : '') +
      (describedBy ? ` aria-describedby="${escapeAttr(describedBy)}"` : '') +
      (showLabel ? '' : ` aria-label="${escapeAttr(label)}"`) +
    `>` +
    (suffix ? `<span class="ol8-field__affix" aria-hidden="true">${escapeText(suffix)}</span>` : '') +
    (trailingAction
      ? `<button class="ol8-field__trailing-action" type="button"` +
        (disabled ? ' disabled' : '') +
        ` aria-label="${escapeAttr(trailingAction.label)}">` +
        renderIcon(trailingAction.icon, { size: 18 }) +
        `</button>`
      : '') +
    `</div>`;

  // Instruction is its own full width row. Message and counter share the next
  // one, counter at the logical inline end, wrapping below at narrow widths.
  const supporting = (message || counterId)
    ? `<div class="ol8-field__supporting">` +
      (message
        ? renderFormMessage(message, { tone: validationStatus === 'pending' ? 'pending' : messageTone, icon: messageIcon, id: messageId })
        : '<span class="ol8-field__supporting-spacer"></span>') +
      (counterId
        ? `<span class="ol8-field__counter" id="${counterId}">${countGraphemes(value)} / ${characterLimit}</span>`
        : '') +
      `</div>`
    : '';

  const attrs = [
    `class="ol8-field${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-appearance="${appearance}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
    disabled ? 'data-ol8-disabled="true"' : '',
    readOnly ? 'data-ol8-readonly="true"' : '',
    invalid ? 'data-ol8-invalid="true"' : '',
    validationStatus !== 'idle' ? `data-ol8-validation="${validationStatus}"` : '',
  ].filter(Boolean).join(' ');

  return `<div ${attrs}>` +
    labelRow +
    `<div class="ol8-field__control-stack">${control}</div>` +
    (instruction ? `<div class="ol8-field__instruction" id="${instructionId}">${escapeText(instruction)}</div>` : '') +
    supporting +
    `</div>`;
}

/**
 * Enforces the runtime contract on existing `.ol8-field` markup. Idempotent.
 *
 *   - a field must own exactly one native input, since that is what carries
 *     type, value, autofill, IME, undo and the platform's text services
 *   - the label must point at that input, or it labels nothing
 *   - clicking anywhere in the control frame focuses the input, except on the
 *     independent trailing action
 *   - the counter counts graphemes as the person types, and a hard limit stops
 *     accepting input rather than corrupting a cluster
 */
export function hydrateTextFields(root = document) {
  const problems = [];
  for (const field of root.querySelectorAll('.ol8-field')) {
    const input = field.querySelector('.ol8-field__input');
    if (!input) { problems.push(field); continue; }

    if (!field.dataset.ol8Size) field.dataset.ol8Size = 'comfortable';
    if (!field.dataset.ol8Appearance) field.dataset.ol8Appearance = 'outline';

    const label = field.querySelector('.ol8-field__label');
    if (label && !label.getAttribute('for')) {
      if (!input.id) input.id = nextId();
      label.setAttribute('for', input.id);
    }

    const control = field.querySelector('.ol8-field__control');
    if (control && control.dataset.ol8Wired !== 'true') {
      control.dataset.ol8Wired = 'true';
      control.addEventListener('mousedown', (event) => {
        if (event.target === input) return;
        if (event.target.closest('.ol8-field__trailing-action')) return;
        event.preventDefault();
        input.focus();
      });
    }

    const limit = Number(input.dataset.ol8Limit);
    if (Number.isInteger(limit) && input.dataset.ol8Counting !== 'true') {
      input.dataset.ol8Counting = 'true';
      const counter = field.querySelector('.ol8-field__counter');
      const paint = () => {
        if (input.dataset.ol8LimitBehavior === 'hard') {
          const clipped = clipToGraphemes(input.value, limit);
          if (clipped !== input.value) input.value = clipped;
        }
        if (counter) counter.textContent = `${countGraphemes(input.value)} / ${limit}`;
      };
      input.addEventListener('input', paint);
      paint();
    }
  }
  if (problems.length > 0) {
    console.warn(`[ol8] ${problems.length} .ol8-field element(s) contain no native input`, problems);
  }
  return problems.length;
}

/**
 * Counts what a reader would call characters. An emoji built from several code
 * points is one, which is why the contract asks for extended grapheme clusters
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

/** Every rule here is one the contract states outright. */
function assertContract({
  label, size, appearance, material, messageTone, validationStatus,
  characterLimit, characterLimitBehavior, readOnly, invalid,
}) {
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
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
