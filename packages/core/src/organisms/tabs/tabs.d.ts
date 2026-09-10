/**
 * Tabs (ORGANISM). Figma 693:171. Emits tablist, tab and tabpanel, keeps one
 * enabled tab stop, mirrors horizontal arrows in right to left, and supports
 * both orientations and both activation modes.
 */
export type Ol8TabsHierarchy = 'primary' | 'secondary' | 'tertiary';
export type Ol8TabsOrientation = 'horizontal' | 'vertical';
export type Ol8TabsActivation = 'automatic' | 'manual';
export type Ol8NavigationSize = 'compact' | 'standard' | 'comfortable' | 'large';

export declare const OL8_TABS_HIERARCHIES: readonly Ol8TabsHierarchy[];
export declare const OL8_TABS_ORIENTATIONS: readonly Ol8TabsOrientation[];
export declare const OL8_TABS_ACTIVATIONS: readonly Ol8TabsActivation[];

export interface Ol8TabItem {
  /** Required: exactly one panel is paired with it. */
  id: string;
  label?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  /** Required when the item shows an icon and no label. */
  ariaLabel?: string;
}

export interface Ol8TabsOptions {
  /** Required. A region nobody can name is a region nobody can reach. */
  label: string;
  items: Ol8TabItem[];
  selected?: string;
  hierarchy?: Ol8TabsHierarchy;
  size?: Ol8NavigationSize;
  material?: 'regular' | 'gem';
  orientation?: Ol8TabsOrientation;
  activation?: Ol8TabsActivation;
  /** Shared with renderTabPanel so each tab owns its panel. */
  idPrefix?: string;
  className?: string;
}

/** @throws without a name, without tabs, when every tab is disabled, or on duplicate ids. */
export declare function renderTabs(options: Ol8TabsOptions): string;

/** @throws without the idPrefix that pairs the panel with its tab. */
export declare function renderTabPanel(tabId: string, content: string, options: { idPrefix: string; hidden?: boolean }): string;

/** Wires arrow keys, Home, End, activation and panel visibility. Returns the number of lists wired. */
export declare function hydrateTabs(root?: ParentNode): number;
