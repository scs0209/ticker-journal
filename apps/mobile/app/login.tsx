import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { useAuth } from '../lib/auth';

type AuthMode = 'password' | 'magic';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해 주세요.'),
  password: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { session, configured, signInWithPassword, signInWithMagicLink, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('password');
  const [result, setResult] = useState<{ message?: string; error?: string }>({});
  const [oauthPending, setOauthPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (session) return <Redirect href='/' />;

  const busy = isSubmitting || oauthPending;

  const onSubmit = handleSubmit(async (data) => {
    setResult({});
    try {
      if (mode === 'password') {
        if (!data.password) {
          setResult({ error: '비밀번호를 입력해 주세요.' });
          return;
        }
        await signInWithPassword(data.email, data.password);
      } else {
        await signInWithMagicLink(data.email);
        setResult({ message: '매직링크를 이메일로 보냈습니다. 메일함에서 링크를 열어 주세요.' });
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : '로그인에 실패했습니다.' });
    }
  });

  const handleGoogle = async () => {
    if (busy) return;
    setResult({});
    setOauthPending(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.' });
    } finally {
      setOauthPending(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setResult({});
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.eyebrow}>Ticker Journal</Text>
      <Text style={styles.title}>로그인</Text>

      {!configured && (
        <Text style={styles.hint}>
          EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY 가 비어 있습니다. apps/mobile/.env 를 채운 뒤 Expo를
          재시작하세요.
        </Text>
      )}

      <View style={styles.tabs}>
        <Pressable
          onPress={() => switchMode('password')}
          style={[styles.tab, mode === 'password' && styles.tabActive]}
          accessibilityRole='tab'
        >
          <Text style={[styles.tabText, mode === 'password' && styles.tabTextActive]}>이메일/비밀번호</Text>
        </Pressable>
        <Pressable
          onPress={() => switchMode('magic')}
          style={[styles.tab, mode === 'magic' && styles.tabActive]}
          accessibilityRole='tab'
        >
          <Text style={[styles.tabText, mode === 'magic' && styles.tabTextActive]}>매직링크</Text>
        </Pressable>
      </View>

      <Controller
        control={control}
        name='email'
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <TextInput
              autoCapitalize='none'
              autoComplete='email'
              keyboardType='email-address'
              placeholder='you@example.com'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              accessibilityLabel='이메일'
            />
            {error && <Text style={styles.fieldError}>{error.message}</Text>}
          </>
        )}
      />

      {mode === 'password' && (
        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <>
              <TextInput
                secureTextEntry
                placeholder='비밀번호'
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                accessibilityLabel='비밀번호'
              />
              {error && <Text style={styles.fieldError}>{error.message}</Text>}
            </>
          )}
        />
      )}

      <Pressable
        onPress={onSubmit}
        disabled={!configured || busy}
        accessibilityRole='button'
        accessibilityLabel={mode === 'password' ? '로그인' : '매직링크 보내기'}
        style={[styles.button, (!configured || busy) && styles.buttonDisabled]}
      >
        {isSubmitting ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.buttonText}>{mode === 'password' ? '로그인' : '매직링크 보내기'}</Text>
        )}
      </Pressable>

      {mode === 'password' && (
        <Link href='/signup' style={styles.link}>
          <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
        </Link>
      )}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        onPress={handleGoogle}
        disabled={!configured || busy}
        accessibilityRole='button'
        accessibilityLabel='Google로 로그인'
        style={[styles.googleButton, (!configured || busy) && styles.buttonDisabled]}
      >
        {oauthPending ? (
          <ActivityIndicator color='#333' />
        ) : (
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        )}
      </Pressable>

      {result.message && <Text style={styles.message}>{result.message}</Text>}
      {result.error && <Text style={styles.error}>{result.error}</Text>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center', gap: 12 },
  eyebrow: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  hint: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 8 },
  tabs: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f5f5f5' },
  tabActive: { backgroundColor: '#111' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  fieldError: { color: '#b91c1c', fontSize: 12, marginTop: -4 },
  button: { backgroundColor: '#111', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { fontSize: 12, color: '#999' },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleButtonText: { color: '#333', fontWeight: '600' },
  link: { alignSelf: 'center', marginTop: 4 },
  linkText: { fontSize: 13, color: '#2563eb' },
  message: { color: '#166534', fontSize: 13, lineHeight: 18 },
  error: { color: '#b91c1c', fontSize: 13, lineHeight: 18 },
});
