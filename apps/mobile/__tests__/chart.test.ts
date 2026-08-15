import { buildChartHtml } from '../lib/chart';

describe('buildChartHtml', () => {
  it('embeds TradingView for US symbols', () => {
    const html = buildChartHtml('US', 'aapl');
    expect(html).toContain('TradingView.widget');
    expect(html).toContain('AAPL');
  });

  it('uses fallback for KR symbols', () => {
    const html = buildChartHtml('KR', '005930');
    expect(html).toContain('KR 차트 fallback');
    expect(html).toContain('005930');
    expect(html).not.toContain('TradingView.widget');
  });
});
