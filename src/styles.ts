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
export type OutputStyleId = 'default' | 'adhd-friendly' | 'eli5' | 'bluf'

/** The fixed MVP style ids, in display order. */
export const OUTPUT_STYLE_IDS: readonly OutputStyleId[] = ['default', 'adhd-friendly', 'eli5', 'bluf']

/** The reserved `/style` token that restores the default style. */
export const OFF = 'off'

/** The built-in style catalog, keyed by id. */
export const OUTPUT_STYLES: Readonly<Record<OutputStyleId, OutputStyle>> = Object.freeze({
  'default': {
    id: 'default',
    name: 'Default',
    description: 'No style guidance — the assistant answers normally.',
    prompt: '',
  },
  'adhd-friendly': {
    id: 'adhd-friendly',
    name: 'ADHD-friendly',
    description: 'Short, scannable chunks with one clear next step.',
    prompt: [
      'Organize every response for attention-sensitive reading.',
      'Break content into short, scannable chunks with clear headings.',
      'Put the single most important point first, then the immediate next step.',
      'Use short sentences and short paragraphs; avoid walls of text.',
      'End with one concrete "Next step" line.',
      'Minimize digressions; when a detail is optional, say so in one line and continue.',
    ].join('\n'),
  },
  'eli5': {
    id: 'eli5',
    name: 'ELI5',
    description: 'Plain language, one concrete analogy per idea.',
    prompt: [
      'Explain concepts simply, the way you would to a bright non-specialist.',
      'Prefer plain, everyday words; when a technical term is unavoidable, define it in one short sentence where it appears.',
      'Use one concrete analogy or example per idea.',
      'Build from the simple to the complex, and restate the key point at the end.',
    ].join('\n'),
  },
  'bluf': {
    id: 'bluf',
    name: 'BLUF',
    description: 'Bottom line up front, then brief reasoning.',
    prompt: [
      'Lead every response with the bottom line: the conclusion, answer, or recommended action in the first sentence.',
      'Follow with supporting reasoning under short headings or a compact list.',
      'Keep justification brief and scannable.',
      'Do not open with background or build-up.',
    ].join('\n'),
  },
})

/** Whether a value is one of the built-in style ids. */
export function isOutputStyleId(value: string): value is OutputStyleId {
  return (OUTPUT_STYLE_IDS as readonly string[]).includes(value)
}
