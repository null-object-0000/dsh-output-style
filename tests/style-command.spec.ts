import { describe, expect, it } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { applyStyleEvent, EMPTY_STYLE_STATE, foldStyleState, parseStyleInput } from '../src/style-command'

/** Build a bare command/run event shaped like the log records it. */
function commandRun(commandId: string, args: string): SessionEvent {
  return {
    type: 'command/run',
    seq: 0,
    time: 0,
    data: { commandId: commandId as never, name: 'style', args, source: { kind: 'user' } },
  } as unknown as SessionEvent
}

function commandDone(commandId: string, kind: 'success' | 'error'): SessionEvent {
  return {
    type: 'command/done',
    seq: 0,
    time: 0,
    data: { commandId: commandId as never, kind },
  } as unknown as SessionEvent
}

describe('parseStyleInput', () => {
  it('treats empty input as the listing form', () => {
    expect(parseStyleInput('')).toEqual({ kind: 'none' })
    expect(parseStyleInput('   ')).toEqual({ kind: 'none' })
  })

  it('treats off and default as the default style', () => {
    expect(parseStyleInput('off')).toEqual({ kind: 'switch', id: 'default' })
    expect(parseStyleInput('default')).toEqual({ kind: 'switch', id: 'default' })
  })

  it('accepts every built-in id and rejects unknown names', () => {
    expect(parseStyleInput('bluf')).toEqual({ kind: 'switch', id: 'bluf' })
    expect(parseStyleInput('adhd-friendly')).toEqual({ kind: 'switch', id: 'adhd-friendly' })
    expect(parseStyleInput('eli5')).toEqual({ kind: 'switch', id: 'eli5' })
    expect(parseStyleInput('bogus')).toEqual({ kind: 'unknown', name: 'bogus' })
  })
})

describe('applyStyleEvent / foldStyleState', () => {
  it('starts at the default style', () => {
    expect(EMPTY_STYLE_STATE).toEqual({ current: 'default', pending: null })
  })

  it('commits a switch only after its paired command/done succeeds', () => {
    const parked = applyStyleEvent(EMPTY_STYLE_STATE, commandRun('c1', ' bluf'))
    expect(parked).toEqual({ current: 'default', pending: { commandId: 'c1', target: 'bluf' } })
    const committed = applyStyleEvent(parked, commandDone('c1', 'success'))
    expect(committed).toEqual({ current: 'bluf', pending: null })
  })

  it('drops a failed switch without touching the current style', () => {
    const parked = applyStyleEvent({ current: 'adhd-friendly', pending: null }, commandRun('c2', ' eli5'))
    const dropped = applyStyleEvent(parked, commandDone('c2', 'error'))
    expect(dropped).toEqual({ current: 'adhd-friendly', pending: null })
  })

  it('ignores unrelated events and returns the same reference', () => {
    const state = { current: 'default', pending: null }
    expect(applyStyleEvent(state, { type: 'todo/write', seq: 0, time: 0, data: { todos: [] } } as SessionEvent)).toBe(state)
  })

  it('folds a full log prefix', () => {
    const events = [
      commandRun('c1', ' bluf'),
      commandDone('c1', 'success'),
      commandRun('c2', ' bogus'),
      commandDone('c2', 'error'),
    ]
    expect(foldStyleState(events)).toEqual({ current: 'bluf', pending: null })
  })
})
