import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';

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
        } catch {
          // 세션이 남아 있으면 로그인 화면으로 보내지 않는다.
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
