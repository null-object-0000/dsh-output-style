/**
 * dsh-output-style — Host half (installed package entry).
 *
 * A plain Cordis plugin module (ESM) loaded by the harness as the
 * `dsh-output-style` loader row. It registers:
 *
 * - model-visible sections for output style and conversation method;
 * - durable session projections folded from command lifecycle events;
 * - canonical commands plus user-facing shortcut commands.
 *
 * Both internal axes read their matching pure fold of `command/run` +
 * `command/done`. A successful switch on either axis clears the other, so the
 * single client selector and model-visible text agree after resume and fork.
 *
 * @module dsh-output-style
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type { AssembleContext } from '@deepseek-ai/dsh-system-prompt'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { OUTPUT_STYLES, OUTPUT_STYLE_IDS } from './styles.ts'
import {
  applyStyleEvent,
  EMPTY_STYLE_STATE,
  foldStyleState,
  parseStyleInput,
  STYLE_COMMAND,
  type StyleFoldState,
} from './style-command.ts'
import { CONVERSATION_METHODS, CONVERSATION_METHOD_IDS } from './methods.ts'
import {
  applyMethodEvent,
  EMPTY_METHOD_STATE,
  foldMethodState,
  METHOD_COMMAND,
  parseMethodInput,
  type MethodFoldState,
} from './method-command.ts'
import {
  conversationMethodViewSchema,
  methodFoldStateSchema,
  outputStyleViewSchema,
  styleFoldStateSchema,
  type ConversationMethodView,
  type OutputStyleView,
} from './types.ts'
import { sessionEvents } from './session-events.ts'

/** Cordis plugin name; keep this stable after publishing. */
export const name = 'dsh-output-style'

/**
 * The prompt-section registry is required (the plugin is pending until it
 * exists). The projection and command registries are optional: a composition
 * without one of them simply loses that surface.
 */
export const inject = ['systemPrompt']

export {
  parseStyleInput,
  applyStyleEvent,
  foldStyleState,
  STYLE_COMMAND,
  STYLE_COMMAND_ALIASES,
} from './style-command.ts'
export type { StyleFoldState, StyleInput } from './style-command.ts'
export { OUTPUT_STYLES, OUTPUT_STYLE_IDS, OFF, isOutputStyleId } from './styles.ts'
export type { OutputStyle, OutputStyleId } from './styles.ts'
export {
  parseMethodInput,
  applyMethodEvent,
  foldMethodState,
  METHOD_COMMAND,
  METHOD_COMMAND_ALIASES,
} from './method-command.ts'
export type { MethodFoldState, MethodInput } from './method-command.ts'
export { CONVERSATION_METHODS, CONVERSATION_METHOD_IDS, isConversationMethodId } from './methods.ts'
export type { ConversationMethod, ConversationMethodId } from './methods.ts'
export type * from './types.ts'

/** Config: deployment-owned section order. Unknown keys fail the load. */
export interface Config {
  /** Prompt-section order (default 90: after the persona, before tool guidance at 100–199). */
  sectionOrder?: number
}

/** The default prompt-section order. */
export const DEFAULT_SECTION_ORDER = 90

/** The prompt-section name; a fixed registry key a scoped composition could shadow. */
export const STYLE_SECTION_NAME = 'output-style:guidance'

/** Method guidance follows the presentation-style section. */
export const METHOD_SECTION_NAME = 'conversation-method:guidance'

/** The projection key this package owns. */
export const STYLE_PROJECTION_KEY = 'outputStyle'

/** The conversation-method projection key this package owns. */
export const METHOD_PROJECTION_KEY = 'conversationMethod'

/**
 * Validate the plugin config. Missing or unknown fields, or a non-finite
 * order, fail the load rather than being ignored.
 *
 * @param config - raw plugin config.
 * @returns a detached validated config.
 */
export function resolveConfig(config: Config): { sectionOrder: number } {
  const raw = (config ?? {}) as Partial<Config>
  const unknown = Object.keys(raw).filter(key => key !== 'sectionOrder')
  if (unknown.length > 0) {
    throw new Error(`dsh-output-style: unknown config key(s) ${unknown.join(', ')} — config is { sectionOrder }`)
  }
  const order = raw.sectionOrder ?? DEFAULT_SECTION_ORDER
  if (typeof order !== 'number' || !Number.isFinite(order)) {
    throw new Error(`dsh-output-style: sectionOrder must be a finite number, received ${String(order)}`)
  }
  return { sectionOrder: order }
}

/** Build the `outputStyle` projection's wire value for one folded state. */
function viewStyleSelection(state: StyleFoldState): OutputStyleView {
  return {
    options: OUTPUT_STYLE_IDS.map(id => ({
      value: id,
      name: OUTPUT_STYLES[id].name,
      description: OUTPUT_STYLES[id].description,
    })),
    current: state.current,
  }
}

