import { describe, expect, it } from "vitest";
import { extractReport } from "@/lib/wind/report";

const BLOCK = `{"report":{"month":"September 2026","previous":"August 2026","currency":"TRY",
  "revenue":[{"label":"Subscriptions","source":"stripe","detail":"148 active","amount":412000,"previousAmount":386500}],
  "expenses":[{"label":"Cloud hosting","source":"gmail","amount":64200,"previousAmount":61800}],
  "history":[{"label":"Apr","revenue":330000,"expenses":240000},{"label":"May","revenue":351000,"expenses":244000}],
  "missing":["Bank fees for the last week were not readable."]}}`;

/**
 * The finance lane hands back a month as data as well as prose. What matters is
 * that the data is lifted out intact, that nothing malformed is half-rendered,
 * and that no JSON is ever left in the text a person reads.
 */
describe("extractReport", () => {
  it("lifts a report out and leaves the prose behind", () => {
    const { report, text } = extractReport(`Eylül kapandı.\n\n${BLOCK}\n`);
    expect(report?.month).toBe("September 2026");
    expect(report?.revenue[0].amount).toBe(412_000);
    expect(report?.expenses[0].source).toBe("gmail");
    expect(report?.history).toHaveLength(2);
    expect(text).toBe("Eylül kapandı.");
    expect(text).not.toContain("{");
  });

  it("reads a block written on a single line", () => {
    const compact = extractReport(`before ${JSON.stringify(JSON.parse(BLOCK))} after`);
    expect(compact.report?.currency).toBe("TRY");
    expect(compact.report?.revenue).toHaveLength(1);
    expect(compact.text).not.toContain("{");
    expect(compact.text.startsWith("before")).toBe(true);
    expect(compact.text.endsWith("after")).toBe(true);
  });

  it("keeps text that only mentions a report", () => {
    const { report, text } = extractReport("The monthly report is attached as a spreadsheet.");
    expect(report).toBeUndefined();
    expect(text).toBe("The monthly report is attached as a spreadsheet.");
  });

  it("drops a block that does not hold up, rather than half-rendering it", () => {
    const { report, text } = extractReport('Summary.\n\n{"report":{"month":"September","revenue":[]}}');
    expect(report).toBeUndefined();
    expect(text).toBe("Summary.");
  });

  it("never leaves raw JSON in the answer when the block is unparseable", () => {
    const { report, text } = extractReport('Summary.\n\n{"report":{"month": broken}}');
    expect(report).toBeUndefined();
    expect(text).not.toContain('"report"');
  });

  it("rejects amounts that are not finite numbers", () => {
    const bad = BLOCK.replace('"amount":412000', '"amount":"412000"');
    expect(extractReport(bad).report).toBeUndefined();
  });
});
