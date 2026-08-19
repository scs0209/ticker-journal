import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { parseAuthCallbackUrl } from './auth-callback';
import { isSupabaseConfigured, supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const consumeAuthCallbackUrl = async (url: string | null) => {
  if (!url || !isSupabaseConfigured) return;
  const payload = parseAuthCallbackUrl(url);
  if (!payload) return;

  if (payload.type === 'code') {
    const { error } = await supabase.auth.exchangeCodeForSession(payload.code);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });
  if (error) throw error;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const applyUrl = async (url: string | null) => {
      try {
        await consumeAuthCallbackUrl(url);
      } catch {
        // 콜백 실패 시 기존 세션 유지. 로그인 화면에서 다시 시도.
      }
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      await applyUrl(await Linking.getInitialURL());
      if (mounted) setLoading(false);
    };

    void init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    const urlSub = Linking.addEventListener('url', ({ url }) => {
      void applyUrl(url);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      urlSub.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signInWithMagicLink: async (email: string) => {
        if (!isSupabaseConfigured) {
          throw new Error('EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY 를 설정하세요.');
        }
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: Linking.createURL('auth/callback'),
          },
        });
        if (error) throw error;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
