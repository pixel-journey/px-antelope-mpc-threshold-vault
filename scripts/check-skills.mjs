#!/usr/bin/env node
/**
 * Tier-2 Px skills linter (zero dependency).
 * Tier-1 remains skills-ref / agentskills validate in CI.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SKILLS = join(ROOT, "skills");
const ALLOWED_FM = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);
const MAX_LINES = 500;
const MAX_CHARS = 20_000; // ~5k tokens rough upper bound
const SECRET_RE =
  /\bPVT_K1_|\bPVT_R1_|\b5[HJK][1-9A-HJ-NP-Za-km-z]{50,}|\b(sk|api)_live_[A-Za-z0-9]+|BEGIN (RSA |EC )?PRIVATE KEY/i;

let failed = false;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

function listSkillDirs() {
  return readdirSync(SKILLS)
    .map((name) => join(SKILLS, name))
    .filter((p) => statSync(p).isDirectory());
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
    return { error: "must start at byte 0 with ---" };
  }
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { error: "missing closing ---" };
  const block = text.slice(4, end);
  const keys = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = /^([A-Za-z0-9_-]+)\s*:/.exec(line);
    if (m) keys.push(m[1]);
  }
  return { keys, bodyStart: end + 4 };
}

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

for (const dir of listSkillDirs()) {
  const skillMd = join(dir, "SKILL.md");
  if (!existsSync(skillMd)) {
    fail(`${relative(ROOT, dir)} missing SKILL.md`);
    continue;
  }
  const text = readFileSync(skillMd, "utf8");
  const fm = parseFrontmatter(text);
  if (fm.error) fail(`${relative(ROOT, skillMd)}: ${fm.error}`);
  else {
    for (const k of fm.keys) {
      if (!ALLOWED_FM.has(k)) fail(`${relative(ROOT, skillMd)}: unknown frontmatter key "${k}"`);
    }
  }
  const lines = text.split(/\r?\n/).length;
  if (lines > MAX_LINES) fail(`${relative(ROOT, skillMd)}: ${lines} lines > ${MAX_LINES}`);
  if (text.length > MAX_CHARS) fail(`${relative(ROOT, skillMd)}: body too large`);

  const refs = join(dir, "references");
  if (existsSync(refs) && statSync(refs).isDirectory()) {
    for (const f of walkFiles(refs)) {
      const rel = relative(refs, f);
      if (rel.split(/[\\/]/).length > 1) {
        fail(`${relative(ROOT, f)}: references must be 1 level deep`);
      }
    }
  }

  for (const f of walkFiles(dir)) {
    const content = readFileSync(f, "utf8");
    if (SECRET_RE.test(content)) fail(`${relative(ROOT, f)}: possible private key / secret pattern`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(`OK: checked ${listSkillDirs().length} skill(s)`);
