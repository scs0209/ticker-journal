'use server';

import { CreateEntrySchema } from '@ticker-journal/shared';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createEntryRecord, deleteEntryRecord } from '@/lib/entries';
import { createClient } from '@/lib/supabase/server';

export type EntryActionState = { error: string | null };

export const createEntry = async (_prev: EntryActionState, formData: FormData): Promise<EntryActionState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const tickerId = String(formData.get('ticker_id') ?? '');
  const entryType = String(formData.get('entry_type') ?? 'memo');

  try {
    if (entryType === 'memo') {
      const input = CreateEntrySchema.parse({
        type: 'memo',
        ticker_id: tickerId,
        body: String(formData.get('body') ?? ''),
      });
      await createEntryRecord(supabase, user.id, input);
    } else if (entryType === 'link') {
      const title = String(formData.get('title') ?? '').trim();
      const note = String(formData.get('note') ?? '').trim();
      const input = CreateEntrySchema.parse({
        type: 'link',
        ticker_id: tickerId,
        url: String(formData.get('url') ?? ''),
        title: title ? title : null,
        note: note ? note : null,
      });
      await createEntryRecord(supabase, user.id, input);
    } else {
      const reason = String(formData.get('reason') ?? '').trim();
      const input = CreateEntrySchema.parse({
        type: 'trade',
        ticker_id: tickerId,
        side: String(formData.get('side') ?? 'buy'),
        traded_at: new Date().toISOString(),
        reason: reason ? reason : null,
      });
      await createEntryRecord(supabase, user.id, input);
    }
    revalidatePath(`/ticker/${tickerId}`);
    redirect(`/ticker/${tickerId}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : '엔트리를 저장하지 못했습니다.' };
  }
};

export const deleteEntry = async (formData: FormData): Promise<void> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const entryId = String(formData.get('entry_id') ?? '');
  const tickerId = String(formData.get('ticker_id') ?? '');
  if (!entryId || !tickerId) return;

  try {
    await deleteEntryRecord(supabase, entryId);
    revalidatePath(`/ticker/${tickerId}`);
  } catch (err) {
    console.error('delete entry failed:', err);
  }
};
