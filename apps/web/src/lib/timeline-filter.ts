import { TimelineFilterSchema } from '@ticker-journal/shared';

export const parseTimelineFilter = (raw: string | undefined) => {
  const parsed = TimelineFilterSchema.safeParse(raw ?? 'all');
  return parsed.success ? parsed.data : 'all';
};
