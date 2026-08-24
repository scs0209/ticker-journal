#!/usr/bin/env node
/**
 * packages/shared/src/database.ts 가 `pnpm gen:types` 결과와 같은지 검사한다.
 * 수동 편집 드리프트를 CI에서 잡는다.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const committedPath = resolve(root, 'packages/shared/src/database.ts');
const generatedPath = resolve(root, 'packages/shared/src/database.generated.ts');

// Linked project ref (public). Override with SUPABASE_PROJECT_ID when needed.
// biome-ignore lint/suspicious/noUndeclaredEnvVars: root script, not a turbo task
const projectId = process.env.SUPABASE_PROJECT_ID ?? 'bfzalnslexpnoohaqbgs';

const normalize = (src) => {
  const body = src
    .replace(/\r\n/g, '\n')
    .replace(/PostgrestVersion:\s*"[^"]+"/g, 'PostgrestVersion: "NORMALIZED"')
    .trimEnd();
  return `${body}\n`;
};

const genArgs = process.env.CI
  ? ['supabase', 'gen', 'types', 'typescript', '--project-id', projectId, '--schema', 'public']
  : ['supabase', 'gen', 'types', 'typescript', '--linked', '--schema', 'public'];

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

console.log('Database 타입이 스키마와 일치합니다.');
