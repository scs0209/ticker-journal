import { supabase } from './supabase';

export const deleteOwnAccount = async (): Promise<void> => {
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) throw signOutError;
};
