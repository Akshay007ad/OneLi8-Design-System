/**
 * Oneli8 · Choice Group (ORGANISM) — headless behavior.
 *
 * Figma (273:603): "Aggregate None/Some/All is computed from nested Checkbox
 * molecules; Mixed is never a third preference. Runtime recursion,
 * parent-child synchronization, group naming, required behavior, reset, and
 * announcements live in code."
 *
 * Two consequences drive this module:
 *
 *  1. Aggregate is an OUTPUT. Nothing may author it. `computeAggregate` is the
 *     single source, and the parent's indeterminate flag is derived from it.
 *  2. Mixed is never a preference a user can choose. Clicking a Mixed parent
 *     resolves the whole subtree to checked — it never cycles back through
 *     Mixed.
 *
 * The radio group needs almost nothing: a native radio group already gives
 * arrow-key roving focus, single selection and form submission. Adding JS for
 * those would only break them.
 */
import { renderChoiceItem, syncIndicator, setChoiceMixed } from '../../molecules/choice-item/choice-item.js';

export const OL8_AGGREGATE = ['none', 'some', 'all'];

/** @returns {'none'|'some'|'all'} */
export function computeAggregate(children) {
  const boxes = [...children].filter(c => !c.disabled);
  if (boxes.length === 0) return 'none';
  const checked = boxes.filter(c => c.checked).length;
  if (checked === 0) return 'none';
  return checked === boxes.length ? 'all' : 'some';
}

function shell({ kind, legend, instruction, message, invalid, orientation, id, className, body }) {
  const uid = id ?? `ol8-group-${Math.random().toString(36).slice(2, 9)}`;
  const instrId = instruction ? `${uid}-instr` : null;
  const msgId = message ? `${uid}-msg` : null;
  const described = [instrId, msgId].filter(Boolean).join(' ');

  const attrs = [
    `class="ol8-choice-group ol8-choice-group--${kind}${className ? ` ${className}` : ''}"`,
    `id="${uid}"`,
    `data-ol8-kind="${kind}"`,
    orientation === 'horizontal' ? 'data-ol8-orientation="horizontal"' : '',
    invalid ? 'data-ol8-invalid="true" aria-invalid="true"' : '',
    described ? `aria-describedby="${described}"` : '',
  ].filter(Boolean).join(' ');

  return `<fieldset ${attrs}>` +
    `<legend class="ol8-choice-group__legend">${escapeText(legend)}</legend>` +
    (instruction ? `<p class="ol8-choice-group__instruction" id="${instrId}">${escapeText(instruction)}</p>` : '') +
    body +
    (message ? `<p class="ol8-choice-group__message" id="${msgId}"${invalid ? ' role="alert"' : ''}>${escapeText(message)}</p>` : '') +
    `</fieldset>`;
}

/**
 * Radio group. Native semantics do the work; this only builds the shell.
 * @param {{legend:string,name:string,options:Array<{label:string,value:string,description?:string,disabled?:boolean}>,
 *          value?:string,instruction?:string,message?:string,invalid?:boolean,disabled?:boolean,
 *          orientation?:'vertical'|'horizontal',size?:string,material?:string,required?:boolean,id?:string,className?:string}} config
 */
export function renderRadioGroup(config) {
  const { legend, name, options, value, instruction, message, invalid = false, disabled = false,
          orientation = 'vertical', size = 'standard', material = 'regular', required = false,
          id, className } = config;
  if (!legend) throw new Error('[ol8] a radio group requires a legend');
  if (!name) throw new Error('[ol8] a radio group requires a name — it is what makes it a group');
  if (!options?.length) throw new Error('[ol8] a radio group requires options');

  const items = options.map(o => renderChoiceItem('radio', o.label, {
    size, name, value: o.value, material, required,
    checked: value !== undefined && o.value === value,
    disabled: disabled || !!o.disabled,
    invalid, description: o.description,
  })).join('');

  return shell({ kind: 'radio', legend, instruction, message, invalid, orientation, id, className,
    body: `<div class="ol8-choice-group__options">${items}</div>` });
}

/**
 * Checkbox hierarchy: one parent whose state is computed from its children.
 * The parent is rendered unchecked; hydration derives its real state.
 */
export function renderCheckboxGroup(config) {
  const { legend, parentLabel, options, instruction, message, invalid = false, disabled = false,
          size = 'standard', material = 'regular', name, id, className } = config;
  if (!legend) throw new Error('[ol8] a checkbox group requires a legend');
  if (!parentLabel) throw new Error('[ol8] a checkbox hierarchy requires a parent label');
  if (!options?.length) throw new Error('[ol8] a checkbox group requires options');

  const parent = renderChoiceItem('checkbox', parentLabel, {
    size, material, disabled, invalid, className: 'ol8-choice-group__parent',
  });
  const children = options.map(o => renderChoiceItem('checkbox', o.label, {
    size, material, name, value: o.value, checked: !!o.checked,
    disabled: disabled || !!o.disabled, description: o.description,
    className: 'ol8-choice-group__child',
  })).join('');

  return shell({ kind: 'checkbox', legend, instruction, message, invalid, orientation: 'vertical',
    id, className,
    body: parent + `<div class="ol8-choice-group__children">${children}</div>` });
}

/**
 * Wires every checkbox hierarchy under `root`. Idempotent.
 * Radio groups need no wiring — the browser already owns their behaviour.
 */
export function hydrateChoiceGroups(root = document) {
  const groups = [...root.querySelectorAll('.ol8-choice-group--checkbox')];

  for (const group of groups) {
    const parentRow = group.querySelector(':scope > .ol8-choice-group__parent');
    const parent = parentRow?.querySelector(':scope > .ol8-choice__input');
    const children = [...group.querySelectorAll('.ol8-choice-group__child > .ol8-choice__input')];
    if (!parent || children.length === 0) continue;

    applyAggregate(group, parentRow, parent, children);

    if (group.dataset.ol8GroupBound === 'true') continue;

    // Mixed is never a preference: a Mixed parent resolves to all-checked.
    parent.addEventListener('change', () => {
      const target = parent.indeterminate ? true : parent.checked;
      for (const child of children) {
        if (child.disabled) continue;
        child.checked = target;
        syncIndicator(child.closest('.ol8-choice'));
      }
      applyAggregate(group, parentRow, parent, children);
      group.dispatchEvent(new CustomEvent('ol8:aggregatechange', {
        bubbles: true, detail: { aggregate: computeAggregate(children) },
      }));
    });

    for (const child of children) {
      child.addEventListener('change', () => {
        applyAggregate(group, parentRow, parent, children);
        group.dispatchEvent(new CustomEvent('ol8:aggregatechange', {
          bubbles: true, detail: { aggregate: computeAggregate(children) },
        }));
      });
    }
    group.dataset.ol8GroupBound = 'true';
  }
  return groups.length;
}

function applyAggregate(group, parentRow, parent, children) {
  const aggregate = computeAggregate(children);
  group.dataset.ol8Aggregate = aggregate;
  parent.checked = aggregate === 'all';
  setChoiceMixed(parentRow, aggregate === 'some');
  syncIndicator(parentRow);
}

function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
