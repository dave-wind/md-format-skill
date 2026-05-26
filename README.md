# md-format

一个 Claude Code Skill，将任何文档/对话内容格式化为结构清晰、视觉精美的 Markdown 文件。

## 特性

- 兼容 Typora / GitHub / VS Code 三端渲染
- Mermaid 图表自动带颜色样式（语义化配色）
- 公式用代码块展示，避免 LaTeX 兼容性问题
- 标准化文件结构（元信息表 + 目录 + 分隔线 + 页脚）
- 输出前自检，避免 HTML 标签、LaTeX、CDATA 等污染

## 触发方式

在 Claude Code 中说以下任意一种：

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
mkdir -p ~/.claude/skills/md-format
cp SKILL.md ~/.claude/skills/md-format/
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
| 正面/收入/盈利 | 绿色系 |
| 负面/支出/亏损 | 红色系 |
| 中性/过程/信息 | 蓝色系 |
| 警示/重要 | 橙色系 |
| 核心/总结 | 紫色系 |

## License

MIT
