# dsh-output-style

Session-scoped output styles for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a `/style` slash command and a composer selector that change **how** the model presents answers — never what it knows or which tools it has.

Built-in styles:

| Style | What it does |
| --- | --- |
| `default` | No guidance — the assistant answers normally. |
| `adhd-friendly` | Short, scannable chunks with one clear next step. |
| `eli5` | Plain language with one concrete analogy per idea. |
| `bluf` | Bottom line up front, then brief reasoning. |

## Install

```sh
dsh plugin --profile web add dsh-output-style
```

Then restart `dsh web`. The selector appears in the composer's tool row,
beside the `Workspace Write` permission control.

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

## Development

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
```

The package has two halves:

- host (`src/index.ts`) — the prompt section, the `outputStyle` session
  projection, and the `/style` command;
- client (`src/client/`) — the composer selector, bundled to `lib/client.js`.

Targets DSH `>=0.1.0-rc.7` (developed against `0.1.1-rc.2`).

## License

Not yet chosen.
