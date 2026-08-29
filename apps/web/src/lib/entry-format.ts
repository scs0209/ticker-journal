import type { Entry } from '@ticker-journal/shared';

export const formatTradedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR');
};

export const formatEntryPreview = (entry: Entry): string => {
  if (entry.type === 'memo') return entry.body;
  if (entry.type === 'link') return `${entry.title ?? entry.url}\n${entry.url}`;
  return `${entry.side.toUpperCase()} · ${formatTradedAt(entry.traded_at)}${entry.reason ? `\n${entry.reason}` : ''}`;
};
