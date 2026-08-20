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
} from 'react-native';
import { z } from 'zod';

import { useAuth } from '../lib/auth';

const signUpSchema = z
  .object({
    email: z.string().email('올바른 이메일을 입력해 주세요.'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
    confirm: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine((d) => d.password === d.confirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirm'],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const { session, configured, signUp } = useAuth();
  const [result, setResult] = useState<{ message?: string; error?: string }>({});

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  if (session) return <Redirect href='/' />;

  const onSubmit = handleSubmit(async (data) => {
    setResult({});
    try {
      await signUp(data.email, data.password);
      setResult({ message: '확인 이메일을 보냈습니다. 메일함에서 링크를 열어 주세요.' });
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : '회원가입에 실패했습니다.' });
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.eyebrow}>Ticker Journal</Text>
      <Text style={styles.title}>회원가입</Text>

      {!configured && (
        <Text style={styles.hint}>
          EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY 가 비어 있습니다. apps/mobile/.env 를 채운 뒤 Expo를
          재시작하세요.
        </Text>
      )}

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

      <Controller
        control={control}
        name='password'
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <TextInput
              secureTextEntry
              placeholder='비밀번호 (6자 이상)'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              accessibilityLabel='비밀번호'
            />
            {error && <Text style={styles.fieldError}>{error.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name='confirm'
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <TextInput
              secureTextEntry
              placeholder='비밀번호 확인'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              accessibilityLabel='비밀번호 확인'
            />
            {error && <Text style={styles.fieldError}>{error.message}</Text>}
          </>
        )}
      />

      <Pressable
        onPress={onSubmit}
        disabled={!configured || isSubmitting}
        accessibilityRole='button'
        accessibilityLabel='회원가입'
        style={[styles.button, (!configured || isSubmitting) && styles.buttonDisabled]}
      >
        {isSubmitting ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>회원가입</Text>}
      </Pressable>

      <Link href='/login' style={styles.link}>
        <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
      </Link>

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
  link: { alignSelf: 'center', marginTop: 4 },
  linkText: { fontSize: 13, color: '#2563eb' },
  message: { color: '#166534', fontSize: 13, lineHeight: 18 },
  error: { color: '#b91c1c', fontSize: 13, lineHeight: 18 },
});
