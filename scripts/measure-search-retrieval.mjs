/**
 * Cursor 브라우저(로그인 세션) 쿠키로 /search 회수 시간을 측정한다.
 * biome-ignore-all lint/suspicious/noUndeclaredEnvVars: 로컬 측정 스크립트 전용 env
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs/assets');
const BASE = process.env.MEASURE_BASE_URL ?? 'http://localhost:3000';
const COOKIE_FILE =
  process.env.MEASURE_COOKIE_FILE ??
  `${process.env.HOME}/Library/Application Support/Cursor/Partitions/cursor-browser/Cookies`;

const QUERIES = (process.env.MEASURE_QUERIES ?? 'memo,link,trade,AAPL,005930').split(',').map((q) => q.trim());
const SCREENSHOT = process.env.MEASURE_SCREENSHOT === '1';

const runPython = (py) => execFileSync('python3', ['-c', py], { encoding: 'utf8' }).trim();

const readAccountCounts = () => {
  const py = `import browser_cookie3, json, base64, urllib.request
path = ${JSON.stringify(COOKIE_FILE)}
env = {}
for line in open(${JSON.stringify(join(ROOT, 'apps/web/.env'))}):
    if '=' in line and not line.startswith('#'):
        k,v = line.strip().split('=',1)
        env[k]=v
sb_url = env['NEXT_PUBLIC_SUPABASE_URL']
key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
raw = None
for c in browser_cookie3.chromium(domain_name='localhost', cookie_file=path):
    if c.name.endswith('-auth-token'):
        raw = c.value
        break
if not raw:
    print(json.dumps({'tickers': 0, 'entries': 0}))
    raise SystemExit
b = raw[7:] if raw.startswith('base64-') else raw
if raw.startswith('base64-'):
    pad = '=' * (-len(b) % 4)
    sess = json.loads(base64.b64decode(b + pad).decode())
else:
    sess = json.loads(raw)
access = sess.get('access_token')
headers = {'apikey': key, 'Authorization': f'Bearer {access}', 'Prefer': 'count=exact'}
def count(table):
    req = urllib.request.Request(f'{sb_url}/rest/v1/{table}?select=id&limit=1', headers=headers)
    with urllib.request.urlopen(req) as r:
        cr = r.headers.get('Content-Range', '0-0/0')
        return int(cr.split('/')[-1])
print(json.dumps({'email': sess.get('user',{}).get('email'), 'tickers': count('tickers'), 'entries': count('entries')}))`;
  return JSON.parse(runPython(py) || '{"tickers":0,"entries":0}');
};

const readAuthCookies = () => {
  const py = `import browser_cookie3, json
path = ${JSON.stringify(COOKIE_FILE)}
rows = []
for c in browser_cookie3.chromium(domain_name='localhost', cookie_file=path):
    if c.name.startswith('sb-') and c.name.endswith('-auth-token'):
        rows.append({'name': c.name, 'value': c.value})
print(json.dumps(rows))`;
  return JSON.parse(runPython(py) || '[]');
};

const nowIso = () => new Date().toISOString();

const run = async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const dataCounts = readAccountCounts();
  const cookies = readAuthCookies();
  if (cookies.length === 0) {
    const payload = {
      measured_at: nowIso(),
      error: 'Supabase auth 쿠키를 찾지 못했습니다. Cursor 브라우저에서 localhost:3000 로그인 후 다시 실행하세요.',
    };
    writeFileSync(join(OUT_DIR, 'search-retrieval-metrics.json'), `${JSON.stringify(payload, null, 2)}\n`);
    console.log(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(
    cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    })),
  );

  const page = await context.newPage();
  const results = [];

  const homeStart = performance.now();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30_000 });
  const homeMs = Math.round(performance.now() - homeStart);
  const loggedIn = (await page.getByRole('button', { name: '로그아웃' }).count()) > 0;
  if (SCREENSHOT) await page.screenshot({ path: join(OUT_DIR, 'search-measure-home.png'), fullPage: true });

  if (!loggedIn) {
    await browser.close();
    const payload = {
      measured_at: nowIso(),
      logged_in: false,
      home_load_ms: homeMs,
      error: '쿠키 주입 후에도 로그인 상태가 아닙니다.',
    };
    writeFileSync(join(OUT_DIR, 'search-retrieval-metrics.json'), `${JSON.stringify(payload, null, 2)}\n`);
    console.log(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  // 홈 → 검색 제출(UX end-to-end 1회)
  const uxStart = performance.now();
  await page.getByPlaceholder('메모, 링크, 종목명으로 검색…').fill(QUERIES[0] ?? 'memo');
  await page.getByRole('button', { name: '검색' }).click();
  await page.waitForURL(/\/search\?q=/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  const uxMs = Math.round(performance.now() - uxStart);
  if (SCREENSHOT) await page.screenshot({ path: join(OUT_DIR, 'search-measure-ux-flow.png'), fullPage: true });

  for (const query of QUERIES) {
    if (!query) continue;
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    const start = performance.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    const elapsedMs = Math.round(performance.now() - start);

    const hasLoadError = (await page.getByText(/검색에 실패했습니다/).count()) > 0;
    const hitLinks = await page.locator('a[href^="/ticker/"]').count();
    const emptyResult = (await page.getByText(/에 맞는 기록이 없습니다/).count()) > 0;
    const emptyQueryHint = (await page.getByText(/검색어를 입력하면/).count()) > 0;

    results.push({
      query,
      url,
      page_load_ms: elapsedMs,
      hit_count_visible: hitLinks,
      status: hasLoadError
        ? 'error'
        : emptyQueryHint
          ? 'empty_query'
          : emptyResult
            ? 'no_hits'
            : hitLinks > 0
              ? 'ok'
              : 'unknown',
    });

    if (SCREENSHOT) {
      await page.screenshot({
        path: join(OUT_DIR, `search-measure-${query.replace(/[^\w가-힣-]+/g, '_').slice(0, 24)}.png`),
        fullPage: true,
      });
    }
  }

  await browser.close();

  const ok = results.filter((r) => r.status === 'ok');
  const loads = results.map((r) => r.page_load_ms);
  const payload = {
    measured_at: nowIso(),
    base_url: BASE,
    logged_in: true,
    account: dataCounts,
    home_load_ms: homeMs,
    home_to_search_ux_ms: uxMs,
    ux_query: QUERIES[0] ?? null,
    queries: results,
    summary: {
      attempts: results.length,
      success: ok.length,
      success_rate_pct: results.length ? Math.round((ok.length / results.length) * 100) : 0,
      avg_page_load_ms: loads.length ? Math.round(loads.reduce((s, n) => s + n, 0) / loads.length) : null,
      min_page_load_ms: loads.length ? Math.min(...loads) : null,
      max_page_load_ms: loads.length ? Math.max(...loads) : null,
      avg_page_load_ms_ok: ok.length ? Math.round(ok.reduce((s, r) => s + r.page_load_ms, 0) / ok.length) : null,
    },
    notes: [
      'page_load_ms = Playwright networkidle (SSR + Supabase + 렌더).',
      'home_to_search_ux_ms = 홈 입력 → /search 결과까지.',
      'Before(노션/시트)는 수동 — 이번 자동 측정 미포함.',
    ],
  };

  writeFileSync(join(OUT_DIR, 'search-retrieval-metrics.json'), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(JSON.stringify(payload, null, 2));
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
