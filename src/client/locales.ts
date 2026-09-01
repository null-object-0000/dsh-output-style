/**
 * Bilingual dictionaries (zh/en) for every UI string; missing keys resolve
 * through the harness locale service (active → en → the key itself).
 *
 * @module dsh-output-style/client/locales
 */

export const DICT_ZH: Record<string, string> = {
  'select.aria': '回答方式，当前：{mode}',
  'group.style': '表达方式',
  'group.method': '思考引导',
  'style.default': '默认',
  'style.default.description': '正常回答',
  'style.adhd-friendly': '开始行动',
  'style.adhd-friendly.description': '把任务拆成马上能做的下一步',
  'style.eli5': '通俗解释',
  'style.eli5.description': '用白话和类比，让我看懂',
  'style.bluf': '结论先行',
  'style.bluf.description': '先告诉我最重要的',
  'style.layers': '分层展开',
  'style.layers.description': '先给少量重点，需要时再展开',
  'method.off': '默认',
  'method.off.description': '不使用额外的对话方法',
  'method.interview': '访谈梳理',
  'method.interview.description': '逐个提问，帮我把模糊想法说清楚',
  'method.feynman': '费曼学习',
  'method.feynman.description': '通过复述和纠错，让我真正理解',
  'method.rubber-duck': '橡皮鸭',
  'method.rubber-duck.description': '通过追问，帮我发现哪里没想清楚',
  'error.failed': '切换失败',
}

export const DICT_EN: Record<string, string> = {
  'select.aria': 'Answer mode, current: {mode}',
  'group.style': 'Presentation',
  'group.method': 'Thinking guidance',
  'style.default': 'Default',
  'style.default.description': 'Answer normally',
  'style.adhd-friendly': 'Start doing',
  'style.adhd-friendly.description': 'Turn the task into one doable next step',
  'style.eli5': 'ELI5',
  'style.eli5.description': 'Help me understand with plain words and analogies',
  'style.bluf': 'BLUF',
  'style.bluf.description': 'Tell me the most important thing first',
  'style.layers': 'Layers',
  'style.layers.description': 'Start with the essentials and expand only when needed',
  'method.off': 'Default',
  'method.off.description': 'Use no additional conversation method',
  'method.interview': 'Clarify my idea',
  'method.interview.description': 'Ask one question at a time and make my fuzzy idea clear',
  'method.feynman': 'Feynman learning',
  'method.feynman.description': 'Use teach-back and correction to build real understanding',
  'method.rubber-duck': 'Rubber duck',
  'method.rubber-duck.description': 'Question my reasoning until the unclear part appears',
  'error.failed': 'Failed to switch',
}
