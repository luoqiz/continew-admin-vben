#!/usr/bin/env node
/**
 * 语言包一致性校验（N144 余项 Review 第三轮产出，2026-10-17 扩至四条规则）。
 *
 * 背景：vue-i18n 在缺失键时**返回键名**而非空串，页面会直接把 `activity.order.registrationId`
 * 这类键名显示给用户；而 `$t(key) || '中文'` 的兜底写法因此**永不生效**（键名是 truthy），
 * 制造了"已有兜底"的假象。静态校验是发现此类问题的唯一可靠手段。
 *
 * 四条规则（任一失败 ⇒ 退出码 1，已接入 `pnpm gate` / `pnpm check`）：
 *   0. **引用键存在**：`$t('literal')` 的键必须存在于基准语言包；
 *   1. **多语言键集一致**：以 zh-CN 为基准，其余**已注册语言**（解析 `SupportedLanguages`）
 *      必须键集完全相同 —— 缺则英文界面露键名，多则残留无人使用的死文案；
 *   2. **禁止兜底写法**：`$t(..) || '...'` 一律报错（该兜底永不生效，且会掩盖真缺键）；
 *   3. **业务码文案齐全**：`domain-error-codes.ts` 清单里的每个错误码，在**所有注册语言**的
 *      `ui.fallback.domain.<码点转下划线小写>` 都必须有文案；反向也检查语言包里不存在
 *      清单之外的孤儿文案，保证"码清单 ↔ 语言包"单一事实源。
 *   4. **空值一致性**（2026-10-17 新增）：同一键在任一语言为空、而基准语言非空时一律报错。
 *      规则 0/1 只看键是否存在，`"configId": ""` 这类**空翻译**能通过全部旧规则，
 *      而 vue-i18n 对空串返回空串 ⇒ 表格列头直接空白（真实事故：`system.smsLog.*` 8 个键）。
 *      两侧都留空（如隐藏的 id 列）视为有意为之，不报错。
 *   5. **动态键引用存在**（2026-10-18 新增）：`labelKey` / `tipKey` 字面量字段的值必须是
 *      已存在的键。列头/页签/指标卡把键存进常量再 `$t(t.labelKey)` 时，规则 0 的正则完全
 *      扫不到 ⇒ 改键名或漏补语言包都静默通过，页面直接把键名渲出来。
 *
 * 校验范围：
 *   - 语言包键：核心 `packages/locales/src/langs/<lang>/*.json` + app 层
 *     `apps/web-ele/src/locales/langs/<lang>/*.json`（命名空间 = 文件名，与
 *     `loadLocalesMapFromDir` 的映射规则一致）
 *   - 调用点：`apps/web-ele/src` 与 `packages` 下所有 `$t('literal')`
 *   - 例外：`@vben-core/composables` 的 simple locale（扁平键，独立消息表），
 *     其白名单从源码解析，避免硬编码漂移
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REFERENCE_LANG = 'zh-CN';
const CORE_LANG_ROOT = 'packages/locales/src/langs';
const APP_LANG_ROOT = 'apps/web-ele/src/locales/langs';
const LANG_TYPINGS_FILE = 'packages/@core/base/typings/src/languages.ts';
const DOMAIN_CODES_FILE =
  'packages/effects/request/src/request-client/domain-error-codes.ts';
const DOMAIN_KEY_PREFIX = 'ui.fallback.domain.';
const SCAN_DIRS = ['apps/web-ele/src', 'packages'];
const IGNORE_DIRS = new Set(['.turbo', 'coverage', 'dist', 'node_modules']);
const SCAN_EXTS = new Set(['.ts', '.tsx', '.vue']);
const SIMPLE_LOCALE_FILE =
  'packages/@core/composables/src/use-simple-locale/messages.ts';
/**
 * 匹配 `$t('a.b')` / `$t("a.b")`；动态拼接（模板字符串/变量）无法静态校验，自动跳过。
 *
 * 覆盖边界（2026-10-16 核验）：全仓 `i18n.global.t(` 为 0 处、`useI18n()` 仅 2 处且只取
 * `locale`：`$t(` 是当前唯一的取文案形式，故覆盖面完整。若将来引入
 * `i18n.global.t('key')` 或 `const { t } = useI18n()`，需同步扩宽此正则。
 */
