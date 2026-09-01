# dsh-output-style

中文 | [English](README.en.md)

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的会话级回答方式插件。
它在输入框旁提供一个单选入口，统一管理表达风格和思考引导；后选会覆盖前选，不会改变模型、权限、工具、Plan 或 Goal。
菜单内按**表达方式**和**思考引导**分组，便于快速区分用途。

## 回答方式

表达方式：

| 模式 | 作用 |
| --- | --- |
| `default` | 不注入额外引导，正常回答。 |
| `eli5` | 用白话和类比解释复杂内容，让我看懂。 |
| `adhd-friendly` | **开始行动**——把任务拆成马上能做的下一步。 |
| `bluf` | 先说最重要的，再补充关键理由。 |
| `layers` | 先给必要重点，需要时再逐层展开。 |

思考引导：

| 模式 | 作用 |
| --- | --- |
| `interview` | 一次问一个问题，把模糊想法梳理清楚。 |
| `feynman` | 通过解释、复述和纠错，建立真正理解。 |
| `rubber-duck` | 通过追问推理，找到没有想清楚的地方。 |

## 环境要求

- DeepSeek Harness `>=0.1.0-rc.7`（开发基于 `0.1.1-rc.2`）。
- 一个要安装进去的 DSH profile（下面以 `web` profile 为例）。

## 安装

```sh
dsh plugin --profile web add dsh-output-style
```

重启 `dsh web`。回答方式选择器会出现在输入框工具行、权限控件旁边。

从本地检出目录安装：

```sh
dsh plugin --profile web add file:/path/to/dsh-output-style
```

## 卸载

```sh
dsh plugin --profile web remove dsh-output-style
```

然后重启 `dsh web`。

## 使用

- `/style` —— 列出当前表达风格和所有可用风格。
- `/style <id>` —— 切换表达风格，例如 `/style layers`。
- `/style off` 或 `/style default` —— 回到默认。
- `/eli5`、`/adhd`、`/bluf`、`/layers` —— 直接切换对应表达风格。
- `/method` —— 列出当前思考引导和所有可用方法。
- `/method <id>` —— 切换思考引导；`/method off` 回到默认。
- `/interview`、`/feynman`、`/rubber-duck` —— 直接开启对应思考引导。
- 页面选择器与斜杠命令使用同一套会话状态。

选择按**会话**保存，resume / fork 后仍能恢复。无论通过选择器还是快捷命令切换，新回答方式都会关闭原来的回答方式。

## 工作原理

插件分为 host 和 client 两部分：

- **host**（`src/index.ts`）—— 注册系统提示词片段、互斥的会话投影和斜杠命令。
- **client**（`src/client/`）—— 提供输入框旁的单一选择器，并打包为 `lib/client.js`。

host 和 client 都读取 `command/run` / `command/done` 持久化事件的同一份纯折叠，因此模型看到的引导和页面选中状态始终一致，也不需要写自定义 Session Event。

### I Have ADHD 适配

`adhd-friendly` 改编自 [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd)，保留上游项目的 10 条行为规则、例外情况和发送前检查。
开启与持久化由 DSH 负责，因此没有嵌入上游 Skill 自己的开关指令；选择回答方式也不会改变 Agent 的运行模式。

本适配固定对应上游提交 `cbe69fb83c08a37cf54d5ec9ec6bb88c8bc9973c`。归属和许可证见
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。来源名称仅出现在说明与致谢中，不会显示在选择器文案里。

### ELI5 设计

`eli5` 是面向 DSH 场景重新编写的提示词，参考了常见的 ELI5 实践和
[`mblode/agent-skills`](https://github.com/mblode/agent-skills/tree/main/skills/eli5)
等社区实现，不是逐字复制，也不宣称为官方实现。它保留白话要点、贯穿类比、真实技术名称、逐层深入和明确下一步；开启、持久化、工具与 Agent 模式仍由 DSH 负责。

## 开发

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run dist
```

`pnpm run dist` 会执行 `publint`。它会报告一条预期内的 CJS/ESM 警告：DSH 浏览器加载器要求 CommonJS 客户端 bundle 固定使用 `lib/client.js`，因此不能改为 `.cjs`。

## 发布

发布由 [GitHub Actions](.github/workflows/publish.yml) 和 npm Trusted Publishing（OIDC）完成，不需要长期 npm token。
推送 `v*` 标签后，流水线会执行类型检查、测试、构建、发布检查、版本校验和 npm 发布。

```sh
npm version patch   # 也可以使用 minor / major
git push --follow-tags
```

## 许可证

[Apache-2.0](LICENSE)。改编的 `i-have-adhd` 内容使用 MIT 许可证，详见
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
