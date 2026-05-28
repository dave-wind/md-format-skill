# Skill 开发工作流模版

本文档提供创建和优化 Claude Code Skill 的标准化流程。

---

## 前置准备

### 1. 环境检查

```bash
# 检查 Python 3 路径（记录下来，后续会用到）
which python3
# 示例输出: /usr/local/bin/python3 或 /Library/Frameworks/Python.framework/Versions/3.10/bin/python3

# 检查 Python 版本（需要 3.7+）
python3 --version

# 检查 skill-creator 是否可用
claude --help | grep skill-creator
```

### 2. 项目初始化

```bash
# 创建项目目录
mkdir my-skill-name
cd my-skill-name

# 初始化 git
git init

# 创建基础文件
touch SKILL.md package.json install.js README.md LICENSE .gitignore

# 创建 Codex App 配置
mkdir -p agents
touch agents/openai.yaml

# 创建评估和文档目录
mkdir -p evals docs
```

### 3. 基础文件模版

#### `.gitignore`

```
.DS_Store
node_modules/

# Evaluation outputs (keep test definitions, ignore run results)
evals/iteration-*/
evals/*.log
evals/feedback.json
```

#### `.npmignore`

```
# Development files
docs/
evals/
.git/
.DS_Store
.gitignore
```

#### `package.json`

```json
{
  "name": "my-skill-name",
  "version": "1.0.0",
  "description": "Skill description here",
  "bin": {
    "my-skill-name": "install.js"
  },
  "files": ["SKILL.md", "install.js", "agents/"],
  "keywords": ["skill", "claude-code", "ai-agent"],
  "author": "your-name",
  "license": "MIT"
}
```

#### `install.js`

直接从已有 skill 项目复制，零配置通用版。自动从 SKILL.md 读取 name 和 description，支持 `--list`、`--status`、`--uninstall` 命令，跨平台（macOS/Windows/Linux）。

```bash
# 从 md-format-skill 复制
cp /path/to/md-format-skill/install.js .
# 不需要改任何内容，SKILL_NAME 从 SKILL.md 自动读取
```

排除规则（自动排除，不需要配置）：

- 安装脚本和包元数据：`install.js`、`package.json`、`package-lock.json`
- 开发文件：`docs/`、`evals/`
- Git 和编辑器：`.git`、`.DS_Store`、`.gitignore`、`node_modules`
- npm 配置：`.npmignore`

#### `agents/openai.yaml`

Codex App 需要这个文件来识别和展示 skill。每个 skill 都需要创建：

```yaml
interface:
  display_name: "My Skill Name"
  short_description: "一句话描述 skill 功能"
  brand_color: "#2196F3" # 品牌 色，用于 Codex App UI
  default_prompt: "触发提示词" # 默认填充到codex app的提示词

policy:
  allow_implicit_invocation: false
```

字段说明：

- `display_name`: 在 Codex App 中显示的名称
- `short_description`: 简短描述，用于 skill 列表
- `brand_color`: 十六进制颜色，建议与 skill 主题相关
- `default_prompt`: 用户在 App 中点击 skill 时自动填入的提示词
- `allow_implicit_invocation`: 是否允许隐式触发（一般设 false）

---

## 模版 1: 创建新 Skill

### 步骤 1: 定义需求

在项目根目录创建 `REQUIREMENTS.md`（可选，也可以直接写在提示词里）：

```markdown
# Skill 需求文档

## 目标

[描述这个 skill 要解决什么问题]

## 触发场景

[用户说什么话时应该触发这个 skill]

## 输入 / 输出

[skill 需要什么输入，产生什么输出]

## 示例

[3-5 个真实使用场景]
```

### 步骤 2: 一条提示词跑完闭环

```bash
# 在项目根目录执行
claude
```

```
/skill-creator 创建新 skill

需求：
[粘贴需求，或粘贴 REQUIREMENTS.md 内容]

环境：Python3 = /usr/local/bin/python3，macOS。
约束：
- 不开浏览器
- 所有文件（evals/、grade.py、benchmark.json 等）必须在当前项目根目录下，不要创建外部 workspace
- evals 输出到 ./evals/，iteration 输出到 ./evals/iteration-N/
最后告诉我：版本号、通过率、遗留问题、是否可发布。
```

### 步骤 3: 人工审查（可选）

```bash
cat SKILL.md                              # 查看 skill 内容
cat evals/iteration-N/EVALUATION_REPORT.md # 查看最终测试报告
node install.js && node install.js --status # 本地安装验证
```

### 步骤 4: 提交和发布

