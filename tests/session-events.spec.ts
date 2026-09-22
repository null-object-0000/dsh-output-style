import { describe, expect, it, vi } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { sessionEvents } from '../src/session-events'

const EVENTS = Object.freeze([
  { type: 'turn/start', seq: 0, time: 0, data: { turn: 1 } } as SessionEvent,
])

describe('sessionEvents', () => {
  it('reads the immutable log snapshot through snapshotEvents', () => {
    const snapshotEvents = vi.fn(() => EVENTS)

    expect(sessionEvents({ snapshotEvents })).toBe(EVENTS)
    expect(snapshotEvents).toHaveBeenCalledOnce()
  })

  it('returns the snapshot reference unchanged', () => {
    const snapshot = Object.freeze([]) as readonly SessionEvent[]
    expect(sessionEvents({ snapshotEvents: () => snapshot })).toBe(snapshot)
  })
})
