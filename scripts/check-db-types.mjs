#!/usr/bin/env node
/**
 * packages/shared/src/database.ts 가 `pnpm gen:types` 결과와 같은지 검사한다.
 *
 * 소스:
 * - linked (기본, 로컬): `supabase gen types --linked`
 * - local: `supabase start` 후 `--local` (CI 권장, 토큰 불필요)
 * - project: `--project-id` + SUPABASE_ACCESS_TOKEN
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const committedPath = resolve(root, 'packages/shared/src/database.ts');
const generatedPath = resolve(root, 'packages/shared/src/database.generated.ts');

// biome-ignore lint/suspicious/noUndeclaredEnvVars: root script, not a turbo task
const projectId = process.env.SUPABASE_PROJECT_ID ?? 'bfzalnslexpnoohaqbgs';
// biome-ignore lint/suspicious/noUndeclaredEnvVars: root script, not a turbo task
const source = process.env.DB_TYPES_SOURCE ?? (process.env.CI ? 'local' : 'linked');

const normalize = (src) => {
  const body = src
    .replace(/\r\n/g, '\n')
    .replace(/PostgrestVersion:\s*"[^"]+"/g, 'PostgrestVersion: "NORMALIZED"')
    .trimEnd();
  return `${body}\n`;
};

const genArgs = (() => {
  if (source === 'local') {
    return ['supabase', 'gen', 'types', 'typescript', '--local', '--schema', 'public'];
  }
  if (source === 'project') {
    return ['supabase', 'gen', 'types', 'typescript', '--project-id', projectId, '--schema', 'public'];
  }
  return ['supabase', 'gen', 'types', 'typescript', '--linked', '--schema', 'public'];
})();

// biome-ignore lint/suspicious/noUndeclaredEnvVars: optional CI secret
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
if (source === 'project' && !accessToken) {
  console.warn('check:db-types: SUPABASE_ACCESS_TOKEN 없음 — project 소스 검사를 스킵합니다.');
  process.exit(0);
}

const generated = execFileSync('npx', genArgs, {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
});

const committed = normalize(readFileSync(committedPath, 'utf8'));
const fresh = normalize(generated);

if (committed !== fresh) {
  const left = resolve(root, 'packages/shared/src/database.committed.norm.ts');
  writeFileSync(left, committed);
  writeFileSync(generatedPath, fresh);
  try {
    execFileSync('diff', ['-u', left, generatedPath], { encoding: 'utf8', stdio: 'inherit' });
  } catch {
    // diff exits 1 on mismatch
  }
  unlinkSync(left);
  unlinkSync(generatedPath);
  console.error('\nDatabase 타입이 스키마와 다릅니다. `pnpm gen:types` 후 커밋하세요.');
  process.exit(1);
}

console.log(`Database 타입이 스키마와 일치합니다. (source=${source})`);
