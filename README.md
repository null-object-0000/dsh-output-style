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

## 同一个问题，八种回答方式

我们向同一个模型提出了同一个问题：

> 我想做一个类似短网址的服务：输入一个很长的网址，返回一个短网址，访问短网址时再跳回原地址。我应该怎么设计？

模式没有改变模型、工具或权限，但明显改变了回答的组织方式，以及 Agent 如何推进问题。

### 想直接获得答案

**默认**

给出一份完整的技术方案，从数据模型、短码生成讲到缓存、安全和规模化。信息最全面，但也需要一次消化最多内容。

**通俗解释**

先把短网址比作酒店服务：

> 短码是房号，数据库是登记本，服务器是前台。

理解核心模型后，再引入 Base62、重定向和缓存等真实技术概念。它没有回避术语，而是先为术语建立直觉。

**开始行动**

先压缩成可以执行的设计：

> 一张表保存“短码 → 长网址”，创建时生成短码，访问时查表并返回 302。

随后只确认是否需要继续搭建代码。用户选择“只要设计”后，Agent 又把结果收敛成短码、跳转方式、存储三个决策。本次运行共回复两步，只追问了一次。

**结论先行**

第一句话直接给出推荐方案：

> 核心就是一张映射表，短码用自增 ID 经 Base62 编码生成，访问时查表并返回 302。

后面的表结构、缓存与安全说明都是对这条结论的补充。它并不刻意缩短答案，而是确保用户不用读到最后才知道建议是什么。

**分层展开**

只提供第一层必要信息：生成短码、保存映射、访问时重定向，然后让用户选择继续展开短码冲突、缓存并发或安全防滥用。

这是本次测试中最短的直接回答，正文约 724 字，只有默认模式的约 28%。

### 想和 Agent 一起思考

**访谈梳理**

Agent 没有立即假设需求，而是依次确认了三个问题：

1. 使用场景和规模；
2. 技术栈偏好；
3. 最终想要设计文档还是可运行代码。

得到答案后，才整理出架构、数据模型、接口、安全约束和成功标准。它适合“我大概知道想做什么，但还说不清具体需求”的阶段。

**费曼学习**

Agent 先解释短网址为什么本质上是一张映射表，然后用一个诊断问题检查理解：

> 为什么使用“自增 ID + Base62”，而不是“对长网址做哈希再截断”？两者的根本区别是什么？

目标不只是给出设计，而是确认用户能否自己解释关键取舍。

**橡皮鸭**

Agent 连续提出了八个窄问题，从服务规模一路追问到哈希碰撞、去重机制和短码枚举。

用户最初选择“长网址哈希后截断”，经过逐步推演，最终发现：

> “同一长链得到同一短码”其实由查表去重保证，而不是由哈希保证；哈希截断只增加了碰撞处理，并没有带来额外收益。

最后方案自然收敛为“查表去重 + 随机不可枚举短码”。橡皮鸭没有替用户直接做决定，而是帮助用户发现自己推理中的隐藏假设。

> [!NOTE]
> 这是一组真实运行结果，不是预先编写的固定答案。模型每次生成的技术细节可能不同；回答方式控制的是信息如何组织、问题如何推进，而不是把回答锁死成某个模板。

## 环境要求

- DeepSeek Harness `>=0.1.7-alpha.1`（开发基于 `0.1.7-alpha.1`）。
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
- `/method` —— 列出当前思考引导和所有可用方法。
- `/method <id>` —— 切换思考引导；`/method off` 回到默认。
- 页面选择器与斜杠命令使用同一套会话状态。

插件不会把每种回答方式注册成独立的斜杠命令，以免占满输入框的命令面板。日常使用推荐直接通过页面选择器切换。

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
