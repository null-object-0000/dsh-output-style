# dsh-output-style

Session-scoped output styles for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a `/style` slash command and a composer selector that change **how** the model presents answers — never what it knows or which tools it has.

Built-in styles:

| Style | What it does |
| --- | --- |
| `default` | No guidance — the assistant answers normally. |
| `adhd-friendly` | Short, scannable chunks with one clear next step. |
| `eli5` | Plain language with one concrete analogy per idea. |
| `bluf` | Bottom line up front, then brief reasoning. |

## Requirements

- DeepSeek Harness `>=0.1.0-rc.7` (developed against `0.1.1-rc.2`).
- A DSH profile to install into (the `web` profile below).

## Install

```sh
dsh plugin --profile web add dsh-output-style
```

Restart `dsh web`. The style selector appears in the composer's tool row,
beside the `Workspace Write` permission control.

Installing from a local checkout (before the package is on npm):

```sh
dsh plugin --profile web add file:/path/to/dsh-output-style
```

## Uninstall

```sh
dsh plugin --profile web remove dsh-output-style
```

Then restart `dsh web`.

## Use

- `/style` — list the current style and every available style.
- `/style <id>` — switch (e.g. `/style bluf`).
- `/style off` (or `/style default`) — back to the default.
- The composer dropdown does the same thing: it submits `/style <id>`.

The selection is per-session, survives resume and fork, and is reconstructed
from the session log — the plugin folds the durable `command/run` /
`command/done` events for the `/style` command instead of writing custom
session events (which DSH's persistence read path would refuse from a
third-party plugin).

## How it works

One package, two halves:

- **host** (`src/index.ts`) — a Cordis plugin that registers the
  `output-style:guidance` system-prompt section, the `outputStyle` session
  projection, and the `/style` command.
- **client** (`src/client/`) — the composer selector, bundled to
  `lib/client.js`, loaded through `exports["./client"]` and the `dsh.client`
  declaration.

The host and client both read the same pure fold of `/style`'s `command/run` /
`command/done` events (`src/style-command.ts`), so the model-visible guidance
and the dropdown always agree.

## Development

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run dist   # build + publish lint (publint)
```

`pnpm run dist` runs `publint`, the publish gate. It reports one expected
warning — `exports["./client"]` is written in CJS but parsed as ESM. This is
intentional: DSH hard-pins a client plugin's browser bundle to `lib/client.js`
(loaded from `/plugins/<id>/client.js`), so it must stay `.js`, not `.cjs`.

## Publishing

`prepublishOnly` runs `dist` automatically, so `npm publish` builds and lints
before it goes out.

## License

[Apache-2.0](LICENSE)

