#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const SKILL_NAME = "md-format";
const SKILL_SOURCE = path.resolve(__dirname);

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
    dirs: [
      path.join(os.homedir(), ".claude", "skills"),
    ],
    commands: ["claude"],
    label: "Claude Code",
  },
  opencode: {
    dirs: [
      path.join(os.homedir(), ".opencode", "skills"),
    ],
    commands: ["opencode"],
    label: "OpenCode",
  },
};

const EXCLUDE_FILES = new Set(["install.js", "package.json", "package-lock.json"]);

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_FILES.has(entry.name)) continue;
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
        execSync(`which ${cmd}`, { stdio: "pipe" });
        return true;
      } catch {}
    }
    for (const dir of cfg.dirs) {
      if (fs.existsSync(path.dirname(dir))) return true;
    }
    return false;
  });
}

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
      console.error(`  ✗ ${cfg.label} install failed (${dest}): ${err.message}`);
    }
  }

  if (!installed) {
    console.error(`  ✗ ${cfg.label}: no writable skill directory found`);
  }
  return installed;
}

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

// --- main ---

const args = process.argv.slice(2);
const helpFlag = args.includes("--help") || args.includes("-h");
const agentFlagIdx = args.indexOf("--agent");
const uninstallFlag = args.includes("--uninstall");

if (helpFlag) {
  console.log(`
md-format — Markdown formatting skill for AI coding agents

Usage:
  npx md-format-skill              Auto-detect and install to all available agents
  npx md-format-skill --agent codex     Install to Codex (CLI + App)
  npx md-format-skill --agent claude    Install to Claude Code
  npx md-format-skill --agent all       Install to all supported agents
  npx md-format-skill --uninstall       Remove from all agents
  npx md-format-skill --help            Show this help

Supported agents: codex, claude, opencode
`);
  process.exit(0);
}

if (uninstallFlag) {
  console.log("\nUninstalling md-format...\n");
  let totalRemoved = 0;
  for (const key of Object.keys(AGENT_CONFIG)) {
    totalRemoved += uninstallFrom(key);
  }
  if (totalRemoved === 0) console.log("  (not installed anywhere)");
  console.log();
  process.exit(0);
}

let targets;
if (agentFlagIdx !== -1 && args[agentFlagIdx + 1]) {
  const agent = args[agentFlagIdx + 1];
  if (agent === "all") {
    targets = Object.keys(AGENT_CONFIG);
  } else {
    targets = [agent];
  }
} else {
  const detected = detectAgents();
  if (detected.length > 0) {
    targets = detected.map(([key]) => key);
  } else {
    targets = Object.keys(AGENT_CONFIG);
  }
}

console.log(`\nInstalling md-format skill...\n`);
let success = 0;
for (const key of targets) {
  if (installTo(key)) success++;
}

if (success === 0) {
  console.error("\nNo agents installed. Install Codex, Claude Code, or OpenCode first.\n");
  process.exit(1);
}

console.log(`\nDone! Start a new session and say "格式化md" or "format md" to activate.\n`);
