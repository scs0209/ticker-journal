import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';

import { AuthProvider, useAuth } from '../lib/auth';

const HeaderActions = () => {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <Link href='/settings' asChild>
      <Pressable accessibilityRole='button' accessibilityLabel='설정' style={{ paddingHorizontal: 8 }}>
        <Text style={{ color: '#2563eb', fontSize: 14 }}>설정</Text>
      </Pressable>
    </Link>
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
            headerRight: () => <HeaderActions />,
          }}
        />
        <Stack.Screen name='settings' options={{ title: '설정' }} />
        <Stack.Screen name='ticker/[id]' options={{ title: '종목' }} />
      </Stack>
    </AuthProvider>
  );
}
