# dsh-output-style

[English](README.md) | 中文

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的会话级输出风格插件：通过 `/style` 斜杠命令和输入框旁的选择器，改变模型**如何呈现**答案——而不改变它知道什么、能用哪些工具。

内置风格：

| 风格 | 作用 |
| --- | --- |
| `default` | 不注入任何引导，正常回答。 |
| `adhd-friendly` | 改编自 [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd) 的行动优先、ADHD 友好输出。 |
| `eli5` | 用平实语言，每个概念配一个具体类比。 |
| `bluf` | 结论先行，再给简要理由。 |

## 环境要求

- DeepSeek Harness `>=0.1.0-rc.7`（开发基于 `0.1.1-rc.2`）。
- 一个要安装进去的 DSH profile（下面以 `web` profile 为例）。

## 安装

```sh
dsh plugin --profile web add dsh-output-style
```

重启 `dsh web`。风格选择器会出现在输入框工具行、`Workspace Write` 权限控件旁边。

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

- `/style` —— 列出当前风格和所有可用风格。
- `/style <id>` —— 切换（例如 `/style bluf`）。
- `/style off`（或 `/style default`）—— 回到默认。
- 输入框旁的下拉选择器做的事一样：它提交的就是 `/style <id>`。

选择是按**会话**保存的，resume / fork 后仍能恢复——插件折叠 `/style` 命令的 `command/run` /
`command/done` 这两个持久化事件来重建当前风格，而不是写自定义会话事件（第三方插件的自定义事件会被 DSH 的持久化读取路径拒绝）。

## 工作原理

一个包，两个半边：

- **host**（`src/index.ts`）—— 一个 Cordis 插件，注册 `output-style:guidance` 系统提示词段落、`outputStyle` 会话投影、`/style` 命令。
- **client**（`src/client/`）—— 输入框选择器，打包到 `lib/client.js`，通过 `exports["./client"]` 和 `dsh.client` 声明加载。

host 和 client 都读取 `/style` 的 `command/run` / `command/done` 事件的同一份纯折叠（`src/style-command.ts`），所以模型看到的引导文本和下拉框显示永远一致。

### I Have ADHD 适配

`adhd-friendly` 保留了上游项目的 10 条行为规则、例外情况和发送前检查。开启与持久化由 DSH 的
`/style` 和会话投影负责，因此没有嵌入上游 Skill 自己的开关指令。上游中“进入 harness plan”的指令也已收窄：选择输出风格不会改变 Agent 的运行模式。

本适配固定对应上游提交 `cbe69fb83c08a37cf54d5ec9ec6bb88c8bc9973c`。归属和许可证见
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

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