```bash
git add SKILL.md package.json install.js README.md LICENSE .gitignore agents/
git add evals/evals.json evals/grade.py evals/README.md
git commit -m "feat: initial version of my-skill-name"
npm publish  # 需要先 npm login
```

---

## 模版 2: 优化现有 Skill

### 步骤 1: 一条提示词跑完优化闭环

```bash
# 在项目根目录执行
claude
```

```
/skill-creator 优化现有 skill

Skill 路径：./

问题：[描述当前 skill 的问题]
目标：[希望达到什么效果]

环境：Python3 = /usr/local/bin/python3，macOS。
约束：
- 不开浏览器
- 所有文件必须在当前项目根目录下，不要创建外部 workspace
- evals 输出到 ./evals/，iteration 输出到 ./evals/iteration-N/
最后告诉我：新旧对比、改了什么、遗留问题、是否可发布。
```

### 步骤 2: 人工审查（可选）

```bash
git diff SKILL.md                              # 查看改了什么
cat evals/iteration-N/EVALUATION_REPORT.md     # 查看对比报告
node install.js --status                        # 验证安装
```

### 步骤 3: 提交和发布

```bash
git add SKILL.md package.json
git commit -m "fix: [具体改进内容]"
npm version patch && git push --follow-tags && npm publish
```

---

## 常见问题和解决方案

### 问题 1: Python 环境找不到

**现象**：

```
SyntaxError: invalid syntax (Python 2.7)
```

**解决**：

- 明确指定 Python 3 路径：`/usr/local/bin/python3`
- 或在 `evals/grade.py` 第一行改为：`#!/usr/local/bin/python3`

### 问题 2: 评估目录跑到项目外部

**现象**：

- skill-creator 在 `../skill-workspace/` 或其他外部目录创建测试输出
- 无法纳入 git 管理，下次找不到

**解决**：

- 提示词约束已内置：`所有文件必须在当前项目根目录下，不要创建外部 workspace`
- 如果仍然跑到外部，检查提示词是否包含此约束

### 问题 3: 浏览器自动打开浪费 token

**现象**：

- skill-creator 默认生成 HTML 评审页面并打开浏览器
- 人工审查效率低，Claude 分析更准确

**解决**：

- 在提示词的硬性约束中已内置：`不启动浏览器，不生成 HTML 评审页面`
- Claude 直接读取测试输出文件和 benchmark.json 分析问题
- 如果 Claude 仍然生成了浏览器页面，检查提示词是否包含硬性约束

### 问题 4: 测试用例不够全面

**现象**：

- 只测试了正常场景
- 边缘情况未覆盖

**解决**：

- 在 `evals/evals.json` 中添加：
  - 边缘输入（空值、超长文本、特殊字符）
  - 错误场景（格式错误、缺失字段）
  - 性能场景（大文件、复杂结构）

### 问题 5: 断言检查不够严格

**现象**：

- 测试通过但实际输出有问题
- 断言只检查存在性，不检查正确性

**解决**：

- 在 `evals/grade.py` 中增强检查：
  - 不仅检查"是否有表格"，还要检查"表格内容是否正确"
  - 不仅检查"是否有 Mermaid"，还要检查"节点数量和连接关系"
  - 使用正则表达式精确匹配

### 问题 6: 版本号忘记更新

**现象**：

- 改进了 SKILL.md 但 package.json 版本号没变

**解决**：

- 在提示词中要求：`同时更新 package.json 版本号`
- 遵循语义化版本：
  - 修复 bug：1.0.0 → 1.0.1
  - 新增功能：1.0.0 → 1.1.0
  - 破坏性变更：1.0.0 → 2.0.0

---

## Skill 管理

所有操作通过 `install.js` 完成，跨平台（macOS / Windows / Linux）。

### 查看所有已安装的 Skill

```bash
node install.js --list
```

输出示例：

```
Installed skills:

  Claude Code (/Users/xxx/.claude/skills):
    - md-format
    - skill-creator
```

### 查看某个 Skill 的安装状态

```bash
node install.js --status
```

输出示例：

```
Skill: md-format

  ✓ Claude Code (/Users/xxx/.claude/skills/md-format)
      SKILL.md
  ✗ Codex (/Users/xxx/.codex/skills/md-format)
```

### 卸载 Skill（从所有 agent 目录删除）

```bash
node install.js --uninstall
```

这会从以下所有目录中删除 skill：

- `~/.claude/skills/` (Claude Code)
- `~/.codex/skills/` (Codex)
- `~/.agents/skills/` (Agents)
- `~/.opencode/skills/` (OpenCode)

