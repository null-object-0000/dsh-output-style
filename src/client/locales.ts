/**
 * Bilingual dictionaries (zh/en) for every UI string; missing keys resolve
 * through the harness locale service (active → en → the key itself).
 *
 * @module dsh-output-style/client/locales
 */

export const DICT_ZH: Record<string, string> = {
  'select.aria': '输出风格',
  'select.title': '输出风格',
  'select.current': '当前：{style}',
  'style.default': '默认',
  'style.adhd-friendly': 'ADHD 友好',
  'style.eli5': '通俗解释',
  'style.bluf': '结论先行',
  'desc.default': '不加风格约束，正常回答',
  'desc.adhd-friendly': '短小可扫读的分块，并给出唯一的下一步',
  'desc.eli5': '用平实语言，每个要点配一个具体类比',
  'desc.bluf': '先给结论，再给简要理由',
  'error.failed': '切换输出风格失败',
}

export const DICT_EN: Record<string, string> = {
  'select.aria': 'Output style',
  'select.title': 'Output style',
  'select.current': 'Current: {style}',
  'style.default': 'Default',
  'style.adhd-friendly': 'ADHD-friendly',
  'style.eli5': 'ELI5',
  'style.bluf': 'BLUF',
  'desc.default': 'No style guidance — answer normally',
  'desc.adhd-friendly': 'Short, scannable chunks with one clear next step',
  'desc.eli5': 'Plain language with one concrete analogy per idea',
  'desc.bluf': 'Bottom line up front, then brief reasoning',
  'error.failed': 'Failed to switch output style',
}
