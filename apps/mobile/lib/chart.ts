import type { Market } from '@ticker-journal/shared';

export const buildChartHtml = (market: Market, symbol: string): string => {
  if (market === 'KR') {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin:0; font-family: system-ui, sans-serif; background:#f5f5f5; color:#333;
        display:flex; align-items:center; justify-content:center; height:100vh; text-align:center; padding:16px; }
      .sym { font-size:22px; font-weight:700; margin-top:8px; }
      .hint { font-size:12px; color:#666; margin-top:8px; line-height:1.5; }
    </style>
  </head>
  <body>
    <div>
      <div>KR 차트 fallback</div>
      <div class="sym">${escapeHtml(symbol)}</div>
      <div class="hint">TradingView KR 심볼 embed는 Phase 0에서 안정성 이슈로 안내 UI만 제공합니다.</div>
    </div>
  </body>
</html>`;
  }

  const tvSymbol = escapeHtml(symbol.toUpperCase());
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body, #tv { margin:0; height:100%; width:100%; background:#fff; }
    </style>
  </head>
  <body>
    <div id="tv"></div>
    <script src="https://s3.tradingview.com/tv.js"></script>
    <script>
      new TradingView.widget({
        container_id: 'tv',
        symbol: '${tvSymbol}',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        height: '100%',
        width: '100%'
      });
    </script>
  </body>
</html>`;
};

const escapeHtml = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
