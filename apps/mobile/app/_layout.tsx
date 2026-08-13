import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style='dark' />
      <Stack>
        <Stack.Screen name='index' options={{ title: '관심종목' }} />
        <Stack.Screen name='ticker/[id]' options={{ title: '종목' }} />
      </Stack>
    </>
  );
}
