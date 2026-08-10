import { TimelineFilterSchema } from "@ticker-journal/shared";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const FILTERS = TimelineFilterSchema.options;

export default function TickerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const symbol = (id ?? "AAPL").toUpperCase();
  const chartHtml = `<!DOCTYPE html><html><body style="margin:0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f5f5;color:#333">
    <div style="text-align:center;padding:16px">
      <div style="font-size:12px;color:#666">WebView chart placeholder</div>
      <div style="font-size:20px;font-weight:700;margin-top:8px">${symbol}</div>
      <div style="font-size:12px;margin-top:8px">TradingView embed comes in Phase 0</div>
    </div>
  </body></html>`;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: chartHtml }}
          style={styles.webview}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <View key={filter} style={styles.chip}>
            <Text style={styles.chipText}>{filter}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timelineItem}>
        <Text style={styles.itemTitle}>타임라인 플레이스홀더</Text>
        <Text style={styles.itemBody}>
          memo / link / trade CRUD는 Supabase 스키마 이후에 연결합니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chart: { height: 180, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  webview: { flex: 1 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  chip: { borderWidth: 1, borderColor: "#aaa", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: 12, color: "#333" },
  timelineItem: { marginHorizontal: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, gap: 6 },
  itemTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  itemBody: { fontSize: 13, color: "#555", lineHeight: 18 },
});
