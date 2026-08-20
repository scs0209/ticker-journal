import { CreateTickerSchema, type Market, type Ticker } from '@ticker-journal/shared';
import { Link, Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createTicker, deleteTicker, listTickers } from '../lib/api';
import { useAuth } from '../lib/auth';

const MARKETS: Market[] = ['US', 'KR'];

export default function WatchlistScreen() {
  const { session, loading: authLoading } = useAuth();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [market, setMarket] = useState<Market>('US');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTickers(await listTickers());
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      void load();
    }, [load, session]),
  );

  if (authLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <Redirect href='/login' />;
  }

  const handleCreate = async () => {
    setSaving(true);
    try {
      const parsed = CreateTickerSchema.parse({
        market,
        symbol,
        name: name.trim() ? name.trim() : null,
      });
      await createTicker(parsed);
      setModalOpen(false);
      setSymbol('');
      setName('');
      await load();
    } catch (err) {
      Alert.alert('추가 실패', err instanceof Error ? err.message : '종목을 추가하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Ticker) => {
    Alert.alert('종목 삭제', `${item.symbol} 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteTicker(item.id);
              await load();
            } catch (err) {
              Alert.alert('삭제 실패', err instanceof Error ? err.message : '삭제하지 못했습니다.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>관심종목</Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          accessibilityRole='button'
          accessibilityLabel='종목 추가'
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>추가</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && tickers.length === 0 ? (
        <Text style={styles.empty}>아직 종목이 없습니다. 추가 버튼으로 첫 종목을 만드세요.</Text>
      ) : null}

      <FlatList
        data={tickers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Link href={`/ticker/${item.id}`} asChild>
            <Pressable
              style={styles.card}
              onLongPress={() => handleDelete(item)}
              accessibilityRole='button'
              accessibilityLabel={`${item.symbol} 상세`}
            >
              <Text style={styles.symbol}>
                {item.symbol} <Text style={styles.market}>{item.market}</Text>
              </Text>
              <Text style={styles.name}>{item.name ?? '이름 없음'}</Text>
              <Text style={styles.summary}>길게 눌러 삭제</Text>
            </Pressable>
          </Link>
        )}
      />

      <Modal visible={modalOpen} animationType='slide' transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>종목 추가</Text>
            <View style={styles.marketRow}>
              {MARKETS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMarket(m)}
                  style={[styles.chip, market === m && styles.chipActive]}
                  accessibilityRole='button'
                  accessibilityLabel={`시장 ${m}`}
                >
                  <Text style={[styles.chipText, market === m && styles.chipTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder='심볼 (예: AAPL, 005930)'
              autoCapitalize='characters'
              value={symbol}
              onChangeText={setSymbol}
              style={styles.input}
              accessibilityLabel='심볼'
            />
            <TextInput
              placeholder='이름 (선택)'
              value={name}
              onChangeText={setName}
              style={styles.input}
              accessibilityLabel='종목 이름'
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalOpen(false)} style={styles.secondaryButton}>
                <Text>취소</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={saving || !symbol.trim()}
                style={[styles.primaryButton, (saving || !symbol.trim()) && styles.disabled]}
              >
                {saving ? <ActivityIndicator color='#fff' /> : <Text style={styles.primaryButtonText}>저장</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  addButton: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#b91c1c' },
  empty: { color: '#666', fontSize: 14, lineHeight: 20 },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, gap: 4 },
  symbol: { fontSize: 16, fontWeight: '700', color: '#111' },
  market: { fontSize: 12, fontWeight: '500', color: '#666' },
  name: { fontSize: 14, color: '#333' },
  summary: { fontSize: 12, color: '#666' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  marketRow: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#aaa', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#333' },
  chipTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  secondaryButton: { paddingHorizontal: 14, paddingVertical: 10 },
  primaryButton: { backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
