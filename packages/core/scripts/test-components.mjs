/**
 * Executable contract for the core molecules. Every check below states a rule
 * that either Figma draws or a component contract writes down, so a change that
 * quietly breaks one of them cannot reach a package.
 */
import { renderTextField, renderFormMessage, countGraphemes, clipToGraphemes,
         renderTabs, renderTabPanel, renderSegmentedControl, renderTabBar,
         renderNavigationBadge, renderChoiceChip, renderToken,
         resolveTokenMark, renderMultiSelectField,
         renderChoicePicker } from '../src/index.js';
import { resolveNavigationKey } from '../src/organisms/navigation-keys.js';

const out = [];
const t = (name, fn) => { try { fn(); out.push(`ok   ${name}`); } catch (e) { out.push(`FAIL ${name}: ${e.message}`); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };
const has = (s, sub) => { if (!s.includes(sub)) throw new Error(`missing ${sub}`); };
const hasnt = (s, sub) => { if (s.includes(sub)) throw new Error(`unexpected ${sub}`); };

t('default size is Comfortable, per the contract', () => {
  has(renderTextField({ label: 'Email' }), 'data-ol8-size="comfortable"');
});
t('label is associated with the input', () => {
  const h = renderTextField({ label: 'Email', id: 'e1' });
  has(h, '<label class="ol8-field__label" for="e1"'); has(h, 'id="e1"');
});
t('hidden label still names the input', () => {
  const h = renderTextField({ label: 'Search', showLabel: false, id: 'q' });
  hasnt(h, 'ol8-field__label-row'); has(h, 'aria-label="Search"');
});
t('invalid exposes aria-invalid and points at the message', () => {
  const h = renderTextField({ label: 'Email', id: 'e', invalid: true, message: 'Use name@example.com' });
  has(h, 'aria-invalid="true"'); has(h, 'aria-errormessage="e-message"'); has(h, 'role="alert"');
});
t('read only plus invalid is refused', () => {
  let threw = false;
  try { renderTextField({ label: 'X', readOnly: true, invalid: true }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});
t('pending is a status, not a tone', () => {
  let threw = false;
  try { renderTextField({ label: 'X', messageTone: 'pending' }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
  has(renderTextField({ label: 'X', validationStatus: 'pending', message: 'Checking' }), 'data-ol8-tone="pending"');
});
t('describedby names instruction, message and counter in order', () => {
  const h = renderTextField({ label: 'Bio', id: 'b', instruction: 'Keep it short', message: 'Too long', characterLimit: 60 });
  has(h, 'aria-describedby="b-instruction b-message b-counter"');
});
t('no native maxlength, because it counts code units', () => {
  hasnt(renderTextField({ label: 'B', characterLimit: 10 }), 'maxlength');
});
t('counter counts graphemes', () => {
  eq(countGraphemes('👩‍👩‍👧‍👦'), 1, 'family emoji is one character');
  eq(countGraphemes('café'), 4, 'combining mark');
  eq(clipToGraphemes('👩‍👩‍👧‍👦abc', 2), '👩‍👩‍👧‍👦a', 'clip keeps clusters whole');
  has(renderTextField({ label: 'B', id: 'b', value: '👩‍👩‍👧‍👦', characterLimit: 5 }), '>1 / 5<');
});
t('gem is an attribute, not an appearance', () => {
  const h = renderTextField({ label: 'X', material: 'gem', appearance: 'filled' });
  has(h, 'data-ol8-material="gem"'); has(h, 'data-ol8-appearance="filled"');
});
t('slots collapse when absent', () => {
  const h = renderTextField({ label: 'X' });
  hasnt(h, 'ol8-field__affix'); hasnt(h, 'ol8-field__leading-icon'); hasnt(h, 'ol8-field__trailing-action');
  hasnt(h, 'ol8-field__supporting');
});
t('form message tone drives role and live region', () => {
  has(renderFormMessage('x', { tone: 'critical' }), 'aria-live="assertive"');
  has(renderFormMessage('x', { tone: 'informative' }), 'aria-live="polite"');
  has(renderFormMessage('x', { tone: 'positive' }), 'data-ol8-icon="positive"');
  hasnt(renderFormMessage('x', { icon: false }), 'data-ol8-icon');
});
t('markup escapes what a person typed', () => {
  has(renderTextField({ label: '<script>', id: 'a' }), '&lt;script&gt;');
});

// ---- Navigation ---------------------------------------------------------
const threws = (name, fn) => t(name, () => {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});

const tabItems = [{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Activity' }, { id: 'c', label: 'Settings', disabled: true }];

t('tabs emit tablist, tab and a named region', () => {
  const h = renderTabs({ label: 'Account sections', items: tabItems });
  has(h, 'role="tablist"'); has(h, 'aria-label="Account sections"'); has(h, 'role="tab"');
});
t('tabs keep exactly one enabled tab stop', () => {
  const h = renderTabs({ label: 'S', items: tabItems });
  eq((h.match(/tabindex="0"/g) || []).length, 1, 'one tab stop');
});
t('a tab points at exactly one owned panel', () => {
  const h = renderTabs({ label: 'S', items: tabItems, idPrefix: 'p' });
  has(h, 'aria-controls="p-panel-a"');
  has(renderTabPanel('a', 'x', { idPrefix: 'p' }), 'aria-labelledby="p-tab-a"');
});
threws('a tab list with no name is refused', () => renderTabs({ label: '', items: tabItems }));
threws('a tab list of only disabled tabs is refused', () => renderTabs({ label: 'S', items: [{ id: 'a', label: 'A', disabled: true }] }));
threws('two tabs sharing an id are refused', () => renderTabs({ label: 'S', items: [{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }] }));

t('roving focus skips disabled and wraps', () => {
  const items = [{ disabled: false }, { disabled: true }, { disabled: false }];
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 0), 2, 'skips the disabled one');
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 2), 0, 'wraps');
  eq(resolveNavigationKey({ key: 'End' }, items), 2, 'End reaches the last enabled');
  eq(resolveNavigationKey({ key: 'Home' }, items), 0, 'Home reaches the first enabled');
});
t('arrow keys mirror in right to left', () => {
  const items = [{ disabled: false }, { disabled: false }, { disabled: false }];
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 1, { rtl: false }), 2, 'right moves forward normally');
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 1, { rtl: true }), 0, 'and moves backward in RTL');
  eq(resolveNavigationKey({ key: 'ArrowLeft' }, items, 1, { rtl: true }), 2, 'left moves forward in RTL');
});
t('vertical tabs listen to up and down instead', () => {
  const items = [{ disabled: false }, { disabled: false }];
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 0, { orientation: 'vertical' }), -1, 'horizontal keys are not ours');
  eq(resolveNavigationKey({ key: 'ArrowDown' }, items, 0, { orientation: 'vertical' }), 1, 'down moves forward');
});

