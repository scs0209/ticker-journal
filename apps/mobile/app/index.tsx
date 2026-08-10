import { APP_NAME, type Market } from "@ticker-journal/shared";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PLACEHOLDER: Array<{ id: string; market: Market; symbol: string; name: string; summary: string }> = [
  { id: "aapl", market: "US", symbol: "AAPL", name: "Apple", summary: "샘플 · 메모/링크/매매 연결 예정" },
  { id: "005930", market: "KR", symbol: "005930", name: "삼성전자", summary: "샘플 · KR은 차트 fallback" },
  { id: "tsla", market: "US", symbol: "TSLA", name: "Tesla", summary: "샘플 · 비어 있는 타임라인" },
];

export default function WatchlistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{APP_NAME}</Text>
      <Text style={styles.title}>관심종목</Text>
      <Text style={styles.hint}>Phase 0 뼈대 · Supabase 연동 전 로컬 플레이스홀더</Text>

      {PLACEHOLDER.map((item) => (
        <Link key={item.id} href={`/ticker/${item.id}`} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.symbol}>
              {item.symbol}{" "}
              <Text style={styles.market}>{item.market}</Text>
            </Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, gap: 12 },
  eyebrow: { fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 0.6 },
  title: { fontSize: 28, fontWeight: "700", color: "#111" },
  hint: { fontSize: 13, color: "#666", marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  symbol: { fontSize: 16, fontWeight: "700", color: "#111" },
  market: { fontSize: 12, fontWeight: "500", color: "#666" },
  name: { fontSize: 14, color: "#333" },
  summary: { fontSize: 12, color: "#666" },
});
