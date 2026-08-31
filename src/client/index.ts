/**
 * dsh-output-style — Client half (installed package bundle entry).
 *
 * Registers a compact output-style dropdown in the composer's
 * `conversation.input.left` tool row (beside the access-mode and plan chrome)
 * and the plugin's bilingual dictionaries. It needs no custom data plane: the
 * Host half pushes the finished selection through the harness
 * session-projection pipeline (`outputStyle` key), read here from the
 * framework standard kit (`useProjection`), and switching submits `/style`
 * over the remote command channel.
 *
 * This module is the body of the package's `./client` bundle: tsdown bundles
 * it (external `react` — the browser module table supplies it via the
 * injected `require`) into the web boot handoff
 * (`window.__ModuleLoader__.load({id, factory})`).
 *
 * @module dsh-output-style/client
 */

import type { ClientCtx } from './services'
import { StyleSelect } from './StyleSelect'
import { DICT_EN, DICT_ZH } from './locales'

const NS = 'dsh-output-style'

/** Required services: the slot registry, the command remote, and the locale registry. */
const inject = ['slots', 'remote', 'remote.commands', 'locale']

/**
 * Client plugin body: register the locale dictionaries and the selector slot.
 * @param ctx - client root context.
 */
function apply(ctx: ClientCtx): void {
  ctx.effect(() => {
    return ctx.locale.register(NS, { zh: DICT_ZH, en: DICT_EN })
  }, 'dsh-output-style: dictionaries')

  ctx.slots.inject('conversation.input.left', () => {
    return ctx.slots.register({
      name: 'conversation.input.left',
      id: 'output-style',
      order: 30,
      locale: NS,
      inject: (sessionId = '') => ({
        chooseStyle: async (value: string): Promise<string | null> => {
          const result = await ctx.remote.commands.execute(sessionId, `/style ${value}`, [])
          if (!result.ok) {
            const code = result.error?.code ?? ''
            const message = result.error?.message ?? 'unknown error'
            return `${message}${code === '' ? '' : ` (${code})`}`
          }
          if (result.value === undefined) return `unknown command: /style ${value}`
          return null
        },
      }),
    }, (props) => StyleSelect(props as Parameters<typeof StyleSelect>[0]))
  })
}

module.exports = {
  name: NS,
  inject,
  apply,
}
