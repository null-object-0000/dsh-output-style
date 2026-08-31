/**
 * Pure types of the output-style domain: the projection key, its wire value,
 * and the host fold-state merge. The wire value is plain JSON so the
 * projection cache can persist it.
 *
 * @module dsh-output-style/types
 */

import { z as zod } from 'zod'
import type { OutputStyleId } from './styles.ts'
import type { StyleFoldState } from './style-command.ts'

/** One option a client renders in the style picker. */
export interface StyleOption {
  /** Switch token accepted by `/style`. */
  value: OutputStyleId
  /** Human-readable display name. */
  name: string
  /** One user-facing sentence on what the style does. */
  description: string
}

/** Whole wire value of the `outputStyle` session projection. */
export interface OutputStyleView {
  /** Every switchable style, in display order. */
  options: StyleOption[]
  /** The style in force, including the default when none was selected. */
  current: OutputStyleId
}

/** Validates the `outputStyle` projection's wire payload before it leaves the host. */
export const outputStyleViewSchema = zod.object({
  options: zod.array(zod.object({
    value: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf']),
    name: zod.string().min(1),
    description: zod.string().min(1),
  })),
  current: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf']),
})

/** Validates the `outputStyle` projection's persisted fold state. */
export const styleFoldStateSchema = zod.object({
  current: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf']),
  pending: zod.object({
    commandId: zod.string().min(1),
    target: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf']),
  }).nullable(),
})

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Output style folded from the `/style` command lifecycle. */
    outputStyle: OutputStyleView
  }
  interface SessionProjectionStateMap {
    /** Host fold state for {@link SessionProjectionMap.outputStyle}. */
    outputStyle: StyleFoldState
  }
}
