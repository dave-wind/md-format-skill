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

# 创建评估目录
mkdir -p evals
```

### 3. 基础文件模版

#### `.gitignore`
```
.DS_Store
node_modules/

# Evaluation outputs
evals/iteration-*/
evals/*.log
evals/feedback.json
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
  "files": [
    "SKILL.md",
    "install.js"
  ],
  "keywords": [
    "skill",
    "claude-code",
    "ai-agent"
  ],
  "author": "your-name",
  "license": "MIT"
}
```

#### `install.js`
```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const skillsDir = path.join(os.homedir(), '.claude', 'skills');
const skillName = 'my-skill-name';
const targetDir = path.join(skillsDir, skillName);

if (!fs.existsSync(skillsDir)) {
  fs.mkdirSync(skillsDir, { recursive: true });
}

if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true });
}

fs.mkdirSync(targetDir, { recursive: true });

const skillFile = path.join(__dirname, 'SKILL.md');
fs.copyFileSync(skillFile, path.join(targetDir, 'SKILL.md'));

console.log(`✓ Skill installed to ${targetDir}`);
```

---

## 模版 1: 创建新 Skill

### 步骤 1: 定义 Skill 需求

在项目根目录创建 `REQUIREMENTS.md`：

```markdown
# Skill 需求文档

## 目标
[描述这个 skill 要解决什么问题]

## 触发场景
[用户说什么话时应该触发这个 skill]

## 输入
[skill 需要什么输入]

## 输出
[skill 应该产生什么输出]

## 示例
[3-5 个真实使用场景]
```

### 步骤 2: 调用 skill-creator（静默模式）

```bash
# 在项目根目录执行
claude
```

然后输入以下提示词：

```
/skill-creator 创建新 skill

需求：
[粘贴 REQUIREMENTS.md 内容]

配置要求：
1. Python 路径：/usr/local/bin/python3  # 替换为你的实际路径
2. 评估目录：./evals/  # 项目根目录下
3. 测试模式：静默执行，不开浏览器
4. 测试用例：设计 3-5 个覆盖不同场景的测试
5. 评估方式：
   - 编写自动化断言（evals/grade.py）
   - 运行 with_skill vs without_skill 对比
   - 生成 benchmark.json 和文字报告
   - 不启动浏览器，直接分析测试数据
   - 基于量化结果和输出文件内容发现问题

输出要求：
- SKILL.md：完整的 skill 定义
- evals/evals.json：测试用例
- evals/grade.py：自动化评分脚本
- evals/iteration-1/：测试输出和报告
- 直接告诉我发现的问题和改进建议
```

### 步骤 3: 审查生成的 Skill

```bash
# 查看生成的文件
ls -la
cat SKILL.md
cat evals/evals.json

# 查看测试报告
cat evals/iteration-1/EVALUATION_REPORT.md
cat evals/iteration-1/benchmark.json
```

### 步骤 4: 迭代改进

如果测试发现问题，继续对话：

```
基于测试结果，请改进 SKILL.md 并运行 iteration-2 验证：

发现的问题：
[列出问题]

改进方向：
[你的想法]

配置：
- Python: /usr/local/bin/python3
- 输出目录: ./evals/iteration-2/
- 静默执行，不开浏览器
```

### 步骤 5: 提交版本

```bash
# 暂存核心文件
git add SKILL.md package.json install.js README.md LICENSE .gitignore
git add evals/evals.json evals/grade.py evals/README.md

# 提交
git commit -m "feat: initial version of my-skill-name"

# 测试安装
npm link
# 或
node install.js
```

---

## 模版 2: 优化现有 Skill

### 步骤 1: 准备优化需求

创建 `OPTIMIZATION.md`：

```markdown
# 优化需求

## 当前问题
[描述现有 skill 的问题]

## 优化目标
[希望达到什么效果]

## 测试场景
[需要验证的场景]
```

### 步骤 2: 调用 skill-creator（优化模式）

```bash
claude
```

输入提示词：

```
/skill-creator 优化现有 skill

Skill 路径：./  # 当前项目根目录

优化需求：
[粘贴 OPTIMIZATION.md 内容]

配置要求：
1. Python 路径：/usr/local/bin/python3  # 替换为实际路径
2. 评估目录：./evals/
3. 对比基准：
   - baseline: 当前版本（先备份到 evals/skill-snapshot/）
   - with_skill: 改进后的版本
4. 测试模式：静默执行，不开浏览器
5. 测试用例：
   - 使用现有的 evals/evals.json
   - 或设计新的测试用例覆盖问题场景
6. 评估方式：
   - 运行自动化断言
   - 对比新旧版本的 pass rate、time、tokens
   - 分析具体输出文件找出差异
   - 不启动浏览器，直接给出分析结论

输出要求：
- 改进后的 SKILL.md
- evals/iteration-N/：新的测试结果
- 对比报告：新版 vs 旧版的改进点
- 直接告诉我是否达到优化目标
```

### 步骤 3: 审查改进效果

```bash
# 查看改进内容
git diff SKILL.md

# 查看测试对比
cat evals/iteration-N/EVALUATION_REPORT.md

# 查看 benchmark 对比
cat evals/iteration-N/benchmark.json | grep -A 5 "delta"
```

### 步骤 4: 决定是否采纳

```bash
# 如果改进有效，提交
git add SKILL.md package.json
git commit -m "fix: improve [具体改进内容]"

# 如果改进不理想，继续迭代
# 回到步骤 2，调整优化方向
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

### 问题 2: 评估目录不在项目内

**现象**：
- 测试输出在 `/Users/xxx/skill-workspace/` 外部目录
- 无法纳入 git 管理

**解决**：
- 在提示词中明确指定：`评估目录：./evals/`
- 确保 skill-creator 在项目根目录创建 `evals/iteration-N/`

### 问题 3: 浏览器自动打开浪费 token

**现象**：
- 生成 HTML 评审页面并打开浏览器
- 人工审查效率低，Claude 分析更准确

**解决**：
- 在提示词中明确：`静默执行，不开浏览器`
- 让 Claude 直接读取测试输出文件和 benchmark.json 分析

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

### 查看已安装的 Skill

```bash
# 列出所有已安装的 skill
ls ~/.claude/skills/

# 查看某个 skill 的内容
cat ~/.claude/skills/my-skill-name/SKILL.md
```

### 删除已安装的 Skill

```bash
# 删除单个 skill
rm -rf ~/.claude/skills/my-skill-name

# 验证已删除
ls ~/.claude/skills/ | grep my-skill-name
```

### 重新安装 Skill

修改了 SKILL.md 后，需要重新安装才能生效：

```bash
# 方式 1: 用项目的 install.js
node install.js

# 方式 2: 用 npm link（如果 package.json 配置了 bin）
npm link

# 方式 3: 手动复制
cp SKILL.md ~/.claude/skills/my-skill-name/SKILL.md
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

---

## 发布到 npm

### 打包策略：哪些文件该放进 npm 包

npm 包通过 `package.json` 的 `files` 字段控制打包范围。原则：**只包含运行时需要的文件**。

#### 文件分类

| 文件/目录 | npm 打包 | 安装到 ~/.claude/skills | 原因 |
|:--|:--:|:--:|:--|
| `SKILL.md` | ✅ | ✅ | Skill 核心定义，必须 |
| `install.js` | ✅ | ❌ | 安装脚本，执行完不需要 |
| `package.json` | ✅ | ❌ | npm 元数据 |
| `README.md` | 自动 | ❌ | 用户文档 |
| `LICENSE` | 自动 | ❌ | 许可证 |
| `references/` | 视情况 | ✅ | 参考文档，大 skill 需要 |
| `scripts/` | 视情况 | ✅ | 可执行脚本，skill 调用的工具 |
| `assets/` | 视情况 | ✅ | 模板、图片等资源 |
| `evals/` | ❌ | ❌ | 测试数据，仅供开发 |
| `SKILL_DEVELOPMENT_WORKFLOW.md` | ❌ | ❌ | 开发文档 |

#### package.json 的 files 字段

```json
// 简单 skill（只有 SKILL.md）
"files": ["SKILL.md", "install.js"]

// 中等 skill（有参考文档）
"files": ["SKILL.md", "install.js", "references/"]

// 复杂 skill（有脚本和资源）
"files": ["SKILL.md", "install.js", "references/", "scripts/", "assets/"]
```

#### install.js 的复制逻辑

当前 install.js 用 `copyRecursive` 从 npm 包根目录递归复制所有文件到 `~/.claude/skills/`，排除 `install.js`、`package.json`、`package-lock.json`。这意味着：

- `files` 字段控制什么进入 npm 包
- install.js 自动复制 npm 包里除排除列表外的所有内容
- **你只需要维护 `files` 字段**，install.js 不需要改

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
- [ ] `files` 字段包含所有运行时文件（`SKILL.md` + `references/` + `scripts/` 等）
- [ ] `files` 字段不包含开发文件（`evals/`、`SKILL_DEVELOPMENT_WORKFLOW.md`）
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

需求：[粘贴上述需求]

配置：
- Python: /usr/local/bin/python3
- 评估目录: ./evals/
- 静默执行，不开浏览器
- 测试用例：3 个（简单对象、嵌套数组、深层嵌套）
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
- [ ] .gitignore 已配置
- [ ] 基础文件已创建（package.json, install.js）
- [ ] skill-creator 提示词包含所有配置
- [ ] 测试用例覆盖主要场景
- [ ] 断言检查足够严格
- [ ] 测试报告已审查
- [ ] 版本号已设置
- [ ] README 已编写
- [ ] 已本地安装测试（`node install.js`）
- [ ] `npm pack --dry-run` 输出干净

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

## 附录：提示词模版速查

### 创建新 Skill（复制粘贴）

```
/skill-creator 创建新 skill

需求：
[粘贴需求文档]

配置要求：
1. Python 路径：/usr/local/bin/python3
2. 评估目录：./evals/
3. 测试模式：静默执行，不开浏览器
4. 测试用例：3-5 个覆盖不同场景
5. 评估方式：自动化断言 + benchmark 对比，直接分析数据

输出要求：
- SKILL.md
- evals/evals.json
- evals/grade.py
- evals/iteration-1/
- 直接告诉我发现的问题
```

### 优化现有 Skill（复制粘贴）

```
/skill-creator 优化现有 skill

Skill 路径：./

优化需求：
[描述问题和目标]

配置要求：
1. Python 路径：/usr/local/bin/python3
2. 评估目录：./evals/
3. 对比基准：当前版本（先备份）
4. 测试模式：静默执行，不开浏览器
5. 评估方式：新旧版本对比，直接分析差异

输出要求：
- 改进后的 SKILL.md
- evals/iteration-N/
- 对比报告
- 是否达到优化目标
```

---

**版本**: 1.1
**更新日期**: 2026-05-27
**适用于**: Claude Code + skill-creator
