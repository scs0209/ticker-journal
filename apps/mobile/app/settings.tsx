import { Redirect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { deleteOwnAccount } from '../lib/account';
import { useAuth } from '../lib/auth';

const privacyPolicyUrl = () => {
  const base = process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '');
  return base ? `${base}/privacy` : null;
};

export default function SettingsScreen() {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.muted}>불러오는 중…</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href='/login' />;
  }

  const email = session.user.email ?? '(이메일 없음)';
  const policyUrl = privacyPolicyUrl();

  const openPrivacy = async () => {
    if (!policyUrl) {
      Alert.alert('설정 필요', 'EXPO_PUBLIC_WEB_URL 에 배포된 웹 URL을 넣어 주세요.');
      return;
    }
    await WebBrowser.openBrowserAsync(policyUrl);
  };

  const handleDelete = () => {
    Alert.alert('계정 삭제', '관심종목·타임라인 기록이 모두 삭제되며 되돌릴 수 없습니다. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteOwnAccount();
              router.replace('/login');
            } catch (err) {
              Alert.alert('삭제 실패', err instanceof Error ? err.message : '다시 시도해 주세요.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>로그인</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>세션</Text>
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
          style={styles.button}
        >
          <Text style={styles.buttonText}>로그아웃</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>법적 고지</Text>
        <Pressable onPress={() => void openPrivacy()} accessibilityRole='button' style={styles.linkButton}>
          <Text style={styles.linkText}>개인정보 처리방침</Text>
        </Pressable>
        {policyUrl ? (
          <Pressable onPress={() => void Linking.openURL(policyUrl)} accessibilityRole='link' style={styles.linkButton}>
            <Text style={styles.linkTextMuted}>{policyUrl}</Text>
          </Pressable>
        ) : (
          <Text style={styles.muted}>스토어 제출 전 EXPO_PUBLIC_WEB_URL 을 설정하세요.</Text>
        )}
      </View>

      <View style={[styles.section, styles.dangerSection]}>
        <Text style={styles.dangerTitle}>계정 삭제</Text>
        <Text style={styles.dangerBody}>관심종목·타임라인 기록이 모두 삭제되며 되돌릴 수 없습니다.</Text>
        <Pressable onPress={handleDelete} accessibilityRole='button' style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>계정 삭제</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  email: { fontSize: 16, fontWeight: '600', color: '#111' },
  section: { marginTop: 12, gap: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  button: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { fontSize: 14, color: '#333' },
  linkButton: { alignSelf: 'flex-start' },
  linkText: { fontSize: 14, color: '#2563eb', textDecorationLine: 'underline' },
  linkTextMuted: { fontSize: 12, color: '#666' },
  muted: { fontSize: 13, color: '#666', lineHeight: 18 },
  dangerSection: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  dangerTitle: { fontSize: 15, fontWeight: '600', color: '#991b1b' },
  dangerBody: { fontSize: 13, color: '#991b1b', lineHeight: 18 },
  dangerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  dangerButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
