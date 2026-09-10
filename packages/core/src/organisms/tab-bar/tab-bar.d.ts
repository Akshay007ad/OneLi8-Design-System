/**
 * Tab Bar (ORGANISM). Figma 701:460. Native destination links, one current
 * destination, and no disabled pseudo destinations.
 */
import type { Ol8NavigationSize } from '../tabs/tabs.js';

export type Ol8TabBarPresentation = 'bottom' | 'inline' | 'sidebar' | 'spatial-rail';

export declare const OL8_TAB_BAR_PRESENTATIONS: readonly Ol8TabBarPresentation[];

export interface Ol8Destination {
  /** Required. A tab bar navigates, so it uses real links. */
  href: string;
  label?: string;
  icon?: string;
  badge?: string | number;
  /** Required when the destination shows an icon and no label. */
  ariaLabel?: string;
}

export interface Ol8TabBarOptions {
  /** Required navigation name, so a person can tell one landmark from another. */
  label: string;
  items: Ol8Destination[];
  /** The href of the destination a person is on. */
  current?: string;
  presentation?: Ol8TabBarPresentation;
  size?: Ol8NavigationSize;
  material?: 'regular' | 'gem';
  className?: string;
}

/** @throws without a name, without destinations, on a missing or duplicate href, on a disabled destination, or when current names nothing listed. */
export declare function renderTabBar(options: Ol8TabBarOptions): string;

/** Hands ordinary left clicks to a router while the link stays a real link. Returns the number of bars wired. */
export declare function hydrateTabBars(root?: ParentNode, onNavigate?: (href: string, event: MouseEvent) => void): number;
