/**
 * Oneli8 · Choice Picker (ORGANISM)
 *
 * Figma: Organism / Choice Picker / Soft Hexagon 906:2898 (16 variants,
 * Material x Commitment x Size).
 *
 * From the Figma description:
 *   "Choice Picker organism using canonical search-field and Soft Hexagon
 *    Choice Chip owners. Size propagates through all children; Commitment
 *    controls Apply versus Immediate behavior."
 *
 * And from the maintainer decision recorded on the same component:
 *   "Public ChoicePicker defaults to presentation=inline ... Search, existing
 *    Choice Chip/Token molecules and commitment summary remain in place. Apply
 *    mode holds pending selection; Enter from Search or a checkbox commits it,
 *    Escape restores the last committed set without closing the inline panel.
 *    The Enter-to-apply hint is also a focusable clickable action ... Immediate
 *    mode commits each toggle and omits that action."
 *
 * So the inline composition is canonical, and it is a group rather than a
 * dialog: a search field, a wrapping matrix of real checkboxes wearing the
 * chip appearance, and a commitment line that exists only in Apply mode.
 *
 * THE HINT IS A BUTTON, NOT A SENTENCE
 * Figma draws "Enter to apply" as text. The decision above requires it to be an
 * actual clickable and focusable action, because a keyboard instruction is not
 * an affordance for anyone using a pointer, touch, or a screen reader. So it is
 * a button that reads as the hint.
 */
import { renderChoiceChip } from '../../molecules/choice-chip/choice-chip.js';
import { renderIcon } from '../../atoms/icon/icon.js';

export const OL8_PICKER_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_PICKER_MATERIALS = ['regular', 'gem'];
export const OL8_COMMIT_BEHAVIORS = ['immediate', 'apply'];
export const OL8_PICKER_PRESENTATIONS = ['inline', 'popup'];
/** One mark treatment across an instance; peers never mix Check and None. */
export const OL8_PICKER_MARKS = ['check', 'none'];

/**
 * @param {{
 *   label:string, id?:string, name?:string,
 *   options?:Array<{value:string,label:string,selected?:boolean,disabled?:boolean}>,
 *   commitBehavior?:string, presentation?:string, mark?:string,
 *   size?:string, material?:string,
 *   inputValue?:string, placeholder?:string, showLabel?:boolean,
 *   selectedSummary?:string, applyHint?:string,
 *   showClearAll?:boolean, clearAllLabel?:string,
 *   disabled?:boolean, readOnly?:boolean,
 *   status?:string, statusText?:string, className?:string,
 * }} options
 */
