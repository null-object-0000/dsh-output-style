import { I_HAVE_ADHD_PROMPT } from './i-have-adhd.ts'
import { ELI5_PROMPT } from './eli5.ts'

/**
 * Built-in output styles: the fixed MVP catalog. Each style is a system-prompt
 * body that changes how the model presents information — never what it knows
 * or which tools it has.
 *
 * @module dsh-output-style/styles
 */

/** A switchable output style. */
export interface OutputStyle {
  /** Style id, also the `/style` switch token. */
  id: OutputStyleId
  /** Human-readable display name (fallback for clients without a locale). */
  name: string
  /** One sentence on what the style does. */
  description: string
  /** The model-visible guidance body, or '' for the default (no injection). */
  prompt: string
}

/** The fixed MVP style ids. */
export type OutputStyleId = 'default' | 'adhd-friendly' | 'eli5' | 'bluf' | 'layers'

/** The fixed MVP style ids, in display order. */
export const OUTPUT_STYLE_IDS: readonly OutputStyleId[] = ['default', 'eli5', 'adhd-friendly', 'bluf', 'layers']

/** The reserved `/style` token that restores the default style. */
export const OFF = 'off'

/** The built-in style catalog, keyed by id. */
export const OUTPUT_STYLES: Readonly<Record<OutputStyleId, OutputStyle>> = Object.freeze({
  'default': {
    id: 'default',
    name: 'Answer normally',
    description: 'Answer directly, without a specific presentation style.',
    prompt: '',
  },
  'adhd-friendly': {
    id: 'adhd-friendly',
    name: 'Start doing',
    description: 'Turn the task into one clear next step I can do now.',
    prompt: I_HAVE_ADHD_PROMPT,
  },
  'eli5': {
    id: 'eli5',
    name: 'ELI5',
    description: 'Help me understand with plain words and analogies.',
    prompt: ELI5_PROMPT,
  },
  'bluf': {
    id: 'bluf',
    name: 'BLUF',
    description: 'Tell me the most important thing first.',
    prompt: [
      'Lead every response with the bottom line: the conclusion, answer, or recommended action in the first sentence.',
      'Follow with supporting reasoning under short headings or a compact list.',
      'Keep justification brief and scannable.',
      'Do not open with background or build-up.',
    ].join('\n'),
  },
  'layers': {
    id: 'layers',
    name: 'Progressive detail',
    description: 'Control how much information I get at once.',
    prompt: [
      'Use progressive disclosure so the reader controls how much information arrives at once.',
      'Start with Layer 1: the direct answer, the minimum context needed to use it, and at most one immediate next step.',
      'Keep Layer 1 short and self-contained. Do not front-load background, edge cases, or exhaustive alternatives.',
      'Add Layer 2 only when the user asks for more detail or the task cannot be completed safely without it. Layer 2 explains how and why.',
      'Reserve Layer 3 for implementation detail, trade-offs, edge cases, and references requested by the user.',
      'When deeper material is available but not required, name the available topics in one short line instead of expanding them.',
      'Never hide information required for correctness, safety, or a complete deliverable.',
    ].join('\n'),
  },
})

/** Whether a value is one of the built-in style ids. */
export function isOutputStyleId(value: string): value is OutputStyleId {
  return (OUTPUT_STYLE_IDS as readonly string[]).includes(value)
}
