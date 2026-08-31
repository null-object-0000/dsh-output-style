/**
 * Client-side service contracts — the exact API surface this plugin consumes
 * from the harness web half. TYPE-ONLY: the runtime services come from the
 * user's harness. The framework standard kit (`sessionId`, `useSession`,
 * `useProjection`) is delivered to slot components as props.
 *
 * @module dsh-output-style/client/services
 */

/** Locale registry and bound translator. */
export interface LocaleService {
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
  bind(ns: string): (key: string, params?: Record<string, string | number>) => string
}

/** One slot registration descriptor (the fields this plugin uses). */
export interface SlotRegistration {
  name: string
  /** List slots dispatch on id + order. */
  id?: string
  order?: number
  /** Optional dictionary namespace; the framework then synthesizes the `t` seat. */
  locale?: string
  /** Optional business face factory; merged onto the component props. */
  inject?: (sessionId?: string) => unknown
}

/** Slot registry service. */
export interface SlotsService {
  inject(name: string, callback: () => unknown): unknown
  register(
    registration: SlotRegistration,
    component: (props: Record<string, unknown>) => unknown,
  ): unknown
}

/** Result envelope of a remote command execution. */
export interface RemoteCommandResult {
  ok: boolean
  value?: { result?: { kind: 'success' | 'error'; text?: string } }
  error?: { message: string; code?: string }
}

/** The `remote.commands` service face used to submit `/style`. */
export interface RemoteCommands {
  execute(sessionId: string, line: string, images: readonly unknown[]): Promise<RemoteCommandResult>
}

/** The `remote` namespace face on the client context. */
export interface RemoteService {
  commands: RemoteCommands
}

/** The client context shape this plugin consumes. */
export interface ClientCtx {
  slots: SlotsService
  locale: LocaleService
  remote: RemoteService
  effect(callback: () => (() => void) | void, label?: string): void
  inject(services: readonly string[], callback: (ctx: unknown) => void): unknown
}
