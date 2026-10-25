#!/usr/bin/env node
/**
 * 管理端「中文残留」静态闸门（英文界面漏翻的回归防线）。
 *
 * 背景：`pnpm check:locale` 只能校验 `$t('键')` 是否存在、语言包键集是否一致，
 * **查不到"根本没走 `$t`、直接写死中文"的文案** —— 那类问题只有切到英文界面
 * 才会暴露（E15 / N227 / 第 25~31 批反复踩）。本脚本补这一环：
 *
 * 规则：
 *   1. 只扫 `.vue` / `.ts`，跳过 `locales/`、`generated/`、`__tests__/`、
 *      `*.test.ts`、`*.d.ts`、`node_modules`、`dist`；
 *   2. 先剥注释（`/* *\/`、`//`、`<!-- -->`）与 `console.*` 行 —— 注释里的中文
 *      是给维护者看的，不是界面文案；
 *   3. 剩余行出现 CJK 即命中；行内含 `i18n-ignore` 视为显式豁免
 *      （服务端枚举值、正则分隔符、微信文档示例占位等非展示文案必须中文）；
 *   4. 命中即退出码 1，并打印「文件:行:片段」，可直接照单补 `$t`。
 *
 * 用法：
 *   node scripts/check-cjk-residue.mjs                 # 汇总（默认 apps/web-ele/src）
 *   node scripts/check-cjk-residue.mjs --all           # 打印全部命中行
 *   node scripts/check-cjk-residue.mjs --dirs packages/effects/common-ui/src
 *
 * 边界（不是漏翻，勿加进扫描范围）：
 *   - 菜单/面包屑标题来自后端 `sys_menu.title`（DB 中文），E15 已决议不做菜单多语言；
 *   - 语言自称（`简体中文`）、ICP 备案号、`simple-locale` 双语字典、SVG 图层 id、
 *     后端中文错误文本匹配 —— 均非界面文案。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEFAULT_DIRS = ['apps/web-ele/src'];
const SKIP_DIRS = new Set([
  '__tests__',
  'dist',
  'generated',
  'locales',
  'node_modules',
]);
const EXTS = new Set(['.ts', '.vue']);
const CJK = /[\u4E00-\u9FFF]/;
const IGNORE_MARK = 'i18n-ignore';

const args = process.argv.slice(2);
const showAll = args.includes('--all');
const dirsIdx = args.indexOf('--dirs');
const scanDirs =
  dirsIdx !== -1 && args[dirsIdx + 1]
    ? args[dirsIdx + 1].split(',').map((d) => d.trim())
    : DEFAULT_DIRS;

/** 把注释替换成等量换行，保证行号不漂移 */
function blankLines(match) {
  return '\n'.repeat((match.match(/\n/g) || []).length);
}

function stripComments(text, isVue) {
  let out = text.replaceAll(/\/\*[\s\S]*?\*\//g, blankLines);
  // `://` 是 URL，不是注释
  out = out.replaceAll(/(?<!:)\/\/[^\n]*/g, '');
  if (isVue) {
    out = out.replaceAll(/<!--[\s\S]*?-->/g, blankLines);
  }
  return out;
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out);
      continue;
    }
    if (!EXTS.has(path.extname(entry.name))) continue;
    if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.d.ts'))
      continue;
    out.push(full);
  }
}

function scanFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const isVue = file.endsWith('.vue');
  const codeLines = stripComments(raw, isVue).split('\n');
  const rawLines = raw.split('\n');
  const hits = [];
  for (const [i, line] of codeLines.entries()) {
    if (!CJK.test(line)) continue;
    if (line.trimStart().startsWith('console.')) continue;
    if ((rawLines[i] || '').includes(IGNORE_MARK)) continue;
    hits.push({
      line: i + 1,
      text: (rawLines[i] || '').trim().slice(0, 120),
    });
  }
  return hits;
}

const files = [];
for (const dir of scanDirs) walk(path.resolve(ROOT, dir), files);

const results = [];
for (const file of files) {
  const hits = scanFile(file);
  if (hits.length > 0) {
    results.push({
      file: path.relative(ROOT, file).replaceAll('\\', '/'),
      hits,
    });
  }
}
results.sort((a, b) => b.hits.length - a.hits.length);

const total = results.reduce((sum, r) => sum + r.hits.length, 0);
console.log(
  `[check-cjk-residue] 扫描 ${files.length} 文件（${scanDirs.join(', ')}）｜中文残留 ${total} 行 / ${results.length} 文件`,
);

if (total === 0) {
  console.log(
    '✅ 无非注释中文残留（界面文案应全部走 $t；服务端枚举等请加 i18n-ignore）',
  );
  process.exit(0);
}

for (const { file, hits } of results.slice(0, showAll ? results.length : 30)) {
  console.log(`\n  ${file}  (${hits.length})`);
  for (const hit of showAll ? hits : hits.slice(0, 5)) {
    console.log(`    ${hit.line}: ${hit.text}`);
  }
}

console.log(
  '\n修复：改走 $t（键放进 zh-CN / en-US 语言包）；确属非展示文案，在该行加 `// i18n-ignore 原因`。',
);
process.exit(1);