export function renderChoicePicker(options = {}) {
  const {
    label, id, name, options: items = [],
    commitBehavior = 'immediate', presentation = 'inline', mark = 'check',
    size = 'comfortable', material = 'regular',
    inputValue = '', placeholder, showLabel = false,
    selectedSummary, applyHint = 'Enter to apply',
    showClearAll = false, clearAllLabel = 'Clear all',
    disabled = false, readOnly = false,
    status = 'none', statusText, className,
  } = options;

  if (!label || !String(label).trim()) throw new Error('[ol8] a Choice Picker requires a label for its search');
  if (!OL8_PICKER_SIZES.includes(size)) throw new Error(`[ol8] unknown size "${size}"`);
  if (!OL8_PICKER_MATERIALS.includes(material)) throw new Error(`[ol8] unknown material "${material}"`);
  if (!OL8_COMMIT_BEHAVIORS.includes(commitBehavior)) throw new Error(`[ol8] unknown commit behavior "${commitBehavior}"`);
  if (!OL8_PICKER_PRESENTATIONS.includes(presentation)) throw new Error(`[ol8] unknown presentation "${presentation}"`);
  if (!OL8_PICKER_MARKS.includes(mark)) throw new Error(`[ol8] unknown mark "${mark}"`);
  if (commitBehavior === 'immediate' && options.applyHint !== undefined) {
    throw new Error('[ol8] immediate commitment applies every toggle at once, so an apply action would be a lie');
  }
  if (status !== 'none' && !statusText) {
    throw new Error('[ol8] a picker status needs words. A spinner alone tells a screen reader nothing.');
  }

  const uid = id ?? `ol8-picker-${Math.random().toString(36).slice(2, 9)}`;
  const labelId = `${uid}-label`;
  const statusId = `${uid}-status`;
  const selected = items.filter(o => o.selected);

  // Every option is a real checkbox wearing the chip appearance. The mark
  // treatment is the same for every peer, which is why it is one setting on
  // the picker rather than a property of each chip.
  const matrix = items.map((o, i) => renderChoiceChip(o.label, {
    size,
    selected: !!o.selected,
    showMark: mark === 'check' && !!o.selected,
    disabled: disabled || readOnly || o.disabled,
    name: name ? `${name}[]` : undefined,
    value: o.value,
    id: `${uid}-option-${i}`,
    className: 'ol8-picker__chip',
  })).join('');

  const summary = selectedSummary
    ?? `${selected.length} selected`;

  // Apply mode holds a pending set, so it says what is pending and offers the
  // way to commit it. Immediate mode has nothing pending and says nothing.
  const commitment = commitBehavior === 'apply'
    ? `<div class="ol8-picker__commitment">` +
        `<span class="ol8-picker__summary">${escapeText(summary)}</span>` +
        (showClearAll
          ? `<button type="button" class="ol8-picker__clear">${escapeText(clearAllLabel)}</button>`
          : '') +
        `<button type="button" class="ol8-picker__apply">${escapeText(applyHint)}</button>` +
      `</div>`
    : '';

  const search =
    `<div class="ol8-field ol8-picker__field" data-ol8-size="${size}" data-ol8-appearance="outline"` +
    (material === 'gem' ? ' data-ol8-material="gem"' : '') + '>' +
      `<div class="ol8-field__label-row${showLabel ? '' : ' ol8-picker__label-row--hidden'}">` +
        `<label class="ol8-field__label" id="${labelId}" for="${uid}">${escapeText(label)}</label>` +
      `</div>` +
      `<div class="ol8-field__control-stack"><div class="ol8-field__control">` +
        renderIcon('search', { size: 18, className: 'ol8-field__leading-icon' }) +
        `<input class="ol8-field__input ol8-picker__input" id="${uid}" type="search"` +
          ` value="${escapeAttr(inputValue)}"` +
          (placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : '') +
          (disabled ? ' disabled' : '') + (readOnly ? ' readonly' : '') +
          ` aria-describedby="${statusId}">` +
      `</div></div>` +
    `</div>`;

  const rootAttrs = [
    `class="ol8-picker${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-commitment="${commitBehavior}"`,
    `data-ol8-presentation="${presentation}"`,
    `data-ol8-mark="${mark}"`,
    material === 'gem' ? 'data-ol8-material="gem"' : '',
    disabled ? 'data-ol8-availability="disabled"' : '',
    readOnly ? 'data-ol8-readonly="true"' : '',
    // A group, not a dialog: the surface holds search, many independent
    // choices and actions, so pretending it is one listbox would be a lie.
    `role="group" aria-labelledby="${labelId}"`,
  ].filter(Boolean).join(' ');

  return `<div ${rootAttrs}>` +
    search +
    `<div class="ol8-picker__matrix">${matrix}</div>` +
    commitment +
    `<span class="ol8-picker__status" id="${statusId}" role="status" aria-live="polite">` +
      escapeText(status !== 'none' ? statusText : '') +
    `</span>` +
    `</div>`;
}

/**
 * Binds every picker under `root`. Idempotent.
 *
 * Only Apply mode needs behaviour: it holds a pending set, so Enter commits it
 * and Escape restores the last committed one without closing the panel or
 * moving focus. Immediate mode has nothing to hold, so a toggle is the whole
 * interaction and the browser already does it.
 *
 * Both dispatch events rather than mutating state, because the selection
 * belongs to the application.
 */
export function hydrateChoicePickers(root = document) {
  const pickers = [...root.querySelectorAll('.ol8-picker')];

  for (const picker of pickers) {
    if (picker.dataset.ol8PickerBound === 'true') continue;
    if (picker.dataset.ol8Commitment !== 'apply') { picker.dataset.ol8PickerBound = 'true'; continue; }

    const commit = () => picker.dispatchEvent(new CustomEvent('ol8:apply', { bubbles: true }));
    const restore = () => picker.dispatchEvent(new CustomEvent('ol8:cancel', { bubbles: true }));

    picker.addEventListener('keydown', (event) => {
      // A composing IME uses Enter to choose a candidate. Committing there
      // would apply a selection the person was in the middle of typing.
      if (event.isComposing || event.keyCode === 229) return;
      const from = event.target;
      const inSearch = from.classList && from.classList.contains('ol8-picker__input');
      const inChip = from.closest && from.closest('.ol8-picker__chip');
      if (event.key === 'Enter' && (inSearch || inChip)) {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        restore();                       // focus deliberately stays put
      }
    });

    const apply = picker.querySelector(':scope .ol8-picker__apply');
    if (apply) apply.addEventListener('click', commit);
    const clear = picker.querySelector(':scope .ol8-picker__clear');
    if (clear) clear.addEventListener('click', () =>
      picker.dispatchEvent(new CustomEvent('ol8:clearall', { bubbles: true })));

    picker.dataset.ol8PickerBound = 'true';
  }
  return pickers.length;
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
