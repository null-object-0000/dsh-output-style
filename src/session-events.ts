/** Compatibility access to a Session's immutable event-log snapshot. */

import type { SessionEvent } from '@deepseek-ai/dsh-session'

/** Session shape exposed by Harness versions through v0.1.2-alpha.3. */
interface LegacySessionLog {
  readonly events: readonly SessionEvent[]
}

/** Session shape exposed by Harness starting with v0.1.2-alpha.4. */
interface SnapshotSessionLog {
  snapshotEvents(): readonly SessionEvent[]
}

/**
 * Read a stable snapshot across the Session.events API migration.
 *
 * Keep this seam until the plugin's minimum Harness version is alpha.4 or
 * newer. Feature detection preserves the current rc.7+ peer range while
 * preferring the new on-demand API whenever it is available.
 */
export function sessionEvents(session: LegacySessionLog | SnapshotSessionLog): readonly SessionEvent[] {
  if ('snapshotEvents' in session) return session.snapshotEvents()
  return session.events
}
