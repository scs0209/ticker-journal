import { describe, expect, it } from "vitest";
import {
  CreateEntrySchema,
  CreateTickerSchema,
  TimelineFilterSchema,
} from "./index";

describe("CreateTickerSchema", () => {
  it("uppercases and trims symbol", () => {
    const parsed = CreateTickerSchema.parse({
      market: "US",
      symbol: " aapl ",
      name: "Apple",
    });
    expect(parsed.symbol).toBe("AAPL");
  });

  it("rejects empty symbol", () => {
    expect(() =>
      CreateTickerSchema.parse({ market: "KR", symbol: "" }),
    ).toThrow();
  });
});

describe("CreateEntrySchema", () => {
  const tickerId = "11111111-1111-1111-1111-111111111111";

  it("accepts memo", () => {
    const parsed = CreateEntrySchema.parse({
      type: "memo",
      ticker_id: tickerId,
      body: "실적 전 분할매수 메모",
    });
    expect(parsed.type).toBe("memo");
  });

  it("accepts link with url", () => {
    const parsed = CreateEntrySchema.parse({
      type: "link",
      ticker_id: tickerId,
      url: "https://example.com/aapl",
      title: "earnings",
    });
    expect(parsed.type).toBe("link");
  });

  it("rejects link without url", () => {
    expect(() =>
      CreateEntrySchema.parse({
        type: "link",
        ticker_id: tickerId,
      }),
    ).toThrow();
  });

  it("accepts trade with side", () => {
    const parsed = CreateEntrySchema.parse({
      type: "trade",
      ticker_id: tickerId,
      side: "buy",
      traded_at: "2026-08-10T12:00:00.000Z",
      reason: "가이던스 상향",
    });
    expect(parsed.type).toBe("trade");
  });
});

describe("TimelineFilterSchema", () => {
  it("allows all filter chips", () => {
    expect(TimelineFilterSchema.options).toEqual([
      "all",
      "memo",
      "link",
      "trade",
    ]);
  });
});