const T_CALL_RE = /\$t\(\s*(['"])([^'"]+)\1/g;
/**
 * 规则 5：把文案键存进常量、渲染时 `$t(t.labelKey)` 的写法（列头/页签/指标卡）。
 *
 * 这类键**永远进不了规则 0**（正则只认 `$t('字面量')`）⇒ 改键名、漏补语言包都不会报错，
 * 页面直接把键名渲出来。2026-10-18 把 62 处硬编码列头改成这种形态后补的守卫。
 * 只收 `labelKey` / `tipKey`：`titleKey` / `hintKey` 目前是函数形参名（值由调用方传），
 * 不是对象字面量字段，纳入会误报。
 */
const DYNAMIC_KEY_RE = /\b(?:labelKey|tipKey)\s*:\s*(['"])([\w.-]+)\1/g;
/** 规则 2：`$t('key') || '中文'`（vue-i18n 缺键返回键名，兜底永不生效）。 */
const T_FALLBACK_RE = /\$t\(\s*(['"])[^'"]+\1\s*\)\s*\|\|/;
/** 规则 3：错误码清单里的字面量（点分大写下划线）。 */
const DOMAIN_CODE_RE =
  /^\s*'((?:ACTIVITY|NOTIFY|WECHAT|COMMON|AUTH|MEMBER|SENSITIVE_WORD)\.[A-Z0-9_.]+)',?\s*$/gm;

function walkFiles(dir, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walkFiles(rel, out);
    } else if (SCAN_EXTS.has(path.extname(entry.name))) {
      out.push(rel);
    }
  }
  return out;
}

/** 读取目录下所有 json，按「文件名 = 命名空间」展开键路径。 */
function loadNamespaceKeys(dir) {
  const keys = new Set();
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return { keys, files: 0 };
  const files = fs.readdirSync(abs).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const ns = file.slice(0, -'.json'.length);
    const data = JSON.parse(fs.readFileSync(path.join(abs, file), 'utf8'));
    const walk = (node, prefix) => {
      if (node && typeof node === 'object' && !Array.isArray(node)) {
        for (const [k, v] of Object.entries(node)) {
          walk(v, prefix ? `${prefix}.${k}` : k);
        }
      } else {
        keys.add(`${ns}.${prefix}`);
      }
    };
    walk(data, '');
  }
  return { keys, files: files.length };
}

/** 某语言的全部键（核心包 + app 层同名合并）。 */
function collectLocaleKeys(lang) {
  const core = loadNamespaceKeys(path.posix.join(CORE_LANG_ROOT, lang));
  const app = loadNamespaceKeys(path.posix.join(APP_LANG_ROOT, lang));
  return {
    keys: new Set([...core.keys, ...app.keys]),
    files: core.files + app.files,
  };
}

/** 某语言的全部「键 → 文案」（规则 4 用；空值必须能被看见，不能只比键集）。 */
function collectLocaleValues(lang) {
  const values = new Map();
  const dirs = [
    path.posix.join(CORE_LANG_ROOT, lang),
    path.posix.join(APP_LANG_ROOT, lang),
  ];
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    const files = fs.readdirSync(abs).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const ns = file.slice(0, -'.json'.length);
      const data = JSON.parse(fs.readFileSync(path.join(abs, file), 'utf8'));
      const walk = (node, prefix) => {
        if (node && typeof node === 'object' && !Array.isArray(node)) {
          for (const [k, v] of Object.entries(node)) {
            walk(v, prefix ? `${prefix}.${k}` : k);
          }
        } else {
          values.set(
            `${ns}.${prefix}`,
            node === null || node === undefined ? '' : String(node),
          );
        }
      };
      walk(data, '');
    }
  }
  return values;
}

/** 已注册语言：解析 `SupportedLanguages` 接口的键（新增语言时脚本自动跟随）。 */
function loadRegisteredLanguages() {
  const abs = path.join(ROOT, LANG_TYPINGS_FILE);
  if (!fs.existsSync(abs)) {
    console.error(`❌ 找不到语言注册表：${LANG_TYPINGS_FILE}`);
    process.exit(1);
  }
  const src = fs.readFileSync(abs, 'utf8');
  const block = src.match(
    /export interface SupportedLanguages \{([\s\S]*?)\n\}/,
  );
  const langs = [...(block?.[1] ?? '').matchAll(/^\s*'([\w-]+)'\s*:/gm)].map(
    (m) => m[1],
  );
  if (!langs.includes(REFERENCE_LANG)) {
    console.error(`❌ 语言注册表未包含基准语言 ${REFERENCE_LANG}`);
    process.exit(1);
  }
  return langs;
}

/** simple locale 白名单：从 `use-simple-locale/messages.ts` 的 zh-CN 块解析。 */
function loadSimpleLocaleKeys() {
  const abs = path.join(ROOT, SIMPLE_LOCALE_FILE);
  const keys = new Set();
  if (!fs.existsSync(abs)) return keys;
  const src = fs.readFileSync(abs, 'utf8');
  const block = src.match(/'zh-CN':\s*\{([\s\S]*?)\n\s*\},/);
  if (!block) return keys;
  for (const m of block[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)) {
    keys.add(m[1]);
  }
  return keys;
}

/** 规则 3 的数据源：错误码清单（只登记码，文案在语言包）。 */
function loadDomainCodes() {
  const abs = path.join(ROOT, DOMAIN_CODES_FILE);
  if (!fs.existsSync(abs)) return [];
  return [...fs.readFileSync(abs, 'utf8').matchAll(DOMAIN_CODE_RE)].map(
    (m) => m[1],
  );
}

const toDomainKey = (code) =>
  `${DOMAIN_KEY_PREFIX}${code.replaceAll('.', '_').toLowerCase()}`;

// ---------------------------------------------------------------- 准备数据
const languages = loadRegisteredLanguages();
const keysByLang = new Map(
  languages.map((lang) => [lang, collectLocaleKeys(lang)]),
);
const referenceKeys = keysByLang.get(REFERENCE_LANG).keys;
const valuesByLang = new Map(
  languages.map((lang) => [lang, collectLocaleValues(lang)]),
);
const simpleKeys = loadSimpleLocaleKeys();
const domainCodes = loadDomainCodes();

const scanned = SCAN_DIRS.flatMap((d) => walkFiles(d));

console.log(
  `[check-locale-keys] 基准语言 ${REFERENCE_LANG}：${referenceKeys.size} 键` +
    `（${keysByLang.get(REFERENCE_LANG).files} 文件）` +
    ` | 注册语言 ${languages.length}（${languages.join(' / ')}）` +
    ` | 业务域错误码 ${domainCodes.length}` +
    ` | simple locale 白名单 ${simpleKeys.size}` +
    ` | 扫描 ${scanned.length} 文件`,
);

const failures = [];

// ---------------------------------------------------------------- 规则 0：引用键存在
const missing = new Map();
let calls = 0;
for (const file of scanned) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const m of src.matchAll(T_CALL_RE)) {
    calls += 1;
    const key = m[2];
    if (referenceKeys.has(key) || simpleKeys.has(key)) continue;
    if (!missing.has(key)) missing.set(key, new Set());
    missing.get(key).add(file);
  }
}
console.log(`  · 规则 0 引用键存在：${calls} 个 $t 调用`);
if (missing.size > 0) {
  const lines = [...missing.keys()]
    .toSorted((a, b) => a.localeCompare(b))
    .flatMap((key) => [
      `      - ${key}`,
      ...[...missing.get(key)]
        .toSorted((a, b) => a.localeCompare(b))
        .map((f) => `          ← ${f}`),
    ]);
  failures.push([
    `规则 0：${missing.size} 个键在 ${REFERENCE_LANG} 缺失（UI 将直接显示键名）`,
    ...lines,
    '      修复：在核心/app 语言包补齐键；若该键本就属于 simple locale，请确认其来源。',
  ]);
}

// ---------------------------------------------------------------- 规则 1：多语言键集一致
console.log(`  · 规则 1 多语言键集一致：${languages.join(' / ')}`);
for (const lang of languages) {
  if (lang === REFERENCE_LANG) continue;
  const keys = keysByLang.get(lang).keys;
  const missingInLang = [...referenceKeys].filter((k) => !keys.has(k));
  const orphans = [...keys].filter((k) => !referenceKeys.has(k));
  if (missingInLang.length === 0 && orphans.length === 0) continue;
  const lines = [];
  if (missingInLang.length > 0) {
    lines.push(
      `      - ${lang} 缺 ${missingInLang.length} 个键（该语言界面会显示键名）：`,
      ...missingInLang
        .toSorted((a, b) => a.localeCompare(b))
        .map((k) => `          · ${k}`),
    );
  }
  if (orphans.length > 0) {
    lines.push(
      `      - ${lang} 多 ${orphans.length} 个键（${REFERENCE_LANG} 无对应文案，属死文案）：`,
      ...orphans
        .toSorted((a, b) => a.localeCompare(b))
        .map((k) => `          · ${k}`),
    );
  }
  failures.push([`规则 1：${lang} 与 ${REFERENCE_LANG} 键集不一致`, ...lines]);
}

// ---------------------------------------------------------------- 规则 2：禁止兜底写法
console.log('  · 规则 2 禁止 `$t(..) || "..."` 兜底写法');
const hits = [];
for (const file of scanned) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  src.split('\n').forEach((line, i) => {
    if (T_FALLBACK_RE.test(line)) hits.push(`      - ${file}:${i + 1}`);
  });
}
if (hits.length > 0) {
  failures.push([
    `规则 2：${hits.length} 处 \`$t(..) || "..."\` 兜底写法（vue-i18n 缺键返回键名，兜底永不生效）`,
    ...hits,
    '      修复：删掉 `|| "..."`，缺键交给规则 0/1 拦截。',
  ]);
}