/** The `outputStyle` projection unit. */
const outputStyleProjection = {
  key: STYLE_PROJECTION_KEY,
  // v2 replays sessions created before style/method mutual exclusion.
  stateVersion: 2,
  stateSchema: styleFoldStateSchema,
  init: () => EMPTY_STYLE_STATE,
  apply: applyStyleEvent,
  wire: {
    viewSchema: outputStyleViewSchema,
    view: viewStyleSelection,
  },
} satisfies ProjectionDefinition<'outputStyle', StyleFoldState>

function viewMethodSelection(state: MethodFoldState): ConversationMethodView {
  return {
    options: CONVERSATION_METHOD_IDS.map(id => ({
      value: id,
      name: CONVERSATION_METHODS[id].name,
      description: CONVERSATION_METHODS[id].description,
    })),
    current: state.current,
  }
}

const conversationMethodProjection = {
  key: METHOD_PROJECTION_KEY,
  // Keep both axes on the same cache generation after the mutual-exclusion fix.
  stateVersion: 2,
  stateSchema: methodFoldStateSchema,
  init: () => EMPTY_METHOD_STATE,
  apply: applyMethodEvent,
  wire: {
    viewSchema: conversationMethodViewSchema,
    view: viewMethodSelection,
  },
} satisfies ProjectionDefinition<'conversationMethod', MethodFoldState>

/**
 * Apply the plugin to its Cordis context.
 *
 * @param ctx - scoped plugin context; registrations must be owned by its effects.
 * @param config - configuration resolved by Cordis from the exported schema.
 */
export function apply(ctx: Context, config: Config = {}): void {
  const { sectionOrder } = resolveConfig(config)

  // Model-visible guidance: the active style's body, or '' for the default.
  // Folding the session log directly keeps this section independent of the
  // projection registry (which may be absent in headless compositions).
  ctx.systemPrompt.section({
    name: STYLE_SECTION_NAME,
    order: sectionOrder,
    text: (context: AssembleContext): string => {
      const agent = context.agent
      if (agent === undefined) return ''
      const state = foldStyleState(sessionEvents(agent.session))
      return state.current === 'default' ? '' : OUTPUT_STYLES[state.current].prompt
    },
  })

  ctx.systemPrompt.section({
    name: METHOD_SECTION_NAME,
    order: sectionOrder + 1,
    text: (context: AssembleContext): string => {
      const agent = context.agent
      if (agent === undefined) return ''
      const state = foldMethodState(sessionEvents(agent.session))
      return state.current === 'off' ? '' : CONVERSATION_METHODS[state.current].prompt
    },
  })

  // Client-visible projection over the same fold.
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register(outputStyleProjection)
    projectionCtx.sessionProjections.register(conversationMethodProjection)
  })

  // The /style command: the one write path a web client uses. The registry
  // logs `command/run` with the verbatim input, so every switch is
  // reconstructable from the session log. The handler only validates and
  // reports — the projection commits from the logged lifecycle.
  ctx.inject(['commands'], (commandCtx) => {
    commandCtx.commands.register({
      name: STYLE_COMMAND,
      description: 'Switch the model output style for this session',
      input: { hint: '<default|adhd|eli5|bluf|layers|off>' },
      handler: ({ agent, rawInput }) => {
        const input = parseStyleInput(rawInput)
        if (input.kind === 'none') return { kind: 'success', text: listLine(sessionEvents(agent.session)) }
        if (input.kind === 'unknown') return { kind: 'error', text: unknownLine(input.name) }
        return { kind: 'success', text: `output style: ${input.id}` }
      },
    })

    commandCtx.commands.register({
      name: METHOD_COMMAND,
      description: 'Switch the guided conversation method for this session',
      input: { hint: '<interview|feynman|rubber-duck|off>' },
      handler: ({ agent, rawInput }) => {
        const input = parseMethodInput(rawInput)
        if (input.kind === 'none') return { kind: 'success', text: listMethodLine(sessionEvents(agent.session)) }
        if (input.kind === 'unknown') return { kind: 'error', text: unknownMethodLine(input.name) }
        return { kind: 'success', text: `conversation method: ${input.id}` }
      },
    })

  })
}

/** The `/style` no-argument listing. */
function listLine(events: Parameters<typeof foldStyleState>[0]): string {
  const current = foldStyleState(events).current
  const lines = [`current output style: ${current}`]
  for (const id of OUTPUT_STYLE_IDS) {
    lines.push(`${OUTPUT_STYLES[id].name} — ${OUTPUT_STYLES[id].description}`)
  }
  return lines.join('\n')
}

/** The unknown-name error line. */
function unknownLine(name: string): string {
  const available = OUTPUT_STYLE_IDS.join(', ')
  return `unknown output style "${name}" (available: ${available})`
}

function listMethodLine(events: Parameters<typeof foldMethodState>[0]): string {
  const current = foldMethodState(events).current
  const lines = [`current conversation method: ${current}`]
  for (const id of CONVERSATION_METHOD_IDS) {
    lines.push(`${CONVERSATION_METHODS[id].name} — ${CONVERSATION_METHODS[id].description}`)
  }
  return lines.join('\n')
}

function unknownMethodLine(name: string): string {
  const available = CONVERSATION_METHOD_IDS.join(', ')
  return `unknown conversation method "${name}" (available: ${available})`
}
