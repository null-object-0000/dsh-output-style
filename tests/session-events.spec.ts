import { describe, expect, it, vi } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { sessionEvents } from '../src/session-events'

const EVENTS = Object.freeze([
  { type: 'turn/start', seq: 0, time: 0, data: { turn: 1 } } as SessionEvent,
])

describe('sessionEvents', () => {
  it('uses snapshotEvents on Harness v0.1.2-alpha.4 and newer', () => {
    const snapshotEvents = vi.fn(() => EVENTS)

    expect(sessionEvents({ snapshotEvents })).toBe(EVENTS)
    expect(snapshotEvents).toHaveBeenCalledOnce()
  })

  it('falls back to the legacy events property', () => {
    expect(sessionEvents({ events: EVENTS })).toBe(EVENTS)
  })

  it('prefers snapshotEvents when both APIs are present during a mixed upgrade', () => {
    const snapshot = Object.freeze([]) as readonly SessionEvent[]
    expect(sessionEvents({ events: EVENTS, snapshotEvents: () => snapshot })).toBe(snapshot)
  })
})
