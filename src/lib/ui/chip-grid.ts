/**
 * Pure layout check for a grid of `fill` chips (ChipRadioGroup columns).
 *
 * A fill chip never wraps its label (besluit 17), so a column is only
 * usable when the widest label plus the chip's own inset fits in one cell.
 * "Gemiddeld" (≈82px at 15px/500) does not fit four columns on a 390px
 * phone, "Ernstig" does — so the decision depends on the real labels and
 * the real container width, not on the viewport alone.
 */

/** px-2 on both sides + the 1px border on both sides of a fill chip. */
export const FILL_CHIP_INSET = 18
/** A little air beyond px-2, so the label never sits exactly on the padding edge. */
export const FILL_CHIP_AIR = 2

export interface ChipGridFit {
  /** Content width of the grid container (clientWidth). */
  containerWidth: number
  /** column-gap of the grid in px. */
  gap: number
  columns: number
  /** Width of the widest label in px. */
  widestLabel: number
}

/** Width of one cell when the container is split into `columns`. */
export function chipGridCellWidth({ containerWidth, gap, columns }: Omit<ChipGridFit, "widestLabel">) {
  if (columns <= 0) return 0
  return (containerWidth - gap * (columns - 1)) / columns
}

/** True when every label fits in a cell of a `columns`-wide grid. */
export function chipLabelsFit(fit: ChipGridFit): boolean {
  if (fit.containerWidth <= 0) return false
  return fit.widestLabel + FILL_CHIP_INSET + FILL_CHIP_AIR <= chipGridCellWidth(fit)
}
