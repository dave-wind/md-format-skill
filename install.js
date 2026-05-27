#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

// ── 配置 ────────────────────────────────────────────────
// 自动从 SKILL.md frontmatter 读取 name，无需手动配置

const SKILL_SOURCE = path.resolve(__dirname);

function readSkillName() {
  const skillPath = path.join(SKILL_SOURCE, "SKILL.md");
  const content = fs.readFileSync(skillPath, "utf-8");
  const match = content.match(/^name:\s*(.+)$/m);
  if (!match) {
    console.error("Error: 'name' not found in SKILL.md frontmatter");
    process.exit(1);
  }
  return match[1].trim();
}

const SKILL_NAME = readSkillName();

// agent 安装目录（跨平台）
const AGENT_CONFIG = {
  codex: {
    dirs: [
      path.join(os.homedir(), ".agents", "skills"),
      path.join(os.homedir(), ".codex", "skills"),
    ],
    commands: ["codex"],
    label: "Codex",
  },
  claude: {
    dirs: [path.join(os.homedir(), ".claude", "skills")],
    commands: ["claude"],
    label: "Claude Code",
  },
  opencode: {
    dirs: [path.join(os.homedir(), ".opencode", "skills")],
    commands: ["opencode"],
    label: "OpenCode",
  },
};

// ── 约定：排除规则 ──────────────────────────────────────
// 以下目录/文件不会复制到 agent skills 目录
//
//   排除原因              | 约定位置
//   ──────────────────── | ──────────────────────
//   安装脚本和包元数据     | 根目录 install.js / package.json
//   开发文档              | docs/
//   测试数据和评分脚本     | evals/
//   Git / 编辑器 / 依赖   | .git / .DS_Store / node_modules
//   npm 打包配置          | .npmignore

const EXCLUDE = new Set([
  // 安装脚本和包元数据
  "install.js",
  "package.json",
  "package-lock.json",
  // 开发文档（所有 MD 都放 docs/）
  "docs",
  // 测试数据
  "evals",
  // Git / 编辑器 / 依赖
  ".git",
  ".DS_Store",
  ".gitignore",
  "node_modules",
  // npm 打包配置
  ".npmignore",
]);

// ── 工具函数 ────────────────────────────────────────────

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function detectAgents() {
  return Object.entries(AGENT_CONFIG).filter(([, cfg]) => {
    for (const cmd of cfg.commands) {
      try {
        execSync(`which ${cmd} 2>/dev/null || where ${cmd} 2>/dev/null`, {
          stdio: "pipe",
        });
        return true;
      } catch {}
    }
    for (const dir of cfg.dirs) {
      if (fs.existsSync(path.dirname(dir))) return true;
    }
    return false;
  });
}

// ── 命令: install ───────────────────────────────────────

function installTo(agentKey) {
  const cfg = AGENT_CONFIG[agentKey];
  if (!cfg) {
    console.error(`  Unknown agent: ${agentKey}`);
    return false;
  }

  let installed = false;
  for (const dir of cfg.dirs) {
    const dest = path.join(dir, SKILL_NAME);
    try {
      copyRecursive(SKILL_SOURCE, dest);
      console.log(`  ✓ ${cfg.label} → ${dest}`);
      installed = true;
    } catch (err) {
      console.error(
        `  ✗ ${cfg.label} install failed (${dest}): ${err.message}`
      );
    }
  }

  if (!installed) {
    console.error(`  ✗ ${cfg.label}: no writable skill directory found`);
  }
  return installed;
}

// ── 命令: uninstall ─────────────────────────────────────

function uninstallFrom(agentKey) {
  const cfg = AGENT_CONFIG[agentKey];
  if (!cfg) return 0;

  let removed = 0;
  for (const dir of cfg.dirs) {
    const dest = path.join(dir, SKILL_NAME);
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
      console.log(`  ✓ Removed from ${cfg.label} (${dest})`);
      removed++;
    }
  }
  return removed;
}

// ── 命令: list ──────────────────────────────────────────

function listSkills() {
  console.log("\nInstalled skills:\n");
  let found = false;

  for (const [, cfg] of Object.entries(AGENT_CONFIG)) {
    for (const dir of cfg.dirs) {
      if (!fs.existsSync(dir)) continue;
      const skills = fs
        .readdirSync(dir)
        .filter((name) => fs.statSync(path.join(dir, name)).isDirectory());
      if (skills.length > 0) {
        console.log(`  ${cfg.label} (${dir}):`);
        for (const s of skills) {
          console.log(`    - ${s}`);
        }
        found = true;
      }
    }
  }

  if (!found) {
    console.log("  (no skills installed)");
  }
  console.log();
}