// ---------------------------------------------------------------- 规则 3：业务码文案齐全
console.log(
  `  · 规则 3 业务码文案齐全：${domainCodes.length} 个码 × ${languages.length} 语言`,
);
const expected = new Set(domainCodes.map((code) => toDomainKey(code)));
for (const lang of languages) {
  const keys = keysByLang.get(lang).keys;
  const missing = [...expected].filter((k) => !keys.has(k));
  const orphans = [...keys].filter(
    (k) => k.startsWith(DOMAIN_KEY_PREFIX) && !expected.has(k),
  );
  if (missing.length === 0 && orphans.length === 0) continue;
  const lines = [];
  if (missing.length > 0) {
    lines.push(
      `      - ${lang} 缺 ${missing.length} 条业务码文案（用户会看到后端原始 message）：`,
      ...missing
        .toSorted((a, b) => a.localeCompare(b))
        .map((k) => `          · ${k}`),
    );
  }
  if (orphans.length > 0) {
    lines.push(
      `      - ${lang} 有 ${orphans.length} 条清单外的孤儿文案（码清单未登记）：`,
      ...orphans
        .toSorted((a, b) => a.localeCompare(b))
        .map((k) => `          · ${k}`),
    );
  }
  failures.push([
    `规则 3：${lang} 的 ${DOMAIN_KEY_PREFIX}* 与错误码清单不一致`,
    ...lines,
    `      修复：文案写入 ${DOMAIN_KEY_PREFIX}<码点转下划线小写>，并在 ${DOMAIN_CODES_FILE} 登记码。`,
  ]);
}