### 重新安装（修改 SKILL.md 后）

```bash
node install.js
```

安装时会自动覆盖旧版本。

### 安装到指定 agent

```bash
# 只安装到 Claude Code
node install.js --agent claude

# 安装到所有支持的 agent
node install.js --agent all
```

### 安装别人的 Skill

```bash
# 从 npm 安装
npm install -g someone-elses-skill

# 从 git 仓库安装
git clone https://github.com/xxx/some-skill.git
cd some-skill
node install.js
```

### ⚠️ 常见错误

```bash
# 错误：漏写了 skills 目录
rm -rf ~/.claude/md-format          # ✗ 什么都没删
rm -rf ~/.claude/skills/md-format   # ✓ 正确路径

# 正确做法：用 install.js 管理
node install.js --uninstall          # ✓ 自动清理所有 agent 目录
```

---

## 发布到 npm

### 打包策略：哪些文件该放进 npm 包

npm 包通过 `package.json` 的 `files` 字段控制打包范围。原则：**只包含运行时需要的文件**。

#### 文件分类

| 文件/目录            | npm 打包 | 安装到 agent skills | 原因                         |
| :------------------- | :------: | :-----------------: | :--------------------------- |
| `SKILL.md`           |    ✅    |         ✅          | Skill 核心定义，必须         |
| `install.js`         |    ✅    |         ❌          | 安装脚本，执行完不需要       |
| `package.json`       |    ✅    |         ❌          | npm 元数据                   |
| `agents/openai.yaml` |    ✅    |         ✅          | Codex App 配置，必须         |
| `README.md`          |   自动   |         ❌          | 用户文档                     |
| `LICENSE`            |   自动   |         ❌          | 许可证                       |
| `references/`        |  视情况  |         ✅          | 参考文档，大 skill 需要      |
| `scripts/`           |  视情况  |         ✅          | 可执行脚本，skill 调用的工具 |
| `assets/`            |  视情况  |         ✅          | 模板、图片等资源             |
| `docs/`              |    ❌    |         ❌          | 开发文档                     |
| `evals/`             |    ❌    |         ❌          | 测试数据，仅供开发           |

#### package.json 的 files 字段

```json
// 简单 skill（最小配置）
"files": ["SKILL.md", "install.js", "agents/"]

// 中等 skill（有参考文档）
"files": ["SKILL.md", "install.js", "agents/", "references/"]

// 复杂 skill（有脚本和资源）
"files": ["SKILL.md", "install.js", "agents/", "references/", "scripts/", "assets/"]
```

#### install.js 的复制逻辑

install.js 从 npm 包根目录递归复制所有文件到 agent skills 目录，自动排除：

- 安装脚本和包元数据（install.js、package.json）
- 开发文件（docs/、evals/）
- Git 和编辑器文件（.git、.DS_Store）

你只需要维护 `package.json` 的 `files` 字段（控制 npm 打包），install.js 的排除列表是通用的，不需要改。

#### 用 npm pack 验证

```bash
# 查看实际会打包哪些文件
npm pack --dry-run

# 如果发现多余文件，在 package.json 加 "files" 白名单
# 如果发现缺少文件，在 "files" 中添加
```

### 首次发布

```bash
# 1. 确认 package.json 信息正确
cat package.json
# 检查: name, version, description, author, license, repository

# 2. 确认文件列表正确
npm pack --dry-run
# 这会显示将要打包的文件，确认没有多余文件

# 3. 登录 npm（需要手动操作，会打开浏览器）
npm login
# 输入用户名、密码、邮箱、OTP（如果启用了两步验证）

# 4. 发布
npm publish

# 5. 验证发布成功
npm view my-skill-name
```

### 更新版本并重新发布

```bash
# 1. 更新版本号
# 修复 bug
npm version patch   # 1.0.0 → 1.0.1

# 新增功能
npm version minor   # 1.0.0 → 1.1.0

# 破坏性变更
npm version major   # 1.0.0 → 2.0.0

# 2. 推送 git tag
git push --follow-tags

# 3. 发布新版本
npm publish
```

### 撤回发布

```bash
# 撤回最近版本（72 小时内）
npm unpublish my-skill-name@1.0.1

# 撤回整个包
npm unpublish my-skill-name --force
```

### 发布检查清单

