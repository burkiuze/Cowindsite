import type { FinanceLine, FinanceReport } from "./types";

/**
 * A finance report, ready for the browser.
 *
 * The stored report names its sources by integration id, which is the honest
 * way to keep it — but a reader recognises a mark faster than a slug, so each
 * line is decorated with the service's real name and logo before it is sent.
 * The catalogue itself stays on the server: the browser is handed the two or
 * three services this report actually used, not seven hundred it did not.
 */

export type ReportLineView = FinanceLine & {
  sourceName: string;
  logo: string | null;
  dark: boolean;
};

export type FinanceReportView = Omit<FinanceReport, "revenue" | "expenses"> & {
  revenue: ReportLineView[];
  expenses: ReportLineView[];
};

type ServiceLike = { name: string; logo: string | null; dark: boolean };

export function decorateReport(report: FinanceReport, services: Map<string, ServiceLike>): FinanceReportView {
  const decorate = (line: FinanceLine): ReportLineView => {
    const service = services.get(line.source);
    return {
      ...line,
      sourceName: service?.name ?? line.source,
      logo: service?.logo ?? null,
      dark: service?.dark ?? false,
    };
  };

  return {
    ...report,
    revenue: report.revenue.map(decorate),
    expenses: report.expenses.map(decorate),
  };
}