// ---------------------------------------------------------------- 规则 4：空值一致性
console.log(`  · 规则 4 空值一致性：${languages.join(' / ')}`);
const referenceValues = valuesByLang.get(REFERENCE_LANG);
const lines = [];
for (const lang of languages) {
  if (lang === REFERENCE_LANG) continue;
  const values = valuesByLang.get(lang);
  for (const [key, refValue] of referenceValues) {
    const value = values.get(key);
    // 缺键由规则 1 负责，这里只比较「都存在」的键
    if (value === undefined) continue;
    const refEmpty = refValue.trim() === '';
    const langEmpty = value.trim() === '';
    if (refEmpty !== langEmpty) {
      lines.push(
        `      - ${key}：${REFERENCE_LANG}=${refEmpty ? '空' : '有文案'}` +
          ` / ${lang}=${langEmpty ? '空' : '有文案'}`,
      );
    }
  }
}
if (lines.length > 0) {
  failures.push([
    `规则 4：${lines.length} 个键的空值状态不一致（空文案会在界面显示为空白）`,
    ...lines,
    '      修复：补齐为空的一侧；若该字段本就不展示，请两侧同时留空。',
  ]);
}

// ---------------------------------------------------------------- 规则 5：动态键引用存在
const missing2 = new Map();
let refs = 0;
for (const file of scanned) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const m of src.matchAll(DYNAMIC_KEY_RE)) {
    refs += 1;
    const key = m[2];
    if (referenceKeys.has(key) || simpleKeys.has(key)) continue;
    if (!missing2.has(key)) missing2.set(key, new Set());
    missing2.get(key).add(file);
  }
}
console.log(`  · 规则 5 动态键引用存在：${refs} 处 labelKey/tipKey`);
if (missing2.size > 0) {
  const lines = [...missing2.keys()]
    .toSorted((a, b) => a.localeCompare(b))
    .flatMap((key) => [
      `      - ${key}`,
      ...[...missing2.get(key)]
        .toSorted((a, b) => a.localeCompare(b))
        .map((f) => `          ← ${f}`),
    ]);
  failures.push([
    `规则 5：${missing2.size} 个 labelKey/tipKey 在 ${REFERENCE_LANG} 缺失（渲染时直接显示键名）`,
    ...lines,
    '      修复：在对应 app 语言包补齐键（本条专治 `$t(t.labelKey)` 这类规则 0 扫不到的写法）。',
  ]);
}

// ---------------------------------------------------------------- 汇总
if (failures.length === 0) {
  console.log(
    '✅ 六条规则全部通过：无缺失键 / 语言键集一致 / 无兜底写法 / 业务码文案齐全 / 空值一致 / 动态键存在',
  );
  process.exit(0);
}

for (const [title, ...lines] of failures) {
  console.error(`\n❌ ${title}`);
  for (const line of lines) console.error(line);
}
process.exit(1);
