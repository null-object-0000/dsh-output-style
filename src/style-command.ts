/**
 * Strict parsing of the `/style` command input and the pure projection fold
 * over its logged lifecycle events. The handler and the projection share
 * {@link parseStyleInput}, so the displayed selection can never diverge from
 * what the command did.
 *
 * State is folded from `command/run` + `command/done` — both known session
 * event types — so the selection is reconstructable from the session log on
 * resume and fork. No custom event type is written (third-party event types
 * cannot be marked `ignorable` through `Session.append`, so the persistence
 * read path would refuse them).
 *
 * @module dsh-output-style/style-command
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-commands'
import { isOutputStyleId, OFF, type OutputStyleId } from './styles.ts'

/** Command name registered on `ctx.commands`; also the log's `command/run` name. */
export const STYLE_COMMAND = 'style'

/** One strict parse of a `/style` input line. */
export type StyleInput =
  | { kind: 'none' }
  | { kind: 'unknown'; name: string }
  | { kind: 'switch'; id: OutputStyleId }

/**
 * Parse the text after `/style`. Empty is the listing form. `off` and
 * `default` both select the default style. A known id is a switch; anything
 * else is unknown and rejected by the handler (the fold ignores it).
 *
 * @param rawInput - verbatim text after the command name.
 * @returns the decision.
 */
export function parseStyleInput(rawInput: string): StyleInput {
  const arg = rawInput.trim()
  if (arg === '') return { kind: 'none' }
  if (arg === OFF || arg === 'default') return { kind: 'switch', id: 'default' }
  if (isOutputStyleId(arg)) return { kind: 'switch', id: arg }
  return { kind: 'unknown', name: arg }
}

/** Projection-fold state: the last settled selection plus the in-flight switch. */
export interface StyleFoldState {
  /** The last style that settled successfully. */
  current: OutputStyleId
  /** One `/style` run awaiting its paired `command/done`. */
  pending: { commandId: string; target: OutputStyleId } | null
}

/** State for the empty log. */
export const EMPTY_STYLE_STATE: StyleFoldState = { current: 'default', pending: null }

/**
 * One-event transition of the `outputStyle` projection unit. `command/run`
 * parks the switch target; its paired `command/done` commits it on success and
 * drops it otherwise. Every other event returns the same reference.
 *
 * @param state - the folded state before `event`.
 * @param event - one committed session event.
 * @returns the next state; the same reference when the event leaves it unchanged.
 */
export function applyStyleEvent(state: StyleFoldState, event: SessionEvent): StyleFoldState {
  if (event.type === 'command/run') {
    if (event.data.name !== STYLE_COMMAND || event.data.args === undefined) return state
    const input = parseStyleInput(event.data.args)
    if (input.kind !== 'switch') return state
    const commandId = String(event.data.commandId)
    if (state.pending?.commandId === commandId) return state
    return { ...state, pending: { commandId, target: input.id } }
  }
  if (event.type !== 'command/done' || state.pending === null) return state
  if (String(event.data.commandId) !== state.pending.commandId) return state
  if (event.data.kind !== 'success') return { current: state.current, pending: null }
  return { current: state.pending.target, pending: null }
}

/**
 * Fold the whole log (or any prefix) to the current style.
 * @param events - the session log or any prefix of it.
 * @returns the folded state.
 */
export function foldStyleState(events: readonly SessionEvent[]): StyleFoldState {
  let state = EMPTY_STYLE_STATE
  for (const event of events) state = applyStyleEvent(state, event)
  return state
}