- [ ] `package.json` 的 `name` 在 npm 上没有被占用
- [ ] `version` 比上次发布版本高
- [ ] `files` 字段包含所有运行时文件（`SKILL.md` + `agents/` + `references/` + `scripts/` 等）
- [ ] `files` 字段不包含开发文件（`docs/`、`evals/`）
- [ ] `description` 清晰描述 skill 功能
- [ ] `repository.url` 指向正确的 git 仓库
- [ ] `npm pack --dry-run` 输出干净（无 evals、无 .git）
- [ ] 已 `npm login`
- [ ] `README.md` 包含安装和使用说明
- [ ] 安装后验证：`npx my-skill-name` 或 `node install.js` 能正常安装

---

## 最佳实践

### 1. 测试驱动开发

```
1. 先写测试用例（evals/evals.json）
2. 定义断言（evals/grade.py）
3. 编写 SKILL.md
4. 运行测试
5. 根据结果改进
```

### 2. 小步迭代

```
- 每次只改进 1-2 个问题
- 每次改进都运行完整测试
- 对比前后版本的 benchmark
- 确保改进有效再继续
```

### 3. 保留测试历史

```
evals/
├── iteration-1/  # 初始版本测试
├── iteration-2/  # 第一次改进
├── iteration-3/  # 第二次改进
└── ...

每个 iteration 都保留：
- benchmark.json（量化对比）
- EVALUATION_REPORT.md（问题分析）
- 实际输出文件（可追溯）
```

### 4. 文档同步更新

```
每次改进后更新：
- SKILL.md（skill 定义）
- README.md（使用说明）
- package.json（版本号）
- evals/README.md（测试历史）
```

---

## 完整示例：创建一个 JSON 格式化 Skill

### 1. 创建项目

```bash
mkdir json-format-skill
cd json-format-skill
git init

# 复制基础文件模版（见上文）
```

### 2. 定义需求

```markdown
# JSON 格式化 Skill

## 目标

将任意 JSON 数据格式化为美观、易读的格式

## 触发场景

- "格式化这段 JSON"
- "美化 JSON"
- "JSON pretty print"

## 输入

- 压缩的 JSON 字符串
- 或 JSON 文件路径

## 输出

- 缩进 2 空格
- 键按字母排序
- 数组元素保持原顺序
- 保存到文件或输出到终端

## 示例

1. 格式化 API 响应
2. 格式化配置文件
3. 格式化嵌套深层 JSON
```

### 3. 调用 skill-creator

```
/skill-creator 创建新 skill

需求：将任意 JSON 数据格式化为美观、易读的格式。触发场景："格式化这段 JSON"、"美化 JSON"。输出：缩进2空格，键按字母排序，保存到文件。

环境：Python3 = /usr/local/bin/python3，macOS，不开浏览器，evals 输出到 ./evals/。
自主跑完六阶段闭环，迭代直到通过率 >= 90%。
最后告诉我：版本号、通过率、遗留问题、是否可发布。
```

### 4. 审查和提交

```bash
# 查看生成的文件
cat SKILL.md
cat evals/iteration-1/EVALUATION_REPORT.md

# 测试安装
node install.js

# 提交
git add .
git commit -m "feat: initial version of json-format-skill"
```

---

## 检查清单

### 创建新 Skill 时

- [ ] 项目目录已创建
- [ ] Python 路径已确认
- [ ] 需求文档已准备
- [ ] .gitignore 和 .npmignore 已配置
- [ ] 基础文件已创建（package.json, install.js, agents/openai.yaml）
- [ ] install.js 是通用版（从已有项目复制，零配置）
- [ ] package.json 的 files 包含 `agents/`
- [ ] skill-creator 提示词包含环境信息和硬性约束
- [ ] 测试用例覆盖主要场景
- [ ] 断言检查足够严格
- [ ] 测试报告已审查
- [ ] 版本号已设置
- [ ] README 已编写
- [ ] 已本地安装测试（`node install.js && node install.js --status`）
- [ ] `npm pack --dry-run` 输出干净（无 evals、docs、.git）

### 优化现有 Skill 时

- [ ] 当前版本已备份
- [ ] 优化目标已明确
- [ ] 测试用例已更新（如需要）
- [ ] Python 路径已指定
- [ ] 静默执行已配置
- [ ] 新旧版本已对比
- [ ] benchmark 数据已分析
- [ ] 改进效果已验证
- [ ] 版本号已更新
- [ ] 更新日志已记录
- [ ] 已重新安装（`node install.js`）
- [ ] 已 `npm version patch/minor/major`
- [ ] 已 `npm publish`

---

**版本**: 3.0
**更新日期**: 2026-05-27
**适用于**: Claude Code + skill-creator
