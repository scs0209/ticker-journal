import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SearchView } from '@/components/search-view';

describe('SearchView', () => {
  it('조회 실패를 빈 결과와 구분한다', () => {
    render(<SearchView query='fail' page={1} hasMore={false} hits={[]} loadError='permission denied' />);
    expect(screen.getByText(/검색에 실패했습니다/)).toBeInTheDocument();
    expect(screen.queryByText(/에 맞는 기록이 없습니다/)).not.toBeInTheDocument();
  });
});
