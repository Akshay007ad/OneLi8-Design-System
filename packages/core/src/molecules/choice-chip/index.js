/**
 * The public surface. The terminal paths, the shape composer and the escape
 * helpers stay module private on purpose: Figma names the terminals "Private
 * Geometry" and the contract is explicit that they "are private construction
 * inside the canonical Choice Chip molecule ... not published cap atoms, layer
 * variants, or independently swappable components". Token reaches them by
 * importing the module directly, exactly as its Figma counterpart instantiates
 * the Geometry Owner.
 */
export { OL8_CHIP_SIZES, renderChoiceChip, hydrateChoiceChips, syncChip } from './choice-chip.js';
