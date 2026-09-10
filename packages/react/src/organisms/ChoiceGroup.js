import { createElement, useId, useMemo, useState } from 'react';
import { ChoiceItem } from '../molecules/ChoiceItem.js';
import { computeAggregate } from '../foundations/geometry.js';

function Shell({ kind, legend, instruction, message, invalid, orientation = 'vertical', id, className, children }) {
  return createElement('fieldset', {
    className: `ol8-choice-group ol8-choice-group--${kind}${className ? ` ${className}` : ''}`,
    id,
    ...(orientation === 'horizontal' ? { 'data-ol8-orientation': 'horizontal' } : {}),
    ...(invalid ? { 'data-ol8-validity': 'invalid' } : {}),
  }, [
    createElement('legend', { key: 'legend', className: 'ol8-choice-group__legend' }, legend),
    instruction ? createElement('p', { key: 'i', className: 'ol8-choice-group__instruction' }, instruction) : null,
    children,
    message ? createElement('p', { key: 'm', className: 'ol8-choice-group__message', ...(invalid ? { role: 'alert' } : {}) }, message) : null,
  ]);
}

/**
 * ORGANISM. Native radios already give roving focus, single selection and form
 * submission, so this only builds the shell around them.
 */
export function RadioGroup({
  legend, name, options, value, onChange, instruction, message, invalid = false,
  disabled = false, orientation = 'vertical', size = 'standard', material = 'regular',
  required = false, id, className = '',
}) {
  if (!legend) throw new Error('[ol8] a radio group requires a legend');
  if (!name) throw new Error('[ol8] a radio group requires a name — it is what makes it a group');
  if (!options?.length) throw new Error('[ol8] a radio group requires options');
  return createElement(Shell, { kind: 'radio', legend, instruction, message, invalid, orientation, id, className },
    createElement('div', { key: 'options', className: 'ol8-choice-group__options' },
      options.map((o) => createElement(ChoiceItem, {
        key: o.value, kind: 'radio', name, value: o.value, size, material, required, invalid,
        description: o.description, disabled: disabled || !!o.disabled,
        checked: value !== undefined ? o.value === value : undefined,
        onChange: onChange ? () => onChange(o.value) : undefined,
      }, o.label))));
}

/**
 * ORGANISM. Aggregate None/Some/All is computed from the children; Mixed is
 * never a third preference a user can choose. Toggling the parent resolves the
 * whole subtree rather than cycling back through Mixed.
 */
export function CheckboxGroup({
  legend, parentLabel, options, name, onChange, instruction, message, invalid = false,
  disabled = false, size = 'standard', material = 'regular', id, className = '',
}) {
  if (!legend) throw new Error('[ol8] a checkbox group requires a legend');
  if (!parentLabel) throw new Error('[ol8] a checkbox hierarchy requires a parent label');
  if (!options?.length) throw new Error('[ol8] a checkbox group requires options');
  const auto = useId();
  const [state, setState] = useState(() => Object.fromEntries(options.map((o) => [o.value, !!o.checked])));
  const aggregate = useMemo(
    () => computeAggregate(options.map((o) => ({ checked: state[o.value], disabled: disabled || !!o.disabled }))),
    [state, options, disabled]
  );
  const setAll = (next) => {
    const updated = Object.fromEntries(options.map((o) => [o.value, (disabled || o.disabled) ? state[o.value] : next]));
    setState(updated); onChange?.(updated);
  };
  return createElement(Shell, { kind: 'checkbox', legend, instruction, message, invalid, id: id ?? `ol8-group-${auto}`, className }, [
    createElement(ChoiceItem, {
      key: 'parent', kind: 'checkbox', size, material, disabled, invalid,
      className: 'ol8-choice-group__parent',
      checked: aggregate === 'all', mixed: aggregate === 'some',
      onChange: () => setAll(aggregate !== 'all'),
    }, parentLabel),
    createElement('div', { key: 'children', className: 'ol8-choice-group__children' },
      options.map((o) => createElement(ChoiceItem, {
        key: o.value, kind: 'checkbox', name, value: o.value, size, material,
        description: o.description, disabled: disabled || !!o.disabled,
        className: 'ol8-choice-group__child', checked: !!state[o.value],
        onChange: () => { const u = { ...state, [o.value]: !state[o.value] }; setState(u); onChange?.(u); },
      }, o.label))),
  ]);
}
