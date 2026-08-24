import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, Text } from 'react-native';

import { AuthProvider, useAuth } from '../lib/auth';

const LogoutButton = () => {
  const { session, signOut } = useAuth();
  const router = useRouter();
  if (!session) return null;

  return (
    <Pressable
      onPress={async () => {
        try {
          await signOut();
          router.replace('/login');
        } catch (err) {
          Alert.alert('로그아웃 실패', err instanceof Error ? err.message : '다시 시도해 주세요.');
        }
      }}
      accessibilityRole='button'
      accessibilityLabel='로그아웃'
      style={{ paddingHorizontal: 8 }}
    >
      <Text style={{ color: '#2563eb', fontSize: 14 }}>로그아웃</Text>
    </Pressable>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style='dark' />
      <Stack>
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen name='signup' options={{ headerShown: false }} />
        <Stack.Screen name='auth/callback' options={{ headerShown: false }} />
        <Stack.Screen
          name='index'
          options={{
            title: '관심종목',
            headerRight: () => <LogoutButton />,
          }}
        />
        <Stack.Screen name='ticker/[id]' options={{ title: '종목' }} />
      </Stack>
    </AuthProvider>
  );
}
