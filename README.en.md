# dsh-output-style

[中文](README.md) | English

Session-scoped answer modes for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
One selector offers presentation styles and guided conversation methods as a
single choice. A new choice replaces the previous one; none of them change the
model, permissions, tools, Plan, or Goal.
The menu groups choices under **Presentation** and **Thinking guidance**.

Output styles (choose one):

| Style | What it does |
| --- | --- |
| `default` | No guidance — the assistant answers normally. |
| `eli5` | Explain complex ideas with plain words and analogies. |
| `adhd-friendly` | **Start doing** — turn work into a clear next action, adapted from [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd). |
| `bluf` | Give the answer first, then the key reasons. |
| `layers` | Start with the essentials and reveal detail only when needed. |

Guided conversation methods:

| Method | What it does |
| --- | --- |
| `interview` | Ask one question at a time and turn a fuzzy idea into a clear brief. |
| `feynman` | Use explanation, teach-back, and correction to build real understanding. |
| `rubber-duck` | Question the user's reasoning until the missing assumption appears. |

## Requirements

- DeepSeek Harness `>=0.1.0-rc.7` (developed against `0.1.1-rc.2`).
- A DSH profile to install into (the `web` profile below).

## Install

```sh
dsh plugin --profile web add dsh-output-style
```

Restart `dsh web`. The answer-mode selector appears in the composer's tool row
beside the permission control.

Installing from a local checkout:

```sh
dsh plugin --profile web add file:/path/to/dsh-output-style
```

## Uninstall

```sh
dsh plugin --profile web remove dsh-output-style
```

Then restart `dsh web`.

## Use

- `/style` — list the current output style and every available style.
- `/style <id>` — switch (e.g. `/style layers`).
- `/style off` (or `/style default`) — back to the default.
- `/method` — list the current conversation method and every method.
- `/method <id>` — switch method; `/method off` returns to normal conversation.
- The composer dropdown submits the same `/style` and `/method` commands.

Individual answer modes are not registered as separate slash commands, so they
do not flood the composer command palette. Prefer the visual selector for daily use.

The selection is per-session, survives resume and fork, and is reconstructed
from the session log. Switching through either a command or the selector turns
off the previous answer mode.

## How it works

One package, two halves:

- **host** (`src/index.ts`) — registers style/method system-prompt sections,
  mutually exclusive session projections, and slash commands.
- **client** (`src/client/`) — provides the single composer selector bundled
  as `lib/client.js`.

The host and client read the same pure folds of durable `command/run` /
`command/done` events, so model-visible guidance and the dropdown always agree.
No custom session event types are written.

### I Have ADHD adaptation

`adhd-friendly` preserves the canonical project's ten behavioral rules,
exceptions, and pre-send check. DSH owns activation and persistence, so the
upstream skill's self-activation instructions are not embedded. Choosing an
answer mode never changes the agent's operating mode.

The adaptation is pinned to upstream revision
`cbe69fb83c08a37cf54d5ec9ec6bb88c8bc9973c`. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for attribution and license.

### ELI5 design

`eli5` is a DSH-focused original prompt informed by common ELI5 practice and
community work such as [`mblode/agent-skills`](https://github.com/mblode/agent-skills/tree/main/skills/eli5).
It is not a verbatim copy or an official implementation. It keeps the useful
core while leaving activation, persistence, tools, and agent modes to DSH.

## Development

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run dist
```

`pnpm run dist` runs `publint`. It reports one expected warning because the DSH
browser loader requires the CommonJS client bundle to remain at `lib/client.js`.

## Publishing

Publishing is driven by [GitHub Actions](.github/workflows/publish.yml) using
npm Trusted Publishing (OIDC). A `v*` tag runs the complete release gate and
publishes the matching package version.

```sh
npm version patch   # or minor / major
git push --follow-tags
```

## License

[Apache-2.0](LICENSE). The adapted `i-have-adhd` material is available under
the MIT License; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
