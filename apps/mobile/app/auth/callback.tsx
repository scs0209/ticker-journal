import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../lib/auth';

export default function AuthCallbackScreen() {
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href='/' />;
  }

  if (!loading && !session) {
    return <Redirect href='/login' />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text style={styles.label}>로그인 처리 중…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#fff' },
  label: { fontSize: 14, color: '#666' },
});
