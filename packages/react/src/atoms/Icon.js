import { createElement } from 'react';
import { OL8_ICONS, OL8_ICON_VIEWBOX } from '../foundations/icons.generated.js';
import { isOl8IconName } from '../foundations/geometry.js';

/**
 * Icons are decorative by default. Meaning belongs to the parent control, so an
 * unnamed icon is hidden from assistive technology rather than announced as an
 * unlabelled graphic. Colour is never set here: every stroke and fill is
 * currentColor and the consuming component supplies the semantic role.
 */
/** The bare <svg>, for slots that already carry the ol8-icon class. */
export function IconGlyph({ name }) {
  if (!isOl8IconName(name)) throw new Error(`[ol8] unknown icon "${name}".`);
  return createElement('svg', { viewBox: OL8_ICON_VIEWBOX, fill: 'none', focusable: 'false' },
    OL8_ICONS[name].elements.map((el, i) => createElement(el.tag, { key: i, ...el.attrs })));
}

export function Icon({ name, size = 24, label, className = '', ...rest }) {
  if (!isOl8IconName(name)) {
    throw new Error(`[ol8] unknown icon "${name}". Choose from OL8_ICONS rather than inventing a name.`);
  }
  const semantic = typeof label === 'string' && label.length > 0;
  return createElement(
    'span',
    {
      ...rest,
      className: `ol8-icon${className ? ` ${className}` : ''}`,
      'data-ol8-icon': name,
      'data-ol8-icon-size': size,
      ...(semantic ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }),
    },
    createElement(IconGlyph, { name })
  );
}
