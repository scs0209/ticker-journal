import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { useAuth } from '../lib/auth';

export default function LoginScreen() {
  const { session, configured, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (session) {
    return <Redirect href='/' />;
  }

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      await signInWithMagicLink(email);
      setMessage('매직링크를 이메일로 보냈습니다. 메일함에서 링크를 열어 주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 요청에 실패했습니다.');
    } finally {
      setPending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.eyebrow}>Ticker Journal</Text>
      <Text style={styles.title}>로그인</Text>
      <Text style={styles.hint}>
        {configured
          ? '이메일 매직링크로 로그인합니다. Supabase Auth redirect에 tickerjournal://auth/callback 과 Expo Go용 exp:// 콜백을 등록하세요.'
          : 'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY 가 비어 있습니다. apps/mobile/.env 를 채운 뒤 Expo를 재시작하세요.'}
      </Text>

      <TextInput
        autoCapitalize='none'
        autoComplete='email'
        keyboardType='email-address'
        placeholder='you@example.com'
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        accessibilityLabel='이메일'
      />

      <Pressable
        onPress={handleSubmit}
        disabled={pending || !email.trim() || !configured}
        accessibilityRole='button'
        accessibilityLabel='매직링크 보내기'
        style={[styles.button, (pending || !email.trim() || !configured) && styles.buttonDisabled]}
      >
        {pending ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>매직링크 보내기</Text>}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center', gap: 12 },
  eyebrow: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  hint: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600' },
  message: { color: '#166534', fontSize: 13, lineHeight: 18 },
  error: { color: '#b91c1c', fontSize: 13, lineHeight: 18 },
});
