# dsh-output-style

[English](README.md) | 中文

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的会话级回答方式插件。
一个选择器统一提供表达风格和对话引导方式，始终单选，后选会覆盖前选；不会改变模型、权限、工具、Plan 或 Goal。
菜单内按**表达方式**和**思考引导**分组，便于快速区分用途。

输出风格（单选）：

| 风格 | 作用 |
| --- | --- |
| `default` | 不注入任何引导，正常回答。 |
| `eli5` | 用白话和类比解释复杂内容。 |
| `adhd-friendly` | **开始行动** — 改编自 [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd)，把任务变成明确的下一步。 |
| `bluf` | 先说结论，再补充关键理由。 |
| `layers` | 先给必要重点，需要时再逐层展开。 |

对话引导方式：

| 方法 | 作用 |
| --- | --- |
| `interview` | 一次问一个问题，把模糊想法梳理成清晰简报。 |
| `feynman` | 通过解释、复述和纠错，建立真正理解。 |
| `rubber-duck` | 通过追问推理，找到没有想清楚的假设。 |

## 环境要求

- DeepSeek Harness `>=0.1.0-rc.7`（开发基于 `0.1.1-rc.2`）。
- 一个要安装进去的 DSH profile（下面以 `web` profile 为例）。

## 安装

```sh
dsh plugin --profile web add dsh-output-style
```

重启 `dsh web`。回答方式选择器会出现在输入框工具行、权限控件旁边。

在发布到 npm 之前，从本地检出目录安装：

```sh
dsh plugin --profile web add file:/path/to/dsh-output-style
```

## 卸载

```sh
dsh plugin --profile web remove dsh-output-style
```

然后重启 `dsh web`。

## 使用

- `/style` —— 列出当前输出风格和所有风格。
- `/style <id>` —— 切换（例如 `/style layers`）。
- `/style off`（或 `/style default`）—— 回到默认。
- `/eli5`、`/adhd`、`/bluf`、`/layers` —— 直接切换对应风格。
- `/method` —— 列出当前对话方法和所有方法。
- `/method <id>` —— 切换方法；`/method off` 回到普通对话。
- `/interview`、`/feynman`、`/rubber-duck` —— 直接开启对应方法。
- 下拉选择器提交同样的 `/style` 和 `/method` 命令。

选择按**会话**保存，resume / fork 后仍能恢复。无论通过选择器还是快捷命令切换，新回答方式都会关闭原来的回答方式。

## 工作原理

一个包，两个半边：

- **host**（`src/index.ts`）—— 注册风格/方法系统提示词、互斥的会话投影和斜杠命令。
- **client**（`src/client/`）—— 一个输入框选择器，打包到 `lib/client.js`，通过 `exports["./client"]` 和 `dsh.client` 声明加载。

host 和 client 都读取 `command/run` / `command/done` 持久化事件的同一份纯折叠（`src/style-command.ts` 和
`src/method-command.ts`），所以模型看到的引导和下拉框始终一致，也不需要写自定义 Session Event。

### I Have ADHD 适配

`adhd-friendly` 保留了上游项目的 10 条行为规则、例外情况和发送前检查。开启与持久化由 DSH 的
`/style` 和会话投影负责，因此没有嵌入上游 Skill 自己的开关指令。上游中“进入 harness plan”的指令也已收窄：选择输出风格不会改变 Agent 的运行模式。

本适配固定对应上游提交 `cbe69fb83c08a37cf54d5ec9ec6bb88c8bc9973c`。归属和许可证见
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

### ELI5 设计

`eli5` 是面向 DSH 场景重新编写的提示词，参考了常见的 ELI5 实践和
[`mblode/agent-skills`](https://github.com/mblode/agent-skills/tree/main/skills/eli5)
等社区实现，不是逐字复制，也不宣称为官方实现。它保留了白话要点、单一贯穿类比、真实技术名称、逐层深入和明确下一步；开启、持久化、工具与 Agent 模式仍由 DSH 负责。

## 开发

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run dist   # 构建 + 发布 lint（publint）
```

`pnpm run dist` 会跑 `publint`（发布检查）。它会报一条**预期内**的警告——`exports["./client"]` 是 CJS 写法但被当 ESM 解析。这是故意的：DSH 把客户端插件的浏览器 bundle 硬绑定到 `lib/client.js`（从 `/plugins/<id>/client.js` 加载），所以必须是 `.js`，不能改成 `.cjs`。

## 发布

`prepublishOnly` 会自动跑 `dist`，所以 `npm publish` 在发布前会先构建并 lint。

## License

[Apache-2.0](LICENSE)。改编的 `i-have-adhd` 内容使用 MIT 许可证，详见
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
