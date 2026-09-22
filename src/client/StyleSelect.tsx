/** One single-select answer-mode control backed by the two durable projections. */

import type { ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconChevronDownOutlineRegular,
  Menu,
  type MenuEntry,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { h, React } from './react'
import css from './StyleSelect.module.css'

interface ProjectionView {
  options: { value: string; name: string; description: string }[]
  current: string
}

type ModeKind = 'style' | 'method'

interface AnswerModeOption {
  id: string
  kind: ModeKind
  value: string
  name: string
  description: string
}

export interface StyleSelectProps {
  sessionId?: string
  useProjection?: <K extends string>(key: K) => unknown
  t?: (key: string, params?: Record<string, string | number>) => string
  chooseValue?: (kind: ModeKind, value: string) => Promise<string | null>
}

function localized(
  t: StyleSelectProps['t'],
  kind: ModeKind,
  option: { value: string; name: string; description: string },
): { name: string; description: string } {
  const prefix = kind === 'style' ? 'style' : 'method'
  const nameKey = `${prefix}.${option.value}`
  const descriptionKey = `${nameKey}.description`
  const name = t?.(nameKey)
  const description = t?.(descriptionKey)
  return {
    name: name === undefined || name === nameKey ? option.name : name,
    description: description === undefined || description === descriptionKey ? option.description : description,
  }
}

function containsCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value)
}

/** Merge the internal axes into the one public choice order. */
function answerModeOptions(
  styleView: ProjectionView | undefined,
  methodView: ProjectionView | undefined,
  t: StyleSelectProps['t'],
): AnswerModeOption[] {
  const styles = new Map((styleView?.options ?? []).map(option => [option.value, option]))
  const methods = new Map((methodView?.options ?? []).map(option => [option.value, option]))
  const order: readonly [ModeKind, string][] = [
    ['style', 'default'],
    ['style', 'eli5'],
    ['style', 'adhd-friendly'],
    ['method', 'interview'],
    ['method', 'feynman'],
    ['style', 'bluf'],
    ['style', 'layers'],
    ['method', 'rubber-duck'],
  ]
  return order.flatMap(([kind, value]) => {
    const option = (kind === 'style' ? styles : methods).get(value)
    if (option === undefined) return []
    const copy = localized(t, kind, option)
    return [{ id: `${kind}:${value}`, kind, value, ...copy }]
  })
}

export function StyleSelect(props: StyleSelectProps): ReactNode {
  const { sessionId, useProjection, t, chooseValue } = props
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const aliveRef = React.useRef(true)

  React.useEffect(() => {
    aliveRef.current = true
    return () => { aliveRef.current = false }
  }, [])

  const styleView = useProjection?.('outputStyle') as ProjectionView | undefined
  const methodView = useProjection?.('conversationMethod') as ProjectionView | undefined
  const options = answerModeOptions(styleView, methodView, t)
  const currentId = methodView?.current !== undefined && methodView.current !== 'off'
    ? `method:${methodView.current}`
    : `style:${styleView?.current ?? 'default'}`
  const current = options.find(option => option.id === currentId) ?? options[0]
  const currentLabel = current?.name ?? t?.('style.default') ?? 'Default'

  if (sessionId === undefined || chooseValue === undefined) return null

  const itemOf = (option: AnswerModeOption): MenuEntry => ({
    id: option.id,
    label: h('span', { className: css.option },
      h('span', { className: clsx(css.optionName, containsCjk(option.name) && css.optionCjk) }, option.name),
      h('span', { className: clsx(css.optionDescription, containsCjk(option.description) && css.optionCjk) }, option.description),
    ),
  })
  const defaultOption = options.find(option => option.value === 'default')
  const styleOptions = options.filter(option => option.kind === 'style' && option.value !== 'default')
  const methodOptions = options.filter(option => option.kind === 'method')
  const items: readonly MenuEntry[] = [
    ...(defaultOption === undefined ? [] : [itemOf(defaultOption)]),
    { type: 'separator', id: 'separator-default' },
    { type: 'label', id: 'label-style', text: t?.('group.style') ?? 'Presentation' },
    ...styleOptions.map(itemOf),
    { type: 'separator', id: 'separator-method' },
    { type: 'label', id: 'label-method', text: t?.('group.method') ?? 'Thinking guidance' },
    ...methodOptions.map(itemOf),
  ]

  const select = (id: string): void => {
    setOpen(false)
    if (id === currentId) return
    const option = options.find(candidate => candidate.id === id)
    if (option === undefined) return
    setBusy(true)
    setError(null)
    chooseValue(option.kind, option.value).then((failure) => {
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
    selectedId: currentId,
    side: 'top',
    onSelect: select,
    onClose: () => { setOpen(false) },
    anchor: h('button', {
      type: 'button',
      className: css.trigger,
      'aria-label': t?.('select.aria', { mode: currentLabel }),
      title: current?.description,
      disabled: busy,
      onClick: () => { setOpen(!open) },
    },
      h('span', { className: clsx(css.triggerLabel, containsCjk(currentLabel) && css.triggerLabelCjk) }, currentLabel),
      h(IconChevronDownOutlineRegular, { className: clsx(css.chevron, open && css.chevronOpen) }),
    ),
  }, error !== null && h('span', { className: css.error, role: 'status', title: error }, t?.('error.failed')))
}
