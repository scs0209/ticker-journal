import { buildChartHtml } from '../lib/chart';

describe('buildChartHtml', () => {
  it('US 심볼에 TradingView 위젯을 넣는다', () => {
    const html = buildChartHtml('US', 'aapl');
    expect(html).toContain('TradingView.widget');
    expect(html).toContain('AAPL');
  });

  it('KR 심볼은 fallback HTML을 쓴다', () => {
    const html = buildChartHtml('KR', '005930');
    expect(html).toContain('KR 차트 fallback');
    expect(html).toContain('005930');
    expect(html).not.toContain('TradingView.widget');
  });
});
