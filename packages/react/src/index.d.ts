import type {
  ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactElement, ReactNode, RefAttributes,
} from 'react';
import type { Ol8IconName } from './foundations/icons.generated.js';

export type { Ol8IconName };
export { OL8_ICONS, OL8_ICON_VIEWBOX } from './foundations/icons.generated.js';

export type Ol8Variant = 'primary' | 'secondary' | 'quiet' | 'destructive';
export type Ol8Size = 'compact' | 'standard' | 'comfortable' | 'large';
export type Ol8Material = 'regular' | 'gem';
export type Ol8SelectionKind = 'checkbox' | 'radio' | 'switch';
export type Ol8SelectionSize = 'compact' | 'comfortable';
export type Ol8Selection =
  | 'unchecked' | 'checked' | 'mixed'
  | 'unselected' | 'selected'
  | 'off' | 'on';
export type Ol8LinkForm = 'inline' | 'standalone' | 'navigation';
export type Ol8LinkSize = 'small' | 'standard' | 'large';
export type Ol8LinkMotion = 'system' | 'none';
export declare const OL8_LINK_FORMS: readonly Ol8LinkForm[];
export declare const OL8_LINK_SIZES: readonly Ol8LinkSize[];
export declare const OL8_LINK_MOTIONS: readonly Ol8LinkMotion[];

export type Ol8TextFieldSize = 'compact' | 'standard' | 'comfortable' | 'large';
export type Ol8TextFieldAppearance = 'outline' | 'filled';
/** Pending is a validation process status, not a fifth message tone. */
export type Ol8MessageTone = 'critical' | 'caution' | 'positive' | 'informative';
export type Ol8ValidationStatus = 'idle' | 'pending' | 'resolved';
export type Ol8CharacterLimitBehavior = 'soft' | 'hard';
/** Form Message itself draws all five, because Figma 177:13 enumerates five. */
export type Ol8FormMessageTone = Ol8MessageTone | 'pending';
export declare const OL8_TEXT_FIELD_SIZES: readonly Ol8TextFieldSize[];
export declare const OL8_TEXT_FIELD_APPEARANCES: readonly Ol8TextFieldAppearance[];
export declare const OL8_TEXT_FIELD_MATERIALS: readonly Ol8Material[];
export declare const OL8_MESSAGE_TONES: readonly Ol8MessageTone[];
export declare const OL8_VALIDATION_STATUSES: readonly Ol8ValidationStatus[];
export declare const OL8_CHARACTER_LIMIT_BEHAVIORS: readonly Ol8CharacterLimitBehavior[];
export declare const OL8_FORM_MESSAGE_TONES: readonly Ol8FormMessageTone[];
export declare const OL8_FORM_MESSAGE_ICONS: Readonly<Record<Ol8FormMessageTone, string>>;

export type Ol8OptionSize = 'standard' | 'large';
export type Ol8Aggregate = 'none' | 'some' | 'all';

export declare const OL8_BUTTON_VARIANTS: readonly Ol8Variant[];
export declare const OL8_BUTTON_SIZES: readonly Ol8Size[];
export declare const OL8_MATERIALS: readonly Ol8Material[];
/** Gem is approved for Primary and Secondary only (Figma 100:3). */
export declare const GEM_VARIANTS: readonly ('primary' | 'secondary')[];
export declare const OL8_ICON_BUTTON_VARIANTS: readonly Ol8Variant[];
export declare const OL8_ICON_BUTTON_SIZES: readonly Ol8Size[];
export declare const OL8_ICON_BUTTON_SHAPES: readonly ('rounded' | 'circle')[];
export declare const OL8_SELECTION_KINDS: readonly Ol8SelectionKind[];
export declare const OL8_SELECTION_SIZES: readonly Ol8SelectionSize[];
export declare const OL8_SELECTION_STATES: Record<Ol8SelectionKind, readonly Ol8Selection[]>;
export declare const OL8_CHOICE_KINDS: readonly Ol8SelectionKind[];
export declare const OL8_CHOICE_SIZES: readonly Ol8Size[];
export declare const OL8_OPTION_SIZES: readonly Ol8OptionSize[];
export declare const OL8_AGGREGATE: readonly Ol8Aggregate[];

export declare function isOl8IconName(name: string): name is Ol8IconName;
export declare function iconSizeForButton(size: Ol8Size): 18 | 24;
export declare function artworkSizeForIconButton(size: Ol8Size): 18 | 24;
export declare function indicatorSizeFor(size: Ol8Size): Ol8SelectionSize;
export declare function selectionStateFor(
  kind: Ol8SelectionKind, state?: { checked?: boolean; mixed?: boolean }
): Ol8Selection;
export declare function computeAggregate(
  children: Iterable<{ checked?: boolean; disabled?: boolean }>
): Ol8Aggregate;

/** ATOM. Decorative unless given a label; the parent control carries meaning. */
export interface IconProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  name: Ol8IconName;
  size?: number;
  /** Promotes the icon to role="img". Omit for decorative. */
  label?: string;
}
export declare function Icon(props: IconProps): ReactElement;

/** ATOM. Presentational only; the native input in ChoiceItem owns state and focus. */
export interface SelectionIndicatorProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  kind: Ol8SelectionKind;
  selection?: Ol8Selection;
  size?: Ol8SelectionSize;
  disabled?: boolean;
  /** Switch thumb artwork only. */
  icon?: Ol8IconName;
}
export declare function SelectionIndicator(props: SelectionIndicatorProps): ReactElement;

