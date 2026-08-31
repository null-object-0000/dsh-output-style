/**
 * Bilingual dictionaries (zh/en) for every UI string; missing keys resolve
 * through the harness locale service (active → en → the key itself).
 *
 * @module dsh-output-style/client/locales
 */

export const DICT_ZH: Record<string, string> = {
  'select.aria': '输出风格，当前：{style}',
  'style.default': '默认',
  'style.adhd-friendly': 'ADHD 友好',
  'style.eli5': '通俗解释',
  'style.bluf': '结论先行',
  'error.failed': '切换输出风格失败',
}

export const DICT_EN: Record<string, string> = {
  'select.aria': 'Output style, current: {style}',
  'style.default': 'Default',
  'style.adhd-friendly': 'ADHD-friendly',
  'style.eli5': 'ELI5',
  'style.bluf': 'BLUF',
  'error.failed': 'Failed to switch output style',
}
