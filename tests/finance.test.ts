import { describe, expect, it } from "vitest";
import {
  financeSnapshot,
  receivableState,
  runwayMonths,
  sum,
  sumPrevious,
} from "@/lib/workspace/finance";
import { change, moneyFormatter, signed } from "@/lib/money";

/**
 * The finance surface reports figures a person will act on, so the arithmetic
 * behind it is worth pinning down: totals that match their lines, a runway that
 * is cash over burn and nothing cleverer, and an invoice that is late only
 * because of its age.
 */
describe("finance snapshot", () => {
  const snapshot = financeSnapshot();

  it("totals its own lines", () => {
    expect(sum(snapshot.revenue)).toBe(2_174_900);
    expect(sum(snapshot.expenses)).toBe(1_823_200);
    expect(sum(snapshot.revenue) - sum(snapshot.expenses)).toBe(351_700);
  });

  it("agrees with the month it compares against", () => {
    expect(sumPrevious(snapshot.revenue)).toBe(2_037_700);
    expect(sumPrevious(snapshot.expenses)).toBe(1_789_600);
  });

  it("matches the trend chart to the month it reports", () => {
    const latest = snapshot.history[snapshot.history.length - 1];
    expect(latest.revenue).toBe(sum(snapshot.revenue));
    expect(latest.expenses).toBe(sum(snapshot.expenses));
    expect(snapshot.cashTrend[snapshot.cashTrend.length - 1].cash).toBe(snapshot.cash);
  });

  it("names a source for every figure", () => {
    for (const line of [...snapshot.revenue, ...snapshot.expenses]) {
      expect(line.source.length).toBeGreaterThan(0);
    }
    const read = new Set(snapshot.reads.map((entry) => entry.integrationId));
    for (const line of [...snapshot.revenue, ...snapshot.expenses]) {
      expect(read.has(line.source)).toBe(true);
    }
  });

  it("says what it could not reach instead of estimating it", () => {
    expect(snapshot.missing.length).toBeGreaterThan(0);
  });

  it("gives every commitment a notice date before its renewal", () => {
    for (const commitment of snapshot.commitments) {
      expect(commitment.noticeBy < commitment.renewal).toBe(true);
    }
  });
});

describe("runway", () => {
  it("is cash over burn", () => {
    expect(runwayMonths(4_180_000, 612_000)).toBeCloseTo(6.83, 2);
  });

  it("reports nothing rather than infinity when there is no burn", () => {
    expect(runwayMonths(1_000_000, 0)).toBeNull();
    expect(runwayMonths(1_000_000, -50)).toBeNull();
  });
});

describe("receivable state", () => {
  const base = { id: "x", reference: "INV-1", customer: "A", amount: 1, due: "2026-09-01", source: "stripe" };

  it("reads only the age of the invoice", () => {
    expect(receivableState({ ...base, overdueDays: 0 })).toBe("due");
    expect(receivableState({ ...base, overdueDays: 1 })).toBe("late");
    expect(receivableState({ ...base, overdueDays: 14 })).toBe("late");
    expect(receivableState({ ...base, overdueDays: 15 })).toBe("at-risk");
    expect(receivableState({ ...base, overdueDays: 34 })).toBe("at-risk");
  });
});

describe("money", () => {
  it("formats in the report's own currency", () => {
    expect(moneyFormatter("TRY")(1_246_000)).toContain("1.246.000");
  });

  it("survives a currency the browser does not know", () => {
    expect(moneyFormatter("XYZZY")(1_000)).toContain("XYZZY");
  });

  it("has no opinion about a change from zero", () => {
    expect(change(100, 0)).toBeNull();
    expect(change(150, 100)).toBeCloseTo(50);
    expect(signed(4.04)).toBe("+4.0%");
    expect(signed(-2)).toBe("-2.0%");
  });
});
