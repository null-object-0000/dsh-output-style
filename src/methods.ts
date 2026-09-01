/** Session-scoped conversation methods that shape turn-taking, not presentation. */

export interface ConversationMethod {
  id: ConversationMethodId
  name: string
  description: string
  prompt: string
}

export type ConversationMethodId = 'off' | 'interview' | 'feynman' | 'rubber-duck'

export const CONVERSATION_METHOD_IDS: readonly ConversationMethodId[] = [
  'off',
  'interview',
  'feynman',
  'rubber-duck',
]

export const CONVERSATION_METHODS: Readonly<Record<ConversationMethodId, ConversationMethod>> = Object.freeze({
  off: {
    id: 'off',
    name: 'Normal conversation',
    description: 'Respond normally without a guided conversation method.',
    prompt: '',
  },
  interview: {
    id: 'interview',
    name: 'Clarify my idea',
    description: 'Help me turn a fuzzy idea into clear words.',
    prompt: [
      'Use an interview to help the user turn a fuzzy idea into a clear, usable brief.',
      'Ask one focused question at a time. Choose the question that removes the largest remaining uncertainty.',
      'Briefly reflect your current understanding before the next question so the user can correct it.',
      'Prefer concrete choices and examples when an open-ended question would be hard to answer.',
      'Do not rush into implementation while the goal, audience, constraints, or success criteria remain unclear.',
      'Once the idea is clear enough, stop interviewing and synthesize it into: goal, audience, key decisions, constraints, success criteria, and next step.',
    ].join('\n'),
  },
  feynman: {
    id: 'feynman',
    name: 'Understand deeply',
    description: 'Help me understand for real through teach-back.',
    prompt: [
      'Use a Feynman-style learning loop to help the user build real understanding.',
      'Teach one small concept at a time in plain language, connected to what the user already knows.',
      'After each important concept, ask one short diagnostic question or invite a brief explanation in the user\'s own words.',
      'Use the response to identify the exact gap, then explain that gap with a concrete example before moving on.',
      'Distinguish memorized labels from causal understanding: ask what happens, why it happens, and what would change the outcome.',
      'Do not turn every answer into a quiz. If the user needs a direct answer or is completing urgent work, answer first and use the learning loop only where it helps.',
    ].join('\n'),
  },
  'rubber-duck': {
    id: 'rubber-duck',
    name: 'Find my blind spot',
    description: 'Help me find what I have not thought through.',
    prompt: [
      'Act as a rubber-duck partner who helps the user inspect their own reasoning.',
      'Ask one narrow question at a time. Begin with the intended outcome, then compare it with what actually happens.',
      'Surface assumptions explicitly and ask what evidence supports each important one.',
      'For debugging, narrow toward the smallest reproducible case and the first point where observed behavior diverges from expectation.',
      'Reflect contradictions or missing links matter-of-factly. Do not jump to a solution before the unclear assumption is visible.',
      'When the gap is found, summarize it in one sentence and propose the smallest next check or correction.',
    ].join('\n'),
  },
})

export function isConversationMethodId(value: string): value is ConversationMethodId {
  return (CONVERSATION_METHOD_IDS as readonly string[]).includes(value)
}
