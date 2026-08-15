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
        await signOut();
        router.replace('/login');
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