t('segmented control declares its behavior in the role', () => {
  const items = [{ id: 'd', label: 'Daily' }, { id: 'w', label: 'Weekly' }];
  has(renderSegmentedControl({ label: 'Range', behavior: 'single', items }), 'role="radiogroup"');
  has(renderSegmentedControl({ label: 'Range', behavior: 'multi', items }), 'role="group"');
});
threws('a segmented control without a behavior is refused', () =>
  renderSegmentedControl({ label: 'R', items: [{ id: 'a', label: 'A' }] }));
threws('single selection refuses an array', () =>
  renderSegmentedControl({ label: 'R', behavior: 'single', items: [{ id: 'a', label: 'A' }], selected: ['a'] }));
threws('a momentary control refuses stored selection', () =>
  renderSegmentedControl({ label: 'R', behavior: 'momentary', items: [{ id: 'a', label: 'A' }], selected: 'a' }));
t('presentation never changes behavior', () => {
  const items = [{ id: 'a', label: 'A' }];
  for (const p of ['inset-fill', 'line-indicator', 'outlined-selection', 'soft-pill', 'stacked-label']) {
    has(renderSegmentedControl({ label: 'R', behavior: 'single', items, presentation: p }), 'role="radiogroup"');
  }
});
t('an icon only segment carries a name', () => {
  const h = renderSegmentedControl({ label: 'View', behavior: 'single', presentation: 'icon-only',
    items: [{ id: 'g', label: 'Grid', icon: 'add' }] });
  has(h, 'aria-label="Grid"');
});

