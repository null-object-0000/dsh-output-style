/**
 * The composer selector: a flat chip in the `conversation.input.left` tool
 * row that reads the `outputStyle` projection through the standard kit and
 * switches styles by submitting `/style <id>` — the same write path as the
 * command, so the selector and `/style` can never disagree.
 *
 * It mirrors the sibling access-mode and model triggers: the shared `Menu`
 * primitive (external in the browser module table) owns the popover,
 * outside-click / Escape dismissal, upward `side="top"` placement, and the
 * trailing check; the trigger is the 28px flat neutral chip those selects
 * use. No custom popover, no invented CSS variables.
 *
 * @module dsh-output-style/client/StyleSelect
 */

import type { ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconChevronDownOutline14,
  IconSparkle16,
  Menu,
  type MenuEntry,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { h, React } from './react'
import css from './StyleSelect.module.css'

/** Local wire-value shape the projection delivers (avoid dragging zod in). */
export interface StyleSelectView {
  options: { value: string; name: string; description: string }[]
  current: string
}

/** Props this component consumes (framework standard kit + inject face + locale). */
export interface StyleSelectProps {
  sessionId?: string
  useProjection?: <K extends string>(key: K) => unknown
  /** Bound translator for the plugin's locale namespace. */
  t?: (key: string, params?: Record<string, string | number>) => string
  /** Submits `/style <value>` and resolves null on success or a message on failure. */
  chooseStyle?: (value: string) => Promise<string | null>
}

/** A localized style display name: locale dictionary key, then the projection name. */
function labelOf(t: StyleSelectProps['t'], option: { value: string; name: string }): string {
  const key = `style.${option.value}`
  const localized = t?.(key)
  return localized === undefined || localized === key ? option.name : localized
}

export function StyleSelect(props: StyleSelectProps): ReactNode {
  const { sessionId, useProjection, t, chooseStyle } = props
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const aliveRef = React.useRef(true)

  React.useEffect(() => {
    aliveRef.current = true
    return () => { aliveRef.current = false }
  }, [])

  const view = useProjection?.('outputStyle') as StyleSelectView | undefined
  const options = view?.options ?? []
  const current = view?.current ?? 'default'
  const currentOption = options.find(option => option.value === current)
  const currentLabel = currentOption === undefined ? current : labelOf(t, currentOption)

  // No session: the composer seat is unmounted, but guard against a stale frame.
  if (sessionId === undefined || chooseStyle === undefined) return null

  const items: readonly MenuEntry[] = options.map(option => ({ id: option.value, label: labelOf(t, option) }))

  const select = (value: string): void => {
    setOpen(false)
    if (value === current) return
    setBusy(true)
    setError(null)
    chooseStyle(value).then((failure) => {
      if (!aliveRef.current) return
      setBusy(false)
      setError(failure)
    }, (reason: unknown) => {
      if (!aliveRef.current) return
      setBusy(false)
      setError(reason instanceof Error ? reason.message : String(reason))
    })
  }

  return h(Menu, {
    open,
    items,
    selectedId: current,
    side: 'top',
    onSelect: select,
    onClose: () => { setOpen(false) },
    anchor: h('button', {
      type: 'button',
      className: css.trigger,
      'aria-label': t?.('select.aria', { style: currentLabel }),
      title: currentOption?.description,
      disabled: busy,
      onClick: () => { setOpen(!open) },
    },
      h(IconSparkle16, { className: css.triggerGlyph }),
      h('span', { className: css.triggerLabel }, currentLabel),
      h(IconChevronDownOutline14, { className: clsx(css.chevron, open && css.chevronOpen) }),
    ),
  }, error !== null && h('span', { className: css.error, role: 'status', title: error }, t?.('error.failed')))
}
