/**
 * Selection Indicator (ATOM) — presentational only. It renders the mark a
 * checkbox, radio or switch shows; it never owns state, role or focus.
 */
export type Ol8SelectionKind = 'checkbox' | 'radio' | 'switch';
export type Ol8SelectionSize = 'compact' | 'comfortable';

export type Ol8CheckboxSelection = 'unchecked' | 'checked' | 'mixed';
export type Ol8RadioSelection = 'unselected' | 'selected';
export type Ol8SwitchSelection = 'off' | 'on';
export type Ol8Selection = Ol8CheckboxSelection | Ol8RadioSelection | Ol8SwitchSelection;

export declare const OL8_SELECTION_KINDS: readonly Ol8SelectionKind[];
export declare const OL8_SELECTION_SIZES: readonly Ol8SelectionSize[];

/** Figma's Selection axis, per kind. */
export declare const OL8_SELECTION_STATES: {
  readonly checkbox: readonly Ol8CheckboxSelection[];
  readonly radio: readonly Ol8RadioSelection[];
  readonly switch: readonly Ol8SwitchSelection[];
};

export interface Ol8SelectionIndicatorOptions {
  /** Defaults to the kind's first state (unchecked / unselected / off). */
  selection?: Ol8Selection;
  size?: Ol8SelectionSize;
  disabled?: boolean;
  /** Override the glyph. Defaults to the kind's canonical mark. */
  icon?: string;
  className?: string;
}

export declare function renderSelectionIndicator(
  kind: Ol8SelectionKind,
  options?: Ol8SelectionIndicatorOptions,
): string;