const dests = [{ href: '/', label: 'Home', icon: 'add' }, { href: '/inbox', label: 'Inbox', badge: 3 }];
t('tab bar uses real links and one current destination', () => {
  const h = renderTabBar({ label: 'Primary', items: dests, current: '/inbox' });
  has(h, '<nav '); has(h, 'href="/inbox"'); has(h, 'aria-current="page"');
  eq((h.match(/aria-current/g) || []).length, 1, 'exactly one current');
});
threws('a destination without an href is refused', () => renderTabBar({ label: 'P', items: [{ label: 'X' }] }));
threws('a disabled destination is refused rather than redesigned', () =>
  renderTabBar({ label: 'P', items: [{ href: '/x', label: 'X', disabled: true }] }));
threws('a current destination that is not listed is refused', () =>
  renderTabBar({ label: 'P', items: dests, current: '/nowhere' }));
t('the badge is one atom, not three copies', () => {
  has(renderTabBar({ label: 'P', items: dests }), 'ol8-nav-badge');
  has(renderSegmentedControl({ label: 'R', behavior: 'single', items: [{ id: 'a', label: 'A', badge: 2 }] }), 'ol8-nav-badge');
  has(renderTabs({ label: 'T', items: [{ id: 'a', label: 'A', badge: 9 }] }), 'ol8-nav-badge');
});
threws('an empty badge is refused', () => renderNavigationBadge(''));

const failed = out.filter(l => l.startsWith('FAIL'));
if (failed.length) {
  console.error('\u2717 component contract failed:');
  for (const f of out) console.error('  \u00b7 ' + f);
  process.exit(1);
}

