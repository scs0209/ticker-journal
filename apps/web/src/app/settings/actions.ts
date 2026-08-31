'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export const deleteAccount = async () => {
  const supabase = await createClient();
  const { error } = await supabase.rpc('delete_own_account');
  if (error) {
    throw new Error(error.message);
  }

  await supabase.auth.signOut();
  redirect('/');
};
