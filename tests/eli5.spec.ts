import { describe, expect, it } from 'vitest'
import { ELI5_PROMPT, ELI5_REFERENCE_URL } from '../src/eli5'
import { OUTPUT_STYLES } from '../src/styles'

describe('DSH-native ELI5 style', () => {
  it('uses the focused ELI5 prompt', () => {
    expect(OUTPUT_STYLES.eli5.prompt).toBe(ELI5_PROMPT)
    expect(ELI5_PROMPT).toContain('smart adult who is new to the subject')
    expect(ELI5_PROMPT).toContain('one concrete everyday analogy')
    expect(ELI5_PROMPT).toContain('Keep real names for APIs, commands, files, errors')
  })

  it('does not control style persistence or agent modes', () => {
    expect(ELI5_PROMPT).not.toContain('stop eli5')
    expect(ELI5_PROMPT).not.toContain('normal mode')
    expect(ELI5_PROMPT).not.toContain('task tool')
    expect(ELI5_PROMPT).not.toContain('plan mode')
  })

  it('records the community design reference without treating it as runtime content', () => {
    expect(ELI5_REFERENCE_URL).toBe('https://github.com/mblode/agent-skills/tree/main/skills/eli5')
    expect(ELI5_PROMPT).not.toContain(ELI5_REFERENCE_URL)
  })
})
