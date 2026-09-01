import { describe, expect, it } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import {
  applyMethodEvent,
  EMPTY_METHOD_STATE,
  foldMethodState,
  parseMethodInput,
} from '../src/method-command'
import { foldStyleState } from '../src/style-command'
import { CONVERSATION_METHODS } from '../src/methods'

function commandRun(commandId: string, args: string, name = 'method'): SessionEvent {
  return {
    type: 'command/run',
    seq: 0,
    time: 0,
    data: { commandId: commandId as never, name, args, source: { kind: 'user' } },
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

describe('conversation methods', () => {
  it('parses listing, switches, off aliases, and unknown values', () => {
    expect(parseMethodInput('')).toEqual({ kind: 'none' })
    expect(parseMethodInput('interview')).toEqual({ kind: 'switch', id: 'interview' })
    expect(parseMethodInput('normal')).toEqual({ kind: 'switch', id: 'off' })
    expect(parseMethodInput('off')).toEqual({ kind: 'switch', id: 'off' })
    expect(parseMethodInput('mystery')).toEqual({ kind: 'unknown', name: 'mystery' })
  })

  it('commits a method only after command success', () => {
    const parked = applyMethodEvent(EMPTY_METHOD_STATE, commandRun('m1', ' feynman'))
    expect(parked).toEqual({ current: 'off', pending: { commandId: 'm1', target: 'feynman' } })
    expect(applyMethodEvent(parked, commandDone('m1', 'success'))).toEqual({ current: 'feynman', pending: null })
  })

  it('supports shortcut commands and reconstructs the final method', () => {
    const events = [
      commandRun('m1', '', 'interview'),
      commandDone('m1', 'success'),
      commandRun('m2', '', 'rubber-duck'),
      commandDone('m2', 'success'),
    ]
    expect(foldMethodState(events)).toEqual({ current: 'rubber-duck', pending: null })
  })

  it('turns the method off after a successful style switch', () => {
    const active = { current: 'interview', pending: null } as const
    const parked = applyMethodEvent(active, commandRun('s1', '', 'eli5'))
    expect(parked).toEqual({ current: 'interview', pending: { commandId: 's1', target: 'off' } })
    expect(applyMethodEvent(parked, commandDone('s1', 'success'))).toEqual({ current: 'off', pending: null })
  })

  it('reconstructs feynman to default and feynman to eli5 as single selections', () => {
    const feynmanThenDefault = [
      commandRun('m1', '', 'feynman'),
      commandDone('m1', 'success'),
      commandRun('s1', 'default', 'style'),
      commandDone('s1', 'success'),
    ]
    expect(foldMethodState(feynmanThenDefault)).toEqual({ current: 'off', pending: null })
    expect(foldStyleState(feynmanThenDefault)).toEqual({ current: 'default', pending: null })

    const feynmanThenEli5 = [
      commandRun('m2', '', 'feynman'),
      commandDone('m2', 'success'),
      commandRun('s2', 'eli5', 'style'),
      commandDone('s2', 'success'),
    ]
    expect(foldMethodState(feynmanThenEli5)).toEqual({ current: 'off', pending: null })
    expect(foldStyleState(feynmanThenEli5)).toEqual({ current: 'eli5', pending: null })
  })

  it('keeps method prompts behavioral and free of command coupling', () => {
    for (const method of Object.values(CONVERSATION_METHODS)) {
      expect(method.prompt).not.toContain('/style')
      expect(method.prompt).not.toContain('plan mode')
    }
  })
})
