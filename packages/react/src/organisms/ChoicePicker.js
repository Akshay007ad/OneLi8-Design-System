import { createElement, useId } from 'react';
import { Icon } from '../atoms/Icon.js';
import { ChoiceChip } from '../molecules/ChoiceChip.js';
import { OL8_PICKER_SIZES, OL8_PICKER_MATERIALS, OL8_COMMIT_BEHAVIORS,
         OL8_PICKER_PRESENTATIONS, OL8_PICKER_MARKS } from '../foundations/geometry.js';

/**
 * ORGANISM. Search over a wrapping matrix of choices. The inline composition is
 * canonical: an accessible group holding a search field, real checkboxes
 * wearing the Choice Chip appearance, and, in Apply mode, a commitment line.
 *
 * It is a group rather than a dialog pretending to be a listbox, because the
 * surface holds search, many independent choices and actions.
 *
 * Figma draws "Enter to apply" as text. The maintainer decision requires it to
 * be a real clickable and focusable action, because a keyboard instruction is
 * not an affordance for a pointer, touch, or a screen reader.
 */
export function ChoicePicker({
  label, id, name, options = [], commitBehavior = 'immediate',
  presentation = 'inline', mark = 'check', size = 'comfortable', material = 'regular',
  inputValue, placeholder, showLabel = false, selectedSummary, applyHint,
  showClearAll = false, clearAllLabel = 'Clear all',
  disabled = false, readOnly = false, status = 'none', statusText,
  onApply, onCancel, onClearAll, onToggle, onInputValueChange,
  className = '', ...rest
}) {
  if (!label) throw new Error('[ol8] a Choice Picker requires a label for its search');
  if (!OL8_PICKER_SIZES.includes(size)) throw new Error(`[ol8] unknown size "${size}"`);
  if (!OL8_PICKER_MATERIALS.includes(material)) throw new Error(`[ol8] unknown material "${material}"`);
  if (!OL8_COMMIT_BEHAVIORS.includes(commitBehavior)) throw new Error(`[ol8] unknown commit behavior "${commitBehavior}"`);
  if (!OL8_PICKER_PRESENTATIONS.includes(presentation)) throw new Error(`[ol8] unknown presentation "${presentation}"`);
  if (!OL8_PICKER_MARKS.includes(mark)) throw new Error(`[ol8] unknown mark "${mark}"`);
  if (commitBehavior === 'immediate' && applyHint !== undefined) {
    throw new Error('[ol8] immediate commitment applies every toggle at once, so an apply action would be a lie');
  }
  if (status !== 'none' && !statusText) {
    throw new Error('[ol8] a picker status needs words. A spinner alone tells a screen reader nothing.');
  }

  const auto = useId();
  const uid = id ?? `ol8-picker-${auto}`;
  const labelId = `${uid}-label`;
  const statusId = `${uid}-status`;
  const selected = options.filter(o => o.selected);
  const hint = applyHint ?? 'Enter to apply';
  const locked = disabled || readOnly;

  // A composing IME uses Enter to choose a candidate; committing there would
  // apply a selection the person was still typing.
  const onKeyDown = commitBehavior !== 'apply' ? undefined : (event) => {
    if (event.nativeEvent && event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') { event.preventDefault(); onApply && onApply(); }
    else if (event.key === 'Escape') { event.preventDefault(); onCancel && onCancel(); }
  };

  return createElement('div', {
    ...rest, onKeyDown,
    className: `ol8-picker${className ? ` ${className}` : ''}`,
    role: 'group', 'aria-labelledby': labelId,
    'data-ol8-size': size, 'data-ol8-commitment': commitBehavior,
    'data-ol8-presentation': presentation, 'data-ol8-mark': mark,
    ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    ...(disabled ? { 'data-ol8-availability': 'disabled' } : {}),
    ...(readOnly ? { 'data-ol8-readonly': 'true' } : {}),
  }, [
    createElement('div', {
      key: 'search', className: 'ol8-field ol8-picker__field',
      'data-ol8-size': size, 'data-ol8-appearance': 'outline',
      ...(material === 'gem' ? { 'data-ol8-material': 'gem' } : {}),
    }, [
      createElement('div', {
        key: 'lr',
        className: `ol8-field__label-row${showLabel ? '' : ' ol8-picker__label-row--hidden'}`,
      }, createElement('label', { className: 'ol8-field__label', id: labelId, htmlFor: uid }, label)),
      createElement('div', { key: 'cs', className: 'ol8-field__control-stack' },
        createElement('div', { className: 'ol8-field__control' }, [
          createElement(Icon, { key: 'i', name: 'search', size: 18, className: 'ol8-field__leading-icon' }),
          createElement('input', {
            key: 'input', className: 'ol8-field__input ol8-picker__input', id: uid, type: 'search',
            ...(inputValue !== undefined
              ? { value: inputValue, onChange: (e) => onInputValueChange && onInputValueChange(e.target.value) }
              : {}),
            placeholder, disabled, readOnly, 'aria-describedby': statusId,
          }),
        ])),
    ]),
    createElement('div', { key: 'matrix', className: 'ol8-picker__matrix' },
      options.map((o, i) => createElement(ChoiceChip, {
        key: o.value, size, selected: !!o.selected,
        showMark: mark === 'check' && !!o.selected,
        disabled: locked || o.disabled,
        name: name ? `${name}[]` : undefined, value: o.value,
        id: `${uid}-option-${i}`, className: 'ol8-picker__chip',
        onChange: onToggle ? () => onToggle(o) : undefined,
      }, o.label))),
    commitBehavior === 'apply'
      ? createElement('div', { key: 'commit', className: 'ol8-picker__commitment' }, [
          createElement('span', { key: 's', className: 'ol8-picker__summary' },
            selectedSummary ?? `${selected.length} selected`),
          showClearAll ? createElement('button', {
            key: 'c', type: 'button', className: 'ol8-picker__clear', onClick: onClearAll, disabled: locked,
          }, clearAllLabel) : null,
          createElement('button', {
            key: 'a', type: 'button', className: 'ol8-picker__apply', onClick: onApply, disabled: locked,
          }, hint),
        ])
      : null,
    createElement('span', {
      key: 'status', className: 'ol8-picker__status', id: statusId,
      role: 'status', 'aria-live': 'polite',
    }, status !== 'none' ? statusText : ''),
  ]);
}
