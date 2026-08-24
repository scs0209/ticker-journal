import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTickerSchema, type Market, type Ticker } from '@ticker-journal/shared';
import { Link, Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useReducer, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { createTicker, deleteTicker, listTickers } from '../lib/api';
import { useAuth } from '../lib/auth';

const MARKETS: Market[] = ['US', 'KR'];

const formSchema = z.object({
  market: z.enum(['US', 'KR']),
  symbol: z.string().min(1, '심볼을 입력해 주세요.'),
  name: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

type ListState = { tickers: Ticker[]; loading: boolean; error: string | null };
type ListAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_OK'; tickers: Ticker[] }
  | { type: 'LOAD_FAIL'; error: string };

const listInitial: ListState = { tickers: [], loading: true, error: null };

const listReducer = (state: ListState, action: ListAction): ListState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_OK':
      return { tickers: action.tickers, loading: false, error: null };
    case 'LOAD_FAIL':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export default function WatchlistScreen() {
  const { session, loading: authLoading } = useAuth();
  const [list, dispatch] = useReducer(listReducer, listInitial);
  const [modalOpen, setModalOpen] = useState(false);
  const loadGen = useRef(0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { market: 'US', symbol: '', name: '' },
  });

  const symbol = watch('symbol');

  const load = useCallback(async () => {
    const gen = ++loadGen.current;
    dispatch({ type: 'LOAD_START' });
    try {
      const next = await listTickers();
      if (gen !== loadGen.current) return;
      dispatch({ type: 'LOAD_OK', tickers: next });
    } catch (err) {
      if (gen !== loadGen.current) return;
      dispatch({
        type: 'LOAD_FAIL',
        error: err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
      });
    }
  }, []);

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
    reset({ market: 'US', symbol: '', name: '' });
  };

  const onCreate = handleSubmit(async (data) => {
    try {
      const parsed = CreateTickerSchema.parse({
        market: data.market,
        symbol: data.symbol,
        name: data.name?.trim() ? data.name.trim() : null,
      });
      await createTicker(parsed);
      closeModal();
      await load();
    } catch (err) {
      Alert.alert('추가 실패', err instanceof Error ? err.message : '종목을 추가하지 못했습니다.');
    }
  });

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

      {list.loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : null}
      {list.error ? <Text style={styles.error}>{list.error}</Text> : null}

      {!list.loading && list.tickers.length === 0 ? (
        <Text style={styles.empty}>아직 종목이 없습니다. 추가 버튼으로 첫 종목을 만드세요.</Text>
      ) : null}

      <FlatList
        data={list.tickers}
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

      <Modal visible={modalOpen} animationType='slide' transparent onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>종목 추가</Text>
            <Controller
              control={control}
              name='market'
              render={({ field: { onChange, value } }) => (
                <View style={styles.marketRow}>
                  {MARKETS.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => onChange(m)}
                      style={[styles.chip, value === m && styles.chipActive]}
                      accessibilityRole='button'
                      accessibilityLabel={`시장 ${m}`}
                    >
                      <Text style={[styles.chipText, value === m && styles.chipTextActive]}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
            <Controller
              control={control}
              name='symbol'
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder='심볼 (예: AAPL, 005930)'
                  autoCapitalize='characters'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  accessibilityLabel='심볼'
                />
              )}
            />
            {errors.symbol ? <Text style={styles.fieldError}>{errors.symbol.message}</Text> : null}
            <Controller
              control={control}
              name='name'
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder='이름 (선택)'
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  accessibilityLabel='종목 이름'
                />
              )}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeModal} style={styles.secondaryButton}>
                <Text>취소</Text>
              </Pressable>
              <Pressable
                onPress={onCreate}
                disabled={isSubmitting || !symbol.trim()}
                style={[styles.primaryButton, (isSubmitting || !symbol.trim()) && styles.disabled]}
              >
                {isSubmitting ? <ActivityIndicator color='#fff' /> : <Text style={styles.primaryButtonText}>저장</Text>}
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
  fieldError: { color: '#b91c1c', fontSize: 12, marginTop: -4 },
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
