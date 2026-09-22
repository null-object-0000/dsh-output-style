/** Access to a Session's immutable event-log snapshot. */

import type { SessionEvent } from '@deepseek-ai/dsh-session'

/** The Session event-log read face this plugin consumes. */
interface SnapshotSessionLog {
  snapshotEvents(): readonly SessionEvent[]
}

/**
 * Read a stable snapshot of a Session's committed event log.
 *
 * Harness v0.1.2-alpha.4 replaced the `Session.events` array property with this
 * on-demand call; the plugin's minimum Harness version is now past that
 * migration, so no feature-detection seam remains.
 *
 * @param session - the session whose log is read.
 * @returns the immutable snapshot at the session's current cursor.
 */
export function sessionEvents(session: SnapshotSessionLog): readonly SessionEvent[] {
  return session.snapshotEvents()
}
