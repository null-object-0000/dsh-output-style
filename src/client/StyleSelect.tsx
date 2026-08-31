/**
 * The composer selector: a compact dropdown in the `conversation.input.left`
 * tool row (beside the access-mode and plan chrome). It reads the
 * `outputStyle` projection through the standard kit and switches styles by
 * submitting `/style <id>` over the remote command channel — the same write
 * path as the command, so the selector and `/style` can never disagree.
 *
 * @module dsh-output-style/client/StyleSelect
 */

import type { ReactNode } from 'react'
import { h, React } from './react'
import classes from './StyleSelect.module.css'

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

/**
 * A localized label: prefers the locale dictionary key `style.<value>` and
 * falls back to the projection-supplied display name.
 */
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
  const rootRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    aliveRef.current = true
    return () => { aliveRef.current = false }
  }, [])

  // The standard kit key-addressed projection reader.
  const view = useProjection?.('outputStyle') as StyleSelectView | undefined
  const options = view?.options ?? []
  const current = view?.current ?? 'default'

  // Close on outside pointer down while open.
  React.useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // No session: the composer seat is unmounted, but guard against a stale frame.
  if (sessionId === undefined || chooseStyle === undefined) return null

  const currentOption = options.find(option => option.value === current)

  const select = (value: string): void => {
    setBusy(true)
    setError(null)
    setOpen(false)
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

  const currentLabel = currentOption === undefined ? current : labelOf(t, currentOption)

  return h('div', { ref: rootRef, className: classes.wrap },
    h('button', {
      type: 'button',
      className: classes.trigger,
      'aria-label': t?.('select.aria'),
      title: t?.('select.current', { style: currentLabel }),
      disabled: busy,
      onClick: () => setOpen(value => !value),
    },
      h('span', { className: classes.label }, t?.('select.title')),
      h('span', { className: classes.value }, currentLabel),
      h('span', { className: open ? classes.caretOpen : classes.caret }, '▾')),
    open && h('div', { className: classes.menu, role: 'listbox', 'aria-label': t?.('select.aria') },
      options.map(option => h('button', {
        key: option.value,
        type: 'button',
        role: 'option',
        'aria-selected': option.value === current,
        className: option.value === current ? classes.itemActive : classes.item,
        onClick: () => select(option.value),
      },
        h('span', { className: classes.itemName }, labelOf(t, option)),
        h('span', { className: classes.itemDesc }, option.description))),
    ),
    error !== null && h('span', { className: classes.error, role: 'status', title: error }, t?.('error.failed')),
  )
}