/** MOLECULE. States are CSS, never classes. */
export interface ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'type'> {
  children?: ReactNode;
  variant?: Ol8Variant;
  size?: Ol8Size;
  /** Throws for quiet and destructive: Gem has no approved treatment there. */
  material?: Ol8Material;
  leadingIcon?: Ol8IconName;
  trailingIcon?: Ol8IconName;
  loading?: boolean;
  pressed?: boolean;
  fullWidth?: boolean;
  /** Renders an anchor instead of a button. */
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  /** Keeps the leading icon beside the spinner, Figma's literal reading. */
  keepLeadingIconWhileLoading?: boolean;
}
export declare const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLElement>>;

/** MOLECULE. An accessible name is mandatory and enforced at runtime. */
export interface IconButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'type'> {
  icon: Ol8IconName;
  accessibleName: string;
  variant?: Ol8Variant;
  size?: Ol8Size;
  shape?: 'rounded' | 'circle';
  material?: Ol8Material;
  loading?: boolean;
  pressed?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
export declare const IconButton: ForwardRefExoticComponent<IconButtonProps & RefAttributes<HTMLButtonElement>>;

/** MOLECULE. A real input owns state, focus and form participation. */
export interface ChoiceItemProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'type' | 'children'> {
  kind: Ol8SelectionKind;
  children?: ReactNode;
  size?: Ol8Size;
  /** Checkbox only. Sets the JavaScript-only indeterminate flag. */
  mixed?: boolean;
  invalid?: boolean;
  /** Associated with aria-describedby, outside the accessible name. */
  description?: ReactNode;
  material?: Ol8Material;
}
export declare const ChoiceItem: ForwardRefExoticComponent<ChoiceItemProps & RefAttributes<HTMLInputElement>>;

/** MOLECULE. States are CSS, never props. Icons are intentionally parked. */
export interface LinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  children?: ReactNode;
  href: string;
  form?: Ol8LinkForm;
  size?: Ol8LinkSize;
  /** Navigation only. `true` emits aria-current="page"; a string names the kind. */
  current?: boolean | string;
  motion?: Ol8LinkMotion;
}
export declare const Link: ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>;

/** MOLECULE. Tone maps to semantic message tone; Pending is the validating state. */
export interface FormMessageProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
  tone?: Ol8FormMessageTone;
  /** Figma's Show Icon. */
  icon?: boolean;
}
export declare const FormMessage: ForwardRefExoticComponent<FormMessageProps & RefAttributes<HTMLDivElement>>;

/** MOLECULE. Conditions are CSS and native state, never props. Gem changes material only. */
export interface TextFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'prefix'> {
  /** Required and visible. A placeholder is never the label. */
  label: string;
  /** Default Comfortable, the cross platform size. */
  size?: Ol8TextFieldSize;
  appearance?: Ol8TextFieldAppearance;
  material?: Ol8Material;
  /** False keeps the label as the accessible name without showing it, which needs a documented exception. */
  showLabel?: boolean;
  /** Correction is required. Never set without also exposing a Critical message. */
  invalid?: boolean;
  leadingIcon?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  trailingAction?: { icon: string; label: string; onClick?: () => void; pressed?: boolean };
  instruction?: ReactNode;
  message?: ReactNode;
  messageTone?: Ol8MessageTone;
  messageIcon?: boolean;
  /** Pending shows the loader; it never freezes typing. */
  validationStatus?: Ol8ValidationStatus;
  /** Counted in graphemes, so an emoji counts as one. */
  characterLimit?: number;
  /** Soft lets a person overshoot and then correct. Hard is for real technical limits. */
  characterLimitBehavior?: Ol8CharacterLimitBehavior;
}
export declare const TextField: ForwardRefExoticComponent<TextFieldProps & RefAttributes<HTMLInputElement>>;

/** Counts what a reader would call characters. */
export declare function countGraphemes(value: unknown): number;

/** Keeps the first `limit` graphemes, so a cluster is never cut in half. */
export declare function clipToGraphemes(value: unknown, limit: number): string;

/** MOLECULE. Never focusable; a listbox moves a virtual cursor instead. */
export interface SelectionOptionProps extends Omit<ComponentPropsWithoutRef<'li'>, 'children'> {
  children?: ReactNode;
  value?: string;
  size?: Ol8OptionSize;
  selected?: boolean;
  active?: boolean;
  disabled?: boolean;
  description?: ReactNode;
  leadingIcon?: Ol8IconName;
  focusRing?: boolean;
}
export declare function SelectionOption(props: SelectionOptionProps): ReactElement;

export interface Ol8GroupOption {
  label: ReactNode;
  value: string;
  description?: ReactNode;
  disabled?: boolean;
  /** CheckboxGroup only; radios take a single group value. */
  checked?: boolean;
}
interface Ol8GroupShell {
  legend: ReactNode;
  instruction?: ReactNode;
  message?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  size?: Ol8Size;
  material?: Ol8Material;
  id?: string;
  className?: string;
}
/** ORGANISM. Native radios already give roving focus and single selection. */
export interface RadioGroupProps extends Ol8GroupShell {
  name: string;
  options: Ol8GroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  required?: boolean;
}
export declare function RadioGroup(props: RadioGroupProps): ReactElement;

/** ORGANISM. Aggregate is computed; Mixed is never a third preference. */
export interface CheckboxGroupProps extends Ol8GroupShell {
  parentLabel: ReactNode;
  options: Ol8GroupOption[];
  name?: string;
  onChange?: (state: Record<string, boolean>) => void;
}
export declare function CheckboxGroup(props: CheckboxGroupProps): ReactElement;