// ── 命令: status ────────────────────────────────────────

function showStatus() {
  console.log(`\nSkill: ${SKILL_NAME}\n`);
  let installed = 0;

  for (const [, cfg] of Object.entries(AGENT_CONFIG)) {
    for (const dir of cfg.dirs) {
      const dest = path.join(dir, SKILL_NAME);
      if (fs.existsSync(dest)) {
        const files = fs.readdirSync(dest);
        console.log(`  ✓ ${cfg.label} (${dest})`);
        for (const f of files) {
          console.log(`      ${f}`);
        }
        installed++;
      } else {
        console.log(`  ✗ ${cfg.label} (${dest})`);
      }
    }
  }

  if (installed === 0) {
    console.log("\n  Not installed anywhere. Run: node install.js");
  }
  console.log();
}

// ── 主入口 ──────────────────────────────────────────────

const args = process.argv.slice(2);
const helpFlag = args.includes("--help") || args.includes("-h");
const agentFlagIdx = args.indexOf("--agent");
const uninstallFlag = args.includes("--uninstall");
const listFlag = args.includes("--list") || args.includes("-l");
const statusFlag = args.includes("--status") || args.includes("-s");

function readSkillDescription() {
  const skillPath = path.join(SKILL_SOURCE, "SKILL.md");
  if (!fs.existsSync(skillPath)) return "";
  const content = fs.readFileSync(skillPath, "utf-8");
  const match = content.match(/^description:\s*(.+)$/m);
  return match ? match[1].trim() : "";
}

const SKILL_DESCRIPTION = readSkillDescription();

if (helpFlag) {
  const agentList = Object.entries(AGENT_CONFIG)
    .map(([, cfg]) => cfg.label)
    .join(", ");
  console.log(`
${SKILL_NAME} — ${SKILL_DESCRIPTION}

Usage:
  node install.js                   Auto-detect and install
  node install.js --agent claude    Install to Claude Code only
  node install.js --agent all       Install to all agents
  node install.js --uninstall       Remove from all agents
  node install.js --list            List all installed skills
  node install.js --status          Show install status
  node install.js --help            Show this help

Supported agents: ${agentList}
`);
  process.exit(0);
}

if (listFlag) {
  listSkills();
  process.exit(0);
}

if (statusFlag) {
  showStatus();
  process.exit(0);
}

if (uninstallFlag) {
  console.log(`\nUninstalling ${SKILL_NAME}...\n`);
  let totalRemoved = 0;
  for (const key of Object.keys(AGENT_CONFIG)) {
    totalRemoved += uninstallFrom(key);
  }
  if (totalRemoved === 0) console.log("  (not installed anywhere)");
  console.log();
  process.exit(0);
}

// install (default)
let targets;
if (agentFlagIdx !== -1 && args[agentFlagIdx + 1]) {
  const agent = args[agentFlagIdx + 1];
  targets = agent === "all" ? Object.keys(AGENT_CONFIG) : [agent];
} else {
  const detected = detectAgents();
  targets =
    detected.length > 0
      ? detected.map(([key]) => key)
      : Object.keys(AGENT_CONFIG);
}

console.log(`\nInstalling ${SKILL_NAME} skill...\n`);
let success = 0;
for (const key of targets) {
  if (installTo(key)) success++;
}

if (success === 0) {
  console.error(
    `\nNo agents installed. Install ${Object.values(AGENT_CONFIG).map(c => c.label).join(", ")} first.\n`
  );
  process.exit(1);
}

function getTriggerHints() {
  const skillPath = path.join(SKILL_SOURCE, "SKILL.md");
  if (!fs.existsSync(skillPath)) return "";
  const content = fs.readFileSync(skillPath, "utf-8");
  const triggers = [];
  const re = /["""]([^"""]+)["""]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    triggers.push(match[1]);
  }
  // 只取前 2 个作为示例
  if (triggers.length === 0) return "";
  if (triggers.length === 1) return `"${triggers[0]}"`;
  return `"${triggers[0]}" or "${triggers[1]}"`;
}

const hints = getTriggerHints();
const triggerMsg = hints ? ` Say ${hints} to activate.` : "";

console.log(`\nDone!${triggerMsg}\n`);
