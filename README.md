# md-format

一个 AI 编程助手 Skill，将任何文档/对话内容格式化为结构清晰、视觉精美的 Markdown 文件。

支持 Claude Code、Codex、OpenCode。

## 特性

- 兼容 Typora / GitHub / VS Code 三端渲染
- Mermaid 图表自动带颜色样式（语义化配色）
- 公式用代码块展示，避免 LaTeX 兼容性问题
- 标准化文件结构（元信息表 + 目录 + 分隔线 + 页脚）
- 输出前自检，避免 HTML 标签、LaTeX、CDATA 等污染

## 输出设计原则

### 结构层次

每份输出文件遵循固定的四层结构：

```
元信息表（来源 / 日期 / 适用对象）
    ↓
目录（章节锚点导航）
    ↓
正文章节（内容 + 图表 + 表格）
    ↓
页脚（来源说明 | 日期）
```

元信息表的作用是让读者在读第一行正文之前就知道"这份文件从哪来、给谁看"。页脚呼应元信息，让文件在脱离上下文（比如单独分享）时仍然可溯源。

### 图文并茂的选择逻辑

不是所有内容都需要图表，选择原则如下：

| 内容类型 | 推荐形式 |
|---------|---------|
| 步骤 / 流程 / 因果关系 | Mermaid flowchart |
| 多维度数据对比 | Markdown 表格 |
| 占比 / 构成 | Mermaid pie |
| 分组对比 | Mermaid flowchart + subgraph |
| 复杂趋势 | Mermaid xychart-beta |
| 类比 / 解释 / 警示 | 引用块 `>` |
| 数学表达式 | 代码块（纯文本对齐） |

Mermaid 图表的每个节点必须带颜色样式，配色遵循语义：绿色=成功/正面，红色=失败/风险，蓝色=过程/中性，橙色=警示/注意，紫色=核心/总结。

### 三端兼容的取舍

Typora、GitHub、VS Code 三个渲染器对同一语法的支持差异很大：

- **LaTeX（`$$`、`\frac{}`）**：Typora 支持，GitHub 部分支持，VS Code 原生不支持 → 改用代码块展示公式
- **HTML 标签（`<div>`、`<center>`）**：GitHub 部分支持，Typora 可能显示原始代码 → 全部禁用
- **CDATA 标记**：XML 语法，三端均不渲染 → 禁用

取舍原则：选择三端都能正确渲染的最小公约数语法，而不是某一端的特有功能。

## 触发方式

在支持 skill 的 AI 编程助手中说以下任意一种：

- "格式化md"
- "美化markdown"
- "输出md"
- "整理成md"
- "format md"
- "标准化输出"
- "总结成文档"

## 安装

**推荐：一行命令安装（npx）**

```bash
npx md-format-skill
```

自动检测并安装到 Claude Code、Codex、OpenCode。

**手动安装**

```bash
git clone https://github.com/dave-wind/md-format-skill.git
cd md-format-skill
node install.js
```

**npm 包页面：** https://www.npmjs.com/package/md-format-skill

## 输出示例

skill 会生成如下结构的文件：

```markdown
# 标题

|  |  |
|:---:|:---:|
| **来源** | 具体来源 |
| **日期** | 2026-05-25 |

---

## 目录
- [一、章节名](#一章节名)

---

## 一、章节名

（带颜色的 Mermaid 图表、居中对齐的表格、代码块公式...）

---

*来源 | 日期*
```

## 配色规则

| 语义 | 颜色 |
|------|------|
| 正面/成功/完成 | 绿色系 |
| 负面/失败/风险 | 红色系 |
| 中性/过程/信息 | 蓝色系 |
| 警示/重要/注意 | 橙色系 |
| 核心/总结/关键 | 紫色系 |

## License

MIT
