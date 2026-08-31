import { describe, expect, it } from 'vitest'
import {
  I_HAVE_ADHD_PROMPT,
  I_HAVE_ADHD_SOURCE_REVISION,
  I_HAVE_ADHD_SOURCE_URL,
} from '../src/i-have-adhd'
import { OUTPUT_STYLES } from '../src/styles'

describe('I Have ADHD adaptation', () => {
  it('uses the adapted upstream prompt for the ADHD-friendly style', () => {
    expect(OUTPUT_STYLES['adhd-friendly'].prompt).toBe(I_HAVE_ADHD_PROMPT)
    expect(OUTPUT_STYLES['adhd-friendly'].name).toBe('I Have ADHD')
  })

  it('retains all ten canonical behavioral rules', () => {
    const ruleHeadings = [
      'Lead with the next action',
      'Number multi-step tasks',
      'End with one concrete next action',
      'Suppress tangents',
      'Restate state every turn',
      'Give specific time estimates',
      'Make completed work visible',
      'Matter-of-fact tone for errors',
      'Cap lists at 5 items',
      'No preamble, no recap, no closing pleasantries',
    ]

    for (const [index, heading] of ruleHeadings.entries()) {
      expect(I_HAVE_ADHD_PROMPT).toContain(`### ${index + 1}. ${heading}`)
    }
  })

  it('leaves activation to DSH and cannot switch the agent operating mode', () => {
    expect(I_HAVE_ADHD_PROMPT).not.toContain('stop adhd mode')
    expect(I_HAVE_ADHD_PROMPT).not.toContain('normal mode')
    expect(I_HAVE_ADHD_PROMPT).toContain('Do not enter or leave an agent operating mode')
  })

  it('pins its provenance', () => {
    expect(I_HAVE_ADHD_SOURCE_URL).toBe('https://github.com/ayghri/i-have-adhd')
    expect(I_HAVE_ADHD_SOURCE_REVISION).toMatch(/^[0-9a-f]{40}$/)
  })
})
