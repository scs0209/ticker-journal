import { redirect } from 'next/navigation';

import { SettingsView } from '@/components/settings-view';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/login?next=/settings');
  }

  return <SettingsView email={user.email} />;
}
