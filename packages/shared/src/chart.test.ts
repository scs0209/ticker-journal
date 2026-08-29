import { describe, expect, it } from 'vitest';

import { buildChartHtml } from './chart';

describe('buildChartHtml', () => {
  it('US 심볼에 TradingView 위젯을 넣는다', () => {
    const html = buildChartHtml('US', 'aapl');
    expect(html).toContain('TradingView.widget');
    expect(html).toContain('symbol: "AAPL"');
  });

  it('US 심볼의 따옴표를 JS 문자열 밖으로 빼지 않는다', () => {
    const html = buildChartHtml('US', "x');alert(1);//");
    expect(html).toContain('symbol: "X\');ALERT(1);//"');
    expect(html).not.toContain("symbol: '");
  });

  it('KR 심볼은 fallback HTML을 쓴다', () => {
    const html = buildChartHtml('KR', '005930');
    expect(html).toContain('KR 차트 fallback');
    expect(html).toContain('005930');
    expect(html).not.toContain('TradingView.widget');
  });
});
