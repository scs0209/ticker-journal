import {
  buildChartHtml,
  type CreateEntryInput,
  CreateEntrySchema,
  type Entry,
  type Ticker,
  type TimelineFilter,
  TimelineFilterSchema,
} from '@ticker-journal/shared';
import { Redirect, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { createEntry, deleteEntry, getTicker, listEntries } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const FILTERS = TimelineFilterSchema.options;

export default function TickerDetailScreen() {
  const { session, loading: authLoading } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tickerId = id ?? '';

  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'memo' | 'link' | 'trade'>('memo');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const loadGen = useRef(0);

  const chartHtml = useMemo(() => {
    if (!ticker) return '';
    return buildChartHtml(ticker.market, ticker.symbol);
  }, [ticker]);

  const load = useCallback(async () => {
    if (!tickerId) return;
    const gen = ++loadGen.current;
    setLoading(true);
    setError(null);
    try {
      const [nextTicker, nextEntries] = await Promise.all([getTicker(tickerId), listEntries(tickerId, filter)]);
      if (gen !== loadGen.current) return;
      setTicker(nextTicker);
      setEntries(nextEntries);
    } catch (err) {
      if (gen !== loadGen.current) return;
      setError(err instanceof Error ? err.message : '상세를 불러오지 못했습니다.');
    } finally {
      if (gen === loadGen.current) setLoading(false);
    }
  }, [filter, tickerId]);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      void load();
      return () => {
        loadGen.current += 1;
      };
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

  const closeModal = () => {
    setModalOpen(false);
    setEntryType('memo');
    setBody('');
    setUrl('');
    setTitle('');
    setNote('');
    setSide('buy');
    setReason('');
  };

  const handleCreate = async () => {
    if (!tickerId) return;
    setSaving(true);
    try {
      let input: CreateEntryInput;
      if (entryType === 'memo') {
        input = CreateEntrySchema.parse({ type: 'memo', ticker_id: tickerId, body });
      } else if (entryType === 'link') {
        input = CreateEntrySchema.parse({
          type: 'link',
          ticker_id: tickerId,
          url,
          title: title.trim() ? title : null,
          note: note.trim() ? note : null,
        });
      } else {
        input = CreateEntrySchema.parse({
          type: 'trade',
          ticker_id: tickerId,
          side,
          traded_at: new Date().toISOString(),
          reason: reason.trim() ? reason : null,
        });
      }
      await createEntry(input);
      closeModal();
      await load();
    } catch (err) {
      Alert.alert('저장 실패', err instanceof Error ? err.message : '엔트리를 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: Entry) => {
    Alert.alert('엔트리 삭제', '이 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteEntry(entry.id);
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
      {ticker ? (
        <View style={styles.chart}>
          <WebView originWhitelist={['https://*', 'about:blank']} source={{ html: chartHtml }} style={styles.webview} />
        </View>
      ) : null}

      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipActive]}
            accessibilityRole='button'
            accessibilityLabel={`필터 ${item}`}
          >
            <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingBottom: 100 }}
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>타임라인이 비어 있습니다.</Text> : null}
        renderItem={({ item }) => (
          <Pressable
            style={styles.timelineItem}
            onLongPress={() => handleDelete(item)}
            accessibilityRole='button'
            accessibilityLabel='엔트리'
          >
            <Text style={styles.itemTitle}>{item.type.toUpperCase()}</Text>
            <Text style={styles.itemBody}>{formatEntry(item)}</Text>
            <Text style={styles.itemMeta}>길게 눌러 삭제</Text>
          </Pressable>
        )}
      />

      <Pressable
        style={styles.fab}
        onPress={() => setModalOpen(true)}
        accessibilityRole='button'
        accessibilityLabel='엔트리 추가'
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={modalOpen} animationType='slide' transparent onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>엔트리 추가</Text>
            <View style={styles.filters}>
              {(['memo', 'link', 'trade'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setEntryType(type)}
                  style={[styles.chip, entryType === type && styles.chipActive]}
                >
                  <Text style={[styles.chipText, entryType === type && styles.chipTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </View>

            {entryType === 'memo' ? (
              <TextInput
                placeholder='메모'
                value={body}
                onChangeText={setBody}
                style={[styles.input, styles.multiline]}
                multiline
                accessibilityLabel='메모 본문'
              />
            ) : null}

            {entryType === 'link' ? (
              <>
                <TextInput
                  placeholder='https://...'
                  autoCapitalize='none'
                  value={url}
                  onChangeText={setUrl}
                  style={styles.input}
                  accessibilityLabel='링크 URL'
                />
                <TextInput placeholder='제목 (선택)' value={title} onChangeText={setTitle} style={styles.input} />
                <TextInput placeholder='노트 (선택)' value={note} onChangeText={setNote} style={styles.input} />
              </>
            ) : null}

            {entryType === 'trade' ? (
              <>
                <View style={styles.filters}>
                  {(['buy', 'sell'] as const).map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => setSide(value)}
                      style={[styles.chip, side === value && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, side === value && styles.chipTextActive]}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  placeholder='매매 이유 (선택)'
                  value={reason}
                  onChangeText={setReason}
                  style={[styles.input, styles.multiline]}
                  multiline
                />
              </>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable onPress={closeModal} style={styles.secondaryButton}>
                <Text>취소</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={saving}
                style={[styles.primaryButton, saving && styles.disabled]}
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

const formatTradedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR');
};

const formatEntry = (entry: Entry): string => {
  if (entry.type === 'memo') return entry.body;
  if (entry.type === 'link') return `${entry.title ?? entry.url}\n${entry.url}`;
  return `${entry.side.toUpperCase()} · ${formatTradedAt(entry.traded_at)}${entry.reason ? `\n${entry.reason}` : ''}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { alignItems: 'center', justifyContent: 'center' },
  chart: { height: 200, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  webview: { flex: 1 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  chip: { borderWidth: 1, borderColor: '#aaa', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 12, color: '#333' },
  chipTextActive: { color: '#fff' },
  error: { color: '#b91c1c', paddingHorizontal: 12 },
  empty: { color: '#666', padding: 12 },
  timelineItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  itemBody: { fontSize: 13, color: '#555', lineHeight: 18 },
  itemMeta: { fontSize: 11, color: '#888' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  secondaryButton: { paddingHorizontal: 14, paddingVertical: 10 },
  primaryButton: { backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
