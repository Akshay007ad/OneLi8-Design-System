import { createElement, forwardRef } from 'react';
import { OL8_FORM_MESSAGE_TONES, OL8_FORM_MESSAGE_ICONS } from '../foundations/geometry.js';
import { Icon } from '../atoms/Icon.js';

/**
 * MOLECULE. Figma 177:13: "Tone maps to semantic message tone; Pending is
 * resolved through validationStatus rather than treated as a fifth error tone.
 * Runtime role, status announcement and relationships live in code."
 *
 * So the role and the live region are decided here, from the tone: critical is
 * the only tone that interrupts, because it is the only one that stops a person
 * from finishing.
 */
export const FormMessage = forwardRef(function FormMessage({
  children, tone = 'critical', icon = true, className = '', ...rest
}, ref) {
  if (!OL8_FORM_MESSAGE_TONES.includes(tone)) {
    throw new Error(`[ol8] unknown form message tone "${tone}"`);
  }

  return createElement('div', {
    ...rest, ref,
    className: `ol8-form-message${className ? ` ${className}` : ''}`,
    'data-ol8-tone': tone,
    role: tone === 'critical' ? 'alert' : 'status',
    'aria-live': tone === 'critical' ? 'assertive' : 'polite',
  },
    icon
      ? createElement(Icon, { key: 'icon', name: OL8_FORM_MESSAGE_ICONS[tone], size: 18, className: 'ol8-form-message__icon' })
      : null,
    createElement('span', { key: 'text', className: 'ol8-form-message__text' }, children),
  );
});
