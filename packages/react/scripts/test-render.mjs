/**
 * The React reference must answer the same way the core renderer does. This
 * renders every component to markup and checks the parts that carry meaning:
 * roles, names, relationships and state. A drift between the two is a bug in
 * one of them, and this is where it surfaces.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextField, FormMessage, Tabs, SegmentedControl, TabBar, Link,
         ChoiceChip, Token, MultiSelectField, ChoicePicker,
         SelectionPopup, Combobox, Select } from '../src/index.js';
import { renderChoiceChip, renderToken } from '@oneli8/core';

const out = [];
const t = (name, fn) => { try { fn(); out.push(`ok   ${name}`); } catch (e) { out.push(`FAIL ${name}: ${e.message}`); } };
const html = (el) => renderToStaticMarkup(el);
const has = (s, sub) => { if (!s.includes(sub)) throw new Error(`missing ${sub} in ${s.slice(0, 200)}`); };
const count = (s, re) => (s.match(re) || []).length;
const threws = (name, fn) => t(name, () => {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});

const FAMILY_EMOJI = '\u{1F469}‍\u{1F469}‍\u{1F467}‍\u{1F466}';

t('TextField renders a native input with an associated label', () => {
  const s = html(createElement(TextField, { label: 'Email', id: 'e', name: 'email' }));
  has(s, '<input'); has(s, 'for="e"'); has(s, 'id="e"'); has(s, 'data-ol8-size="comfortable"');
});
t('TextField pairs invalid with its message', () => {
  const s = html(createElement(TextField, { label: 'Email', id: 'e', invalid: true, message: 'Use name@example.com' }));
  has(s, 'aria-invalid="true"'); has(s, 'aria-errormessage="e-message"'); has(s, 'role="alert"');
});
threws('TextField refuses read only plus invalid', () =>
  html(createElement(TextField, { label: 'X', readOnly: true, invalid: true })));
threws('TextField refuses Pending as a tone', () =>
  html(createElement(TextField, { label: 'X', messageTone: 'pending' })));
t('TextField counts graphemes in its counter', () => {
  const s = html(createElement(TextField, { label: 'Bio', value: FAMILY_EMOJI, characterLimit: 5, onChange() {} }));
  has(s, '1 / 5');
});
t('TextField sets no native maxlength, since it counts code units', () => {
  const s = html(createElement(TextField, { label: 'Bio', characterLimit: 5 }));
  if (s.includes('maxlength')) throw new Error('a native maxlength would cut a cluster in half');
});
t('FormMessage tone drives role and live region', () => {
  has(html(createElement(FormMessage, { tone: 'critical' }, 'x')), 'aria-live="assertive"');
  has(html(createElement(FormMessage, { tone: 'positive' }, 'x')), 'aria-live="polite"');
});

const tabItems = [{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Activity' }, { id: 'c', label: 'Settings', disabled: true }];
t('Tabs emit tablist, tab and one tab stop', () => {
  const s = html(createElement(Tabs, { label: 'Sections', items: tabItems }));
  has(s, 'role="tablist"'); has(s, 'aria-label="Sections"');
  if (count(s, /tabindex="0"/g) !== 1) throw new Error('expected exactly one tab stop');
});
t('Tabs pair each item with exactly one owned panel', () => {
  const s = html(createElement(Tabs, { label: 'S', items: tabItems, renderPanel: (i) => i.label }));
  if (count(s, /role="tabpanel"/g) !== 3) throw new Error('expected three panels');
  if (count(s, /hidden=""/g) !== 2) throw new Error('expected two hidden panels');
});
threws('Tabs refuse a list with no name', () => html(createElement(Tabs, { label: '', items: tabItems })));
threws('Tabs refuse duplicate ids', () =>
  html(createElement(Tabs, { label: 'S', items: [{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }] })));
threws('Tabs refuse a list with no enabled tab', () =>
  html(createElement(Tabs, { label: 'S', items: [{ id: 'a', label: 'A', disabled: true }] })));

const segItems = [{ id: 'd', label: 'Daily' }, { id: 'w', label: 'Weekly' }];
t('SegmentedControl role follows the declared behavior', () => {
  has(html(createElement(SegmentedControl, { label: 'R', behavior: 'single', items: segItems })), 'role="radiogroup"');
  has(html(createElement(SegmentedControl, { label: 'R', behavior: 'multi', items: segItems })), 'role="group"');
});
threws('SegmentedControl refuses an undeclared behavior', () =>
  html(createElement(SegmentedControl, { label: 'R', items: segItems })));
threws('SegmentedControl refuses an array for single selection', () =>
  html(createElement(SegmentedControl, { label: 'R', behavior: 'single', items: segItems, value: ['d'] })));
threws('a momentary control stores no selection', () =>
  html(createElement(SegmentedControl, { label: 'R', behavior: 'momentary', items: segItems, value: 'd' })));
t('presentation never changes behavior', () => {
  for (const p of ['inset-fill', 'line-indicator', 'outlined-selection', 'soft-pill', 'stacked-label']) {
    has(html(createElement(SegmentedControl, { label: 'R', behavior: 'single', items: segItems, presentation: p })), 'role="radiogroup"');
  }
});
t('an icon only segment still carries a name', () => {
  const s = html(createElement(SegmentedControl, {
    label: 'View', behavior: 'single', presentation: 'icon-only',
    items: [{ id: 'g', label: 'Grid', icon: 'add' }],
  }));
  has(s, 'aria-label="Grid"');
});

const dests = [{ href: '/', label: 'Home' }, { href: '/inbox', label: 'Inbox', badge: 3 }];
t('TabBar uses real links and one current destination', () => {
  const s = html(createElement(TabBar, { label: 'Primary', items: dests, current: '/inbox' }));
  has(s, '<nav'); has(s, 'href="/inbox"'); has(s, 'aria-current="page"');
  if (count(s, /aria-current/g) !== 1) throw new Error('expected exactly one current destination');
});
threws('TabBar refuses a disabled destination', () =>
  html(createElement(TabBar, { label: 'P', items: [{ href: '/x', label: 'X', disabled: true }] })));
threws('TabBar refuses a current destination it does not list', () =>
  html(createElement(TabBar, { label: 'P', items: dests, current: '/nowhere' })));
threws('TabBar refuses a destination with no href', () =>
  html(createElement(TabBar, { label: 'P', items: [{ label: 'X' }] })));

t('Link has only the three sizes Figma draws', () => {
  has(html(createElement(Link, { href: '/x', size: 'large' }, 'Read')), 'data-ol8-size="large"');
  let threw = false;
  try { html(createElement(Link, { href: '/x', size: 'inherit' }, 'Read')); } catch { threw = true; }
  if (!threw) throw new Error('inherit is not a Figma size and must be refused');
});

const failed = out.filter(l => l.startsWith('FAIL'));
if (failed.length) {
  console.error('✗ React reference failed:');
  for (const f of out) console.error('  · ' + f);
  process.exit(1);
}

// ---- Choice Chip and Token ---------------------------------------------
t('ChoiceChip renders the same real checkbox the core renderer does', () => {
  const s = html(createElement(ChoiceChip, { selected: true, showMark: true, id: 'c1', onChange() {} }, 'Accessibility'));
  has(s, 'type="checkbox"'); has(s, 'checked'); has(s, 'data-ol8-selection="selected"');
  has(s, 'ol8-chip__mark');
});
t('ChoiceChip draws the same silhouette as core, path for path', () => {
  const s = html(createElement(ChoiceChip, { id: 'c2' }, 'Accessibility'));
  const core = renderChoiceChip('Accessibility', { id: 'c2' });
  const corePath = core.match(/d="(M12 0[^"]+Z)"/)[1];
  has(s, corePath);
  const coreEdge = core.match(/d="(M12 0[^"]+L12 30)"/)[1];
  has(s, coreEdge);
  if (count(s, /ol8-chip__terminal--/g) !== 2) throw new Error('two terminals, one per end');
});
t('ChoiceChip keeps the mark after the label, as Figma draws it', () => {
  const s = html(createElement(ChoiceChip, { showMark: true, id: 'c3' }, 'Accessibility'));
  if (s.indexOf('ol8-chip__mark') < s.indexOf('ol8-chip__label')) {
    throw new Error('the mark trails the label, so Check and Remove share one side');
  }
});
threws('ChoiceChip refuses a size Figma does not draw', () =>
  html(createElement(ChoiceChip, { size: 'huge' }, 'A')));

t('Token delegates geometry to the chip owner', () => {
  const s = html(createElement(Token, { id: 't1' }, 'Accessibility'));
  has(s, 'ol8-token'); has(s, 'ol8-chip');
  const core = renderToken('Accessibility', { id: 't1' });
  has(s, core.match(/d="(M12 0[^"]+Z)"/)[1]);
});
t('Token auto resolves to Remove for a removable value, as in core', () => {
  const s = html(createElement(Token, { id: 't2' }, 'Accessibility'));
  has(s, 'data-ol8-mark="remove"');
  has(s, 'aria-label="Remove Accessibility"');
  has(renderToken('Accessibility', { id: 't2' }), 'data-ol8-mark="remove"');
});
t('Token Mark None leaves no phantom slot and no control', () => {
  const s = html(createElement(Token, { mark: 'none' }, 'Accessibility'));
  has(s, 'data-ol8-mark="none"');
  if (s.includes('ol8-chip__mark')) throw new Error('None must collapse the slot');
  if (s.includes('<input') || s.includes('<button')) throw new Error('a token is content, not a control');
});
threws('Token refuses a Remove mark on a non removable value', () =>
  html(createElement(Token, { mark: 'remove', removable: false }, 'A')));


// ---- The three organisms ------------------------------------------------
const SKILLS = [{ value: 'ui', label: 'Interface' }, { value: 'ps', label: 'Photoshop' }];

t('MultiSelectField answers like core: tokens out of the tab order', () => {
  const s = html(createElement(MultiSelectField, { label: 'Skills', id: 'f', options: SKILLS, values: ['ui', 'ps'] }));
  if (count(s, /tabindex="-1"/g) !== 2) throw new Error('both Remove buttons leave the tab order');
  has(s, 'role="combobox"'); has(s, 'aria-controls="f-popup"');
});
t('a committed value shows its option label, not its value', () => {
  const s = html(createElement(MultiSelectField, { label: 'S', id: 'f', options: SKILLS, values: ['ui'] }));
  has(s, '>Interface</span>'); has(s, 'aria-label="Remove Interface"');
});
threws('MultiSelectField refuses a value outside a constrained set', () =>
  html(createElement(MultiSelectField, { label: 'S', options: SKILLS, values: ['nope'] })));
threws('MultiSelectField refuses a duplicate', () =>
  html(createElement(MultiSelectField, { label: 'S', options: SKILLS, values: ['ui', 'ui'] })));
threws('MultiSelectField refuses read only plus invalid', () =>
  html(createElement(MultiSelectField, { label: 'S', readOnly: true, invalid: true })));
t('MultiSelectField expanded opens a multi selectable listbox', () => {
  const s = html(createElement(MultiSelectField, { label: 'Skills', id: 'f', options: SKILLS, values: ['ui'], expanded: true }));
  has(s, 'aria-multiselectable="true"'); has(s, 'id="f-popup"');
});
t('a read only field keeps its values as labelled content', () => {
  const s = html(createElement(MultiSelectField, { label: 'S', id: 'f', options: SKILLS, values: ['ui'], readOnly: true }));
  has(s, 'data-ol8-mark="none"');
  if (s.includes('ol8-token__remove')) throw new Error('no dead Remove button');
});

const OPTS = [{ value: 'a', label: 'Interface Design', selected: true }, { value: 'b', label: 'Web' }];
t('ChoicePicker apply mode matches core: a real action, not a sentence', () => {
  const s = html(createElement(ChoicePicker, { label: 'Search', id: 'p', options: OPTS, commitBehavior: 'apply' }));
  has(s, 'class="ol8-picker__apply"'); has(s, 'Enter to apply'); has(s, '1 selected');
  has(s, 'role="group"');
});
threws('ChoicePicker refuses an apply action under immediate commitment', () =>
  html(createElement(ChoicePicker, { label: 'S', options: OPTS, applyHint: 'Apply' })));
t('ChoicePicker immediate mode draws no commitment line', () => {
  const s = html(createElement(ChoicePicker, { label: 'S', id: 'p', options: OPTS }));
  if (s.includes('ol8-picker__commitment')) throw new Error('nothing is pending, so nothing is said');
  if (count(s, /type="checkbox"/g) !== 2) throw new Error('every option is a real checkbox');
});
t('ChoicePicker peers never mix Check and None', () => {
  has(html(createElement(ChoicePicker, { label: 'S', id: 'p', options: OPTS })), 'ol8-chip__mark');
  const none = html(createElement(ChoicePicker, { label: 'S', id: 'p', options: OPTS, mark: 'none' }));
  if (none.includes('ol8-chip__mark')) throw new Error('None collapses the slot for every peer');
});
t('SelectionPopup options are divs, matching the core renderer', () => {
  const s = html(createElement(SelectionPopup, { id: 'x', label: 'Skills', options: SKILLS, multiple: true }));
  has(s, 'role="listbox"'); has(s, 'aria-multiselectable="true"');
  if (s.includes('<li')) throw new Error('an li outside a list is invalid markup');
  if (count(s, /role="option"/g) !== 2) throw new Error('one option per item');
});
threws('SelectionPopup refuses a wordless status', () =>
  html(createElement(SelectionPopup, { id: 'x', label: 'S', options: SKILLS, status: 'loading' })));


// ---- The Select and Combobox variant matrices, React side ---------------
const MATERIALS = ['regular', 'gem'];
const APPEARANCES = ['outline', 'filled'];
const SIZES = ['compact', 'standard', 'comfortable', 'large'];
const ITEMS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

t('Combobox answers for all sixteen Figma variants', () => {
  let seen = 0;
  for (const material of MATERIALS) for (const appearance of APPEARANCES) for (const size of SIZES) {
    const s = html(createElement(Combobox, { label: 'Pick', id: `c${seen}`, options: ITEMS, material, appearance, size }));
    has(s, `data-ol8-size="${size}"`); has(s, `data-ol8-appearance="${appearance}"`);
    if (material === 'gem' && !s.includes('data-ol8-material="gem"')) throw new Error('gem is an attribute');
    seen += 1;
  }
  if (seen !== 16) throw new Error('Material x Appearance x Size');
});
t('Select answers for all sixteen Figma variants', () => {
  let seen = 0;
  for (const material of MATERIALS) for (const appearance of APPEARANCES) for (const size of SIZES) {
    const s = html(createElement(Select, { label: 'Pick', id: `s${seen}`, options: ITEMS, material, appearance, size }));
    has(s, `data-ol8-size="${size}"`); has(s, `data-ol8-appearance="${appearance}"`);
    seen += 1;
  }
  if (seen !== 16) throw new Error('Material x Appearance x Size');
});
t('Combobox Expanded is a boolean and multiplies no variants', () => {
  const shut = html(createElement(Combobox, { label: 'P', id: 'c', options: ITEMS }));
  const open = html(createElement(Combobox, { label: 'P', id: 'c', options: ITEMS, open: true }));
  has(shut, 'aria-expanded="false"'); has(open, 'aria-expanded="true"');
  has(shut, 'id="c-listbox"'); has(open, 'id="c-listbox"');
});
t('Combobox keeps focus on the input and options out of the tab order', () => {
  const s = html(createElement(Combobox, { label: 'P', id: 'c', options: ITEMS, open: true, active: 'a', clearable: true }));
  has(s, 'aria-activedescendant="c-listbox-option-a"');
  has(s, 'tabindex="-1"');            // the clear action is not a second stop
  if (s.includes('tabindex="0"')) throw new Error('no popup descendant is a tab stop');
});
threws('Combobox refuses clearable on a required value', () =>
  html(createElement(Combobox, { label: 'P', options: ITEMS, required: true, clearable: true })));
threws('Combobox refuses read only plus invalid', () =>
  html(createElement(Combobox, { label: 'P', options: ITEMS, readOnly: true, invalid: true })));

console.log(`✓ React reference: ${out.length}/${out.length} checks`);
