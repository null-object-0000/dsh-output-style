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
import type { ConversationMethodId } from './methods.ts'
import type { MethodFoldState } from './method-command.ts'

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
    value: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf', 'layers']),
    name: zod.string().min(1),
    description: zod.string().min(1),
  })),
  current: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf', 'layers']),
})

/** Validates the `outputStyle` projection's persisted fold state. */
export const styleFoldStateSchema = zod.object({
  current: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf', 'layers']),
  pending: zod.object({
    commandId: zod.string().min(1),
    target: zod.enum(['default', 'adhd-friendly', 'eli5', 'bluf', 'layers']),
  }).nullable(),
})

export interface ConversationMethodOption {
  value: ConversationMethodId
  name: string
  description: string
}

export interface ConversationMethodView {
  options: ConversationMethodOption[]
  current: ConversationMethodId
}

export const conversationMethodViewSchema = zod.object({
  options: zod.array(zod.object({
    value: zod.enum(['off', 'interview', 'feynman', 'rubber-duck']),
    name: zod.string().min(1),
    description: zod.string().min(1),
  })),
  current: zod.enum(['off', 'interview', 'feynman', 'rubber-duck']),
})

export const methodFoldStateSchema = zod.object({
  current: zod.enum(['off', 'interview', 'feynman', 'rubber-duck']),
  pending: zod.object({
    commandId: zod.string().min(1),
    target: zod.enum(['off', 'interview', 'feynman', 'rubber-duck']),
  }).nullable(),
})

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Output style folded from the `/style` command lifecycle. */
    outputStyle: OutputStyleView
    /** Conversation method folded independently from output style. */
    conversationMethod: ConversationMethodView
  }
  interface SessionProjectionStateMap {
    /** Host fold state for {@link SessionProjectionMap.outputStyle}. */
    outputStyle: StyleFoldState
    /** Host fold state for {@link SessionProjectionMap.conversationMethod}. */
    conversationMethod: MethodFoldState
  }
}