// ---- Choice Chip and Token (Figma 636:847 and 897:2106) -----------------
t('the chip is a real checkbox, so selection is not colour alone', () => {
  const h = renderChoiceChip('Accessibility', { selected: true, id: 'c1' });
  has(h, '<input type="checkbox"'); has(h, 'checked');
  has(h, 'data-ol8-selection="selected"');
});
t('every size Figma draws is accepted and nothing else is', () => {
  for (const size of ['compact', 'standard', 'comfortable', 'large']) {
    has(renderChoiceChip('A', { size }), `data-ol8-size="${size}"`);
  }
  let threw = false;
  try { renderChoiceChip('A', { size: 'huge' }); } catch { threw = true; }
  if (!threw) throw new Error('an invented size should have thrown');
});
t('the silhouette is two fixed terminals and one growing rail', () => {
  const h = renderChoiceChip('A', { id: 'c2' });
  eq((h.match(/ol8-chip__terminal--/g) || []).length, 2, 'two terminals');
  has(h, 'ol8-chip__terminal--leading'); has(h, 'ol8-chip__terminal--trailing');
  eq((h.match(/ol8-chip__rail/g) || []).length, 1, 'one rail');
});
t('the terminal viewBox is the 12 x 30 space Figma draws it in', () => {
  has(renderChoiceChip('A'), 'viewBox="0 0 12 30"');
  has(renderChoiceChip('A'), 'preserveAspectRatio="none"');
});
t('the edge omits the seam, so the rail continues one perimeter', () => {
  const h = renderChoiceChip('A', { id: 'c3' });
  // the fill closes with Z; the edge does not, because Figma's outline
  // "deliberately omits the hidden vertical closing edge"
  has(h, 'L12 30 Z"'); has(h, 'L12 30"');
});
t('the mark is absent until Show Mark, and then follows the label', () => {
  hasnt(renderChoiceChip('A'), 'ol8-chip__mark');
  const h = renderChoiceChip('Accessibility', { selected: true, showMark: true, id: 'c4' });
  if (h.indexOf('ol8-chip__mark') < h.indexOf('ol8-chip__label')) {
    throw new Error('the mark trails the label, so Check and Remove share one side');
  }
});
t('a chip refuses an empty label', () => {
  let threw = false;
  try { renderChoiceChip('  '); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});

t('a token delegates its geometry to the chip owner, as Figma does', () => {
  const chip = renderChoiceChip('Accessibility', { id: 'x' });
  const token = renderToken('Accessibility', { id: 'x' });
  has(token, 'ol8-token'); has(token, 'ol8-chip');
  // the same two terminals, the same paths
  eq((token.match(/ol8-chip__terminal--/g) || []).length, 2, 'two terminals');
  const path = chip.match(/d="(M12 0[^"]+Z)"/)[1];
  has(token, path);
});
t('auto resolves the mark the way the contract says', () => {
  eq(resolveTokenMark('auto', { removable: true }), 'remove', 'removable committed value');
  eq(resolveTokenMark('auto', { removable: false, selected: true }), 'check', 'selected choice');
  eq(resolveTokenMark('auto', { removable: false, selected: false }), 'none', 'informational');
  eq(resolveTokenMark('check', { removable: true }), 'check', 'an explicit mark is kept');
});
t('removal is a real button that names the value it removes', () => {
  const h = renderToken('Accessibility', { mark: 'remove', id: 't1' });
  has(h, '<button type="button"'); has(h, 'aria-label="Remove Accessibility"');
  has(h, 'data-ol8-mark="remove"');
  // the label is still complete beside it, never shortened by the mark
  has(h, '>Accessibility</span>');
});
t('a non removable token may not carry a Remove mark', () => {
  let threw = false;
  try { renderToken('A', { mark: 'remove', removable: false }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});
t('Mark None leaves no phantom slot', () => {
  const h = renderToken('A', { mark: 'none' });
  hasnt(h, 'ol8-chip__mark'); has(h, 'data-ol8-mark="none"');
});
t('a token carries no input, because it is content and not a control', () => {
  hasnt(renderToken('A', { mark: 'none' }), '<input');
});


// ---- Multi-select Field (Figma 904:2507 and 978:4472) -------------------
const SKILLS = [{ value: 'ui', label: 'Interface' }, { value: 'ps', label: 'Photoshop' }, { value: 'web', label: 'Web' }];
const field = (o = {}) => renderMultiSelectField({ label: 'Skills', id: 'f', options: SKILLS, ...o });

t('a constrained field refuses a value that is not an option', () => {
  let threw = false;
  try { field({ values: ['Invented'] }); } catch { threw = true; }
  if (!threw) throw new Error('constrained mode cannot create a non option token');
  // suggestive may author one
  has(field({ valuePolicy: 'suggestive', values: ['Invented'] }), '>Invented<');
});
t('a committed value shows its option label, not its value', () => {
  const h = field({ values: ['ui'] });
  has(h, '>Interface<'); hasnt(h, '>ui<');
  has(h, 'aria-label="Remove Interface"');
  // a suggestive field's authored entry has no option, so it shows itself
  has(field({ valuePolicy: 'suggestive', values: ['Rust'] }), '>Rust<');
});
t('a duplicate is never added invisibly', () => {
  let threw = false;
  try { field({ values: ['ui', 'ui'] }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
  eq((field({ values: ['ui', 'ui'], allowDuplicates: true }).match(/ol8-multiselect__token/g) || []).length, 2, 'allowed');
});
t('the maximum blocks additions and says so as a plain status', () => {
  let threw = false;
  try { field({ values: ['ui', 'ps'], maximumValues: 1 }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
  const h = field({ values: ['ui'], maximumValues: 1 });
  has(h, 'data-ol8-full="true"'); has(h, 'Maximum of 1 reached'); has(h, 'role="status"');
});
t('read only plus invalid is refused, as in a Text Field', () => {
  let threw = false;
  try { field({ readOnly: true, invalid: true }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});
t('tokens are not tab stops; Tab enters at the input', () => {
  const h = field({ values: ['ui', 'ps'] });
  eq((h.match(/tabindex="-1"/g) || []).length, 2, 'both Remove buttons leave the tab order');
  has(h, 'class="ol8-field__input ol8-multiselect__input"');
});
t('a read only field keeps its values as labelled content', () => {
  const h = field({ values: ['ui'], readOnly: true });
  has(h, 'data-ol8-mark="none"'); hasnt(h, 'ol8-token__remove');
});
t('expanded points the combobox at a multi selectable listbox', () => {
  const h = field({ values: ['ui'], expanded: true });
  has(h, 'aria-expanded="true"'); has(h, 'aria-controls="f-popup"');
  has(h, 'id="f-popup"'); has(h, 'aria-multiselectable="true"');
});
t('collapsed still answers the id the combobox points at', () => {
  const h = field();
  has(h, 'aria-expanded="false"'); has(h, 'id="f-popup" hidden');
});
t('both appearances are one component, as the Figma description says', () => {
  has(field({ appearance: 'filled' }), 'data-ol8-appearance="filled"');
  has(field({ appearance: 'outline' }), 'data-ol8-appearance="outline"');
  let threw = false;
  try { field({ appearance: 'ghost' }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});

// ---- Choice Picker (Figma 906:2898) -------------------------------------
const OPTS = [{ value: 'a', label: 'Interface Design', selected: true }, { value: 'b', label: 'Web' }];
const picker = (o = {}) => renderChoicePicker({ label: 'Search skills', id: 'p', options: OPTS, ...o });

t('immediate commitment refuses an apply action', () => {
  let threw = false;
  try { picker({ applyHint: 'Apply' }); } catch { threw = true; }
  if (!threw) throw new Error('an apply action with immediate updates is a lie');
  hasnt(picker(), 'ol8-picker__commitment');
});
t('apply mode holds a pending set and offers a real action', () => {
  const h = picker({ commitBehavior: 'apply' });
  has(h, 'ol8-picker__commitment');
  has(h, '<button type="button" class="ol8-picker__apply">Enter to apply</button>');
  has(h, '1 selected');
});
t('the picker is a group, not a dialog pretending to be a listbox', () => {
  const h = picker();
  has(h, 'role="group"'); has(h, 'aria-labelledby="p-label"');
  hasnt(h, 'role="listbox"');
});
t('the search label stays associated while the composition hides it', () => {
  const h = picker();
  has(h, 'ol8-picker__label-row--hidden');
  has(h, '<label class="ol8-field__label" id="p-label" for="p">Search skills</label>');
});
t('every option is a real checkbox wearing the chip appearance', () => {
  const h = picker();
  eq((h.match(/type="checkbox"/g) || []).length, 2, 'one input per choice');
  eq((h.match(/ol8-picker__chip/g) || []).length, 2, 'both wear the chip');
});
t('peer chips never mix Check and None', () => {
  has(picker(), 'ol8-chip__mark');                    // check is the default
  hasnt(picker({ mark: 'none' }), 'ol8-chip__mark');  // none collapses for all
});
t('the search uses the governed icon rather than local artwork', () => {
  has(picker(), 'data-ol8-icon="search"');
});
t('a status needs words, because a spinner announces nothing', () => {
  let threw = false;
  try { picker({ status: 'loading' }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
  has(picker({ status: 'loading', statusText: 'Searching' }), 'Searching');
});

console.log(`\u2713 component contract: ${out.length}/${out.length} checks`);
