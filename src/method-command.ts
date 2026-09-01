/** Durable command lifecycle fold for the independent conversation-method axis. */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-commands'
import {
  isConversationMethodId,
  type ConversationMethodId,
} from './methods.ts'

export const METHOD_COMMAND = 'method'

export const METHOD_COMMAND_ALIASES = Object.freeze({
  interview: 'interview',
  feynman: 'feynman',
  'rubber-duck': 'rubber-duck',
} satisfies Record<string, ConversationMethodId>)

/** Commands on the other guidance axis. A successful one disables the method. */
const STYLE_COMMAND_NAMES = new Set(['style', 'eli5', 'adhd', 'bluf', 'layers'])

export type MethodInput =
  | { kind: 'none' }
  | { kind: 'unknown'; name: string }
  | { kind: 'switch'; id: ConversationMethodId }

export function parseMethodInput(rawInput: string): MethodInput {
  const arg = rawInput.trim()
  if (arg === '') return { kind: 'none' }
  if (arg === 'off' || arg === 'default' || arg === 'normal') return { kind: 'switch', id: 'off' }
  if (isConversationMethodId(arg)) return { kind: 'switch', id: arg }
  return { kind: 'unknown', name: arg }
}

export interface MethodFoldState {
  current: ConversationMethodId
  pending: { commandId: string; target: ConversationMethodId } | null
}

export const EMPTY_METHOD_STATE: MethodFoldState = { current: 'off', pending: null }

export function applyMethodEvent(state: MethodFoldState, event: SessionEvent): MethodFoldState {
  if (event.type === 'command/run') {
    let target: ConversationMethodId | undefined
    if (event.data.name === METHOD_COMMAND) {
      const input = parseMethodInput(event.data.args ?? '')
      if (input.kind === 'switch') target = input.id
    } else if ((event.data.args ?? '').trim() === '') {
      target = METHOD_COMMAND_ALIASES[event.data.name as keyof typeof METHOD_COMMAND_ALIASES]
    }
    // A style selection replaces the active conversation method. Keep this in
    // the durable fold so slash commands and the single selector cannot drift.
    if (target === undefined && STYLE_COMMAND_NAMES.has(event.data.name)) {
      const args = (event.data.args ?? '').trim()
      const isValidStyleSwitch = event.data.name === 'style'
        ? ['off', 'default', 'adhd', 'adhd-friendly', 'eli5', 'bluf', 'layers'].includes(args)
        : args === ''
      if (isValidStyleSwitch) target = 'off'
    }
    if (target === undefined) return state
    const commandId = String(event.data.commandId)
    if (state.pending?.commandId === commandId) return state
    return { ...state, pending: { commandId, target } }
  }
  if (event.type !== 'command/done' || state.pending === null) return state
  if (String(event.data.commandId) !== state.pending.commandId) return state
  if (event.data.kind !== 'success') return { current: state.current, pending: null }
  return { current: state.pending.target, pending: null }
}

export function foldMethodState(events: readonly SessionEvent[]): MethodFoldState {
  let state = EMPTY_METHOD_STATE
  for (const event of events) state = applyMethodEvent(state, event)
  return state
}
