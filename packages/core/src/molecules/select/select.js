/**
 * Oneli8 · Select — headless behavior.
 *
 * Figma (583:338 Trigger, 875:1778 Select): "Geometry and appearance reuse
 * approved Text Field tokens; focus remains inward."
 *
 * The contract is native first and says so plainly: "On the web, ordinary
 * Select uses a labelled native select whenever its option and appearance
 * requirements fit native behavior", and "A native control is not replaced
 * merely to force pixel identity."
 *
 * So this renders a real <select>. The user agent owns the keyboard, the type
 * ahead, the picker and the announcements, which is exactly what the contract
 * asks for: "Oneli8 does not intercept native keys to imitate a different
 * platform." A custom listbox is available, but only when the caller says
 * native="custom-allowed" and therefore accepts the whole contract that comes
 * with it.
 */
import { renderIcon } from '../../atoms/icon/index.js';
import { renderFormMessage } from '../form-message/index.js';

export const OL8_SELECT_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_SELECT_APPEARANCES = ['outline', 'filled'];
export const OL8_SELECT_MATERIALS = ['regular', 'gem'];
export const OL8_SELECT_NATIVE_POLICIES = ['preferred', 'required', 'custom-allowed'];

let sequence = 0;

/**
 * @param {{
 *   label:string, options:Array<{value:string,label:string,disabled?:boolean,group?:string}>,
 *   name?:string, id?:string, value?:string, size?:string, appearance?:string, material?:string,
 *   showLabel?:boolean, required?:boolean, disabled?:boolean, invalid?:boolean,
 *   placeholderOption?:string, leadingIcon?:string,
 *   instruction?:string, message?:string, messageTone?:string,
 *   native?:string, className?:string,
 * }} options
 */
export function renderSelect(options) {
  const {
    label, options: items = [], name, id = `ol8-select-${++sequence}`, value,
    size = 'comfortable', appearance = 'outline', material = 'regular',
    showLabel = true, required = false, disabled = false, invalid = false,
    placeholderOption, leadingIcon,
    instruction, message, messageTone = 'critical',
    native = 'preferred', className,
  } = options ?? {};

  if (typeof label !== 'string' || label === '') {
    throw new Error('[ol8] Select requires a label. A placeholder is never the label.');
  }
  if (!Array.isArray(items) || items.length === 0) throw new Error('[ol8] Select needs at least one option.');
  if (!OL8_SELECT_SIZES.includes(size)) throw new Error(`[ol8] unknown select size "${size}"`);
  if (!OL8_SELECT_APPEARANCES.includes(appearance)) throw new Error(`[ol8] unknown select appearance "${appearance}"`);
  if (!OL8_SELECT_MATERIALS.includes(material)) throw new Error(`[ol8] unknown select material "${material}"`);
  if (!OL8_SELECT_NATIVE_POLICIES.includes(native)) throw new Error(`[ol8] unknown native policy "${native}"`);
  if (native === 'custom-allowed') {
    throw new Error('[ol8] a custom select is justified only when the product needs behaviour native Select cannot provide, and only with the complete focus, keyboard, announcement, form, mobile and forced colour contract implemented. Use Combobox, which implements it.');
  }

  const instructionId = instruction ? `${id}-instruction` : null;
  const messageId = message ? `${id}-message` : null;
  const describedBy = [instructionId, messageId].filter(Boolean).join(' ');

  // Grouped options keep their source order, the way the popup groups do.
  const groups = [];
  for (const item of items) {
    const group = item.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.name === group) last.items.push(item);
    else groups.push({ name: group, items: [item] });
  }
  const optionMarkup = groups.map(group => {
    const inner = group.items.map(item =>
      `<option value="${escapeAttr(item.value)}"${item.value === value ? ' selected' : ''}` +
      `${item.disabled ? ' disabled' : ''}>${escapeText(item.label)}</option>`).join('');
    return group.name
      ? `<optgroup label="${escapeAttr(group.name)}">${inner}</optgroup>`
      : inner;
  }).join('');

  // "placeholderOption only when an unselected value is valid or required
  // validation needs an explicit prompt."
  const placeholder = placeholderOption
    ? `<option value=""${value ? '' : ' selected'}${required ? ' disabled' : ''}>${escapeText(placeholderOption)}</option>`
    : '';

  const attrs = [
    `class="ol8-field ol8-select${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-appearance="${appearance}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
    disabled ? 'data-ol8-disabled="true"' : '',
    invalid ? 'data-ol8-invalid="true"' : '',
  ].filter(Boolean).join(' ');

  return `<div ${attrs}>` +
    (showLabel
      ? `<div class="ol8-field__label-row">` +
        `<label class="ol8-field__label" for="${escapeAttr(id)}">${escapeText(label)}</label>` +
        (required ? `<span class="ol8-field__requirement" aria-hidden="true">*</span>` : '') +
        `</div>`
      : '') +
    `<div class="ol8-field__control-stack"><div class="ol8-field__control">` +
      (leadingIcon ? renderIcon(leadingIcon, { size: 18, className: 'ol8-field__leading-icon' }) : '') +
      `<select class="ol8-field__input ol8-select__input" id="${escapeAttr(id)}"` +
        (name ? ` name="${escapeAttr(name)}"` : '') +
        (required ? ' required' : '') +
        (disabled ? ' disabled' : '') +
        (invalid ? ' aria-invalid="true"' : '') +
        (invalid && messageId ? ` aria-errormessage="${messageId}"` : '') +
        (describedBy ? ` aria-describedby="${escapeAttr(describedBy)}"` : '') +
        (showLabel ? '' : ` aria-label="${escapeAttr(label)}"`) +
      `>${placeholder}${optionMarkup}</select>` +
      // The disclosure is decoration: the native control already tells a screen
      // reader that it opens a list.
      renderIcon('chevron-down', { size: 18, className: 'ol8-select__disclosure' }) +
    `</div></div>` +
    (instruction ? `<div class="ol8-field__instruction" id="${instructionId}">${escapeText(instruction)}</div>` : '') +
    (message
      ? `<div class="ol8-field__supporting">${renderFormMessage(message, { tone: messageTone, id: messageId })}</div>`
      : '') +
    `</div>`;
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
