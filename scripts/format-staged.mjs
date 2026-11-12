#!/usr/bin/env node
/**
 * pre-commit 钩子专用：对暂存区匹配的文件分批调用 oxfmt。
 *
 * 为什么不用 `pnpm exec oxfmt {staged_files}`：
 * 同步上游时一次暂存可达数百个文件，展开后超出 Windows 命令行长度限制。
 * 为什么不用 xargs 分批：Git Bash 下 getconf ARG_MAX 不可用，
 * lefthook 调起的 sh 里 xargs 会触发断言（bc_ctl.arg_max >= LINE_MAX）。
 */
import { execSync } from 'node:child_process';

const FILE_PATTERN = /\.(?:[cm]?[jt]sx?|vue|json|jsonc|md)$/;
const BATCH_SIZE = 40;

const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', {
  encoding: 'utf8',
})
  .split(/\r?\n/)
  .filter((file) => file && FILE_PATTERN.test(file));

if (staged.length === 0) {
  process.exit(0);
}

for (let index = 0; index < staged.length; index += BATCH_SIZE) {
  const batch = staged
    .slice(index, index + BATCH_SIZE)
    .map((file) => `"${file}"`)
    .join(' ');
  execSync(
    `pnpm exec oxfmt --threads=4 --no-error-on-unmatched-pattern ${batch}`,
    { stdio: 'inherit' },
  );
}
