/**
 * Segmented Control (ORGANISM). Figma 698:4792. Behaviour is declared, never
 * inferred, and presentation never changes it.
 */
import type { Ol8NavigationSize } from '../tabs/tabs.js';

export type Ol8SegmentBehavior = 'single' | 'multi' | 'momentary';
export type Ol8SegmentPresentation =
  | 'inset-fill' | 'line-indicator' | 'outlined-selection'
  | 'soft-pill' | 'icon-only' | 'stacked-label';

export declare const OL8_SEGMENT_BEHAVIORS: readonly Ol8SegmentBehavior[];
export declare const OL8_SEGMENT_PRESENTATIONS: readonly Ol8SegmentPresentation[];

export interface Ol8SegmentItem {
  id: string;
  label?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  /** Required when the item shows an icon and no label. */
  ariaLabel?: string;
}

export interface Ol8SegmentedControlOptions {
  /** Required accessible name. */
  label: string;
  /** Exactly one: single is a radio group, multi is toggle buttons, momentary stores nothing. */
  behavior: Ol8SegmentBehavior;
  items: Ol8SegmentItem[];
  /** One value for single, an array for multi, nothing for momentary. */
  selected?: string | string[];
  presentation?: Ol8SegmentPresentation;
  size?: Ol8NavigationSize;
  material?: 'regular' | 'gem';
  className?: string;
}

/** @throws without a name or behaviour, or when the selection shape contradicts the behaviour. */
export declare function renderSegmentedControl(options: Ol8SegmentedControlOptions): string;

/** Wires selection and, for single selection, roving focus. Returns the number of groups wired. */
export declare function hydrateSegmentedControls(root?: ParentNode): number;
