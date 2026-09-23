import type { FinanceLine, FinanceMonth } from "./types";

/**
 * The finance department's own surface.
 *
 * Everything a finance lead opens the product for, already read and laid out:
 * the month's position, where the money came from and went, what is still owed,
 * what is committed to vendors, and where revenue is leaking. No question to
 * ask and no conversation to have — the report is the page.
 *
 * Two rules hold everywhere in here. Every figure names the tool it was read
 * from, so a number can be checked rather than trusted. And nothing is
 * estimated: a source Navio cannot reach is listed in `missing` and left out of
 * the totals instead of being filled in with something plausible.
 *
 * This is the seeded workspace's ledger, the same figures Navio reports when
 * asked to close the month — a dashboard that disagreed with the assistant
 * would be worse than no dashboard.
 */

export interface Receivable {
  id: string;
  /** Invoice reference as the source names it. */
  reference: string;
  customer: string;
  amount: number;
  /** ISO date the invoice is due. */
  due: string;
  /** Days past due; 0 or less means it is not late yet. */
  overdueDays: number;
  source: string;
  note?: string;
}

export interface Commitment {
  id: string;
  vendor: string;
  /** What the contract commits to, per year. */
  annual: number;
  /** Usage against the commitment, where 1 is exactly the commitment. */
  usage: number;
  renewal: string;
  /** Last day to give notice before the contract renews itself. */
  noticeBy: string;
  recommendation: string;
  source: string;
}

export interface Leak {
  id: string;
  label: string;
  detail: string;
  amount: number;
  source: string;
}

export interface SourceRead {
  integrationId: string;
  what: string;
  /** Minutes ago the read happened. */
  minutesAgo: number;
}

export interface FinanceSnapshot {
  period: string;
  previous: string;
  currency: string;
  cash: number;
  previousCash: number;
  /** Average net burn over the last three months. */
  burn: number;
  mrr: number;
  previousMrr: number;
  /** Net revenue churn for the period, as a percentage. */
  netChurn: number;
  revenue: FinanceLine[];
  expenses: FinanceLine[];
  history: FinanceMonth[];
  cashTrend: Array<{ label: string; cash: number }>;
  receivables: Receivable[];
  commitments: Commitment[];
  leaks: Leak[];
  reads: SourceRead[];
  /** What Navio could not reach, said plainly rather than estimated. */
  missing: string[];
}

const SNAPSHOT: FinanceSnapshot = {
  period: "Eylül 2026",
  previous: "Ağustos 2026",
  currency: "TRY",
  cash: 4_180_000,
  previousCash: 3_902_000,
  burn: 612_000,
  mrr: 1_246_000,
  previousMrr: 1_196_500,
  netChurn: 1.9,

  revenue: [
    { label: "Abonelik geliri", source: "stripe", detail: "148 aktif abonelik", amount: 1_246_000, previousAmount: 1_196_500 },
    { label: "Yıllık sözleşme peşinatları", source: "stripe", detail: "3 müşteri yıllığa geçti", amount: 380_000, previousAmount: 290_000 },
    { label: "Kurumsal tahsilat", source: "gmail", detail: "Nova Retail — INV-2287", amount: 268_000, previousAmount: 251_000 },
    { label: "Tek seferlik satış ve kurulum", source: "stripe", detail: "11 kurulum bedeli", amount: 184_500, previousAmount: 212_000 },
    { label: "Danışmanlık faturaları", source: "gmail", detail: "2 entegrasyon faturası", amount: 96_400, previousAmount: 88_200 },
  ],

  expenses: [
    { label: "Maaş ve yan haklar", source: "quickbooks", detail: "Eylül bordrosu, 24 kişi", amount: 986_000, previousAmount: 958_000 },
    { label: "Bulut altyapı", source: "gmail", detail: "Fatura INV-88213", amount: 312_400, previousAmount: 289_600 },
    { label: "Ofis kirası", source: "gmail", detail: "Eylül kira faturası", amount: 145_000, previousAmount: 145_000 },
    { label: "Reklam ve pazarlama", source: "gmail", detail: "3 ajans faturası", amount: 128_500, previousAmount: 164_000 },
    { label: "Yazılım abonelikleri", source: "gmail", detail: "9 abonelik faturası", amount: 87_900, previousAmount: 91_200 },
    { label: "Ödeme komisyonları", source: "stripe", detail: "Eylül işlem ücretleri", amount: 62_300, previousAmount: 54_900 },
    { label: "Gözlemlenebilirlik", source: "gmail", detail: "Taahhüt aşımı dahil", amount: 59_100, previousAmount: 48_400 },
    { label: "Muhasebe ve hukuk", source: "gmail", detail: "2 serbest meslek makbuzu", amount: 42_000, previousAmount: 38_500 },
  ],

  history: [
    { label: "Nis", revenue: 1_742_000, expenses: 1_664_000 },
    { label: "May", revenue: 1_811_000, expenses: 1_702_000 },
    { label: "Haz", revenue: 1_868_000, expenses: 1_731_000 },
    { label: "Tem", revenue: 1_954_000, expenses: 1_758_000 },
    { label: "Ağu", revenue: 2_037_700, expenses: 1_789_600 },
    { label: "Eyl", revenue: 2_174_900, expenses: 1_823_200 },
  ],

  cashTrend: [
    { label: "Nis", cash: 3_402_000 },
    { label: "May", cash: 3_548_000 },
    { label: "Haz", cash: 3_671_000 },
    { label: "Tem", cash: 3_786_000 },
    { label: "Ağu", cash: 3_902_000 },
    { label: "Eyl", cash: 4_180_000 },
  ],

  receivables: [
    { id: "rec_2301", reference: "INV-2301", customer: "Nova Retail", amount: 142_000, due: "2026-10-12", overdueDays: 0, source: "stripe" },
    { id: "rec_2294", reference: "INV-2294", customer: "Arden Bilişim", amount: 96_500, due: "2026-09-18", overdueDays: 5, source: "gmail", note: "İki hatırlatma gönderildi" },
    { id: "rec_2288", reference: "INV-2288", customer: "Kavun Studio", amount: 74_800, due: "2026-09-02", overdueDays: 21, source: "gmail", note: "Muhasebe dönüş bekliyor" },
    { id: "rec_2299", reference: "INV-2299", customer: "Pelin Lojistik", amount: 58_000, due: "2026-09-28", overdueDays: 0, source: "stripe" },
    { id: "rec_2280", reference: "INV-2280", customer: "Mavi Tarım", amount: 46_200, due: "2026-08-20", overdueDays: 34, source: "gmail", note: "Ödeme planı teklif edildi" },
    { id: "rec_2305", reference: "INV-2305", customer: "Hexa Yazılım", amount: 38_400, due: "2026-10-05", overdueDays: 0, source: "stripe" },
    { id: "rec_2296", reference: "INV-2296", customer: "Orbit Ajans", amount: 30_400, due: "2026-09-22", overdueDays: 1, source: "gmail" },
  ],

  commitments: [
    {
      id: "com_observability",
      vendor: "Gözlemlenebilirlik",
      annual: 708_000,
      usage: 1.22,
      renewal: "2027-02-02",
      noticeBy: "2026-12-04",
      recommendation: "Kullanım bazlı pakete geçiş görüşmesi — aylık ≈₺18.000 tasarruf.",
      source: "notion",
    },
    {
      id: "com_storage",
      vendor: "Nesne depolama",
      annual: 576_000,
      usage: 0.78,
      renewal: "2026-11-14",
      noticeBy: "2026-10-15",
      recommendation: "Bir alt kademeye inmek — aylık ≈₺12.000 tasarruf.",
      source: "notion",
    },
    {
      id: "com_support",
      vendor: "Destek masası",
      annual: 216_000,
      usage: 0.65,
      renewal: "2026-11-30",
      noticeBy: "2026-11-15",
      recommendation: "40 koltuk taahhüdüne karşı 26 aktif kullanıcı — 30 koltuğa çekilebilir.",
      source: "notion",
    },
    {
      id: "com_enrichment",
      vendor: "Veri zenginleştirme",
      annual: 408_000,
      usage: 0.64,
      renewal: "2027-01-12",
      noticeBy: "2026-12-13",
      recommendation: "Sözleşme dönem ortası düşürmeye izin veriyor — 30 gün ihbar yeterli.",
      source: "notion",
    },
  ],

  leaks: [
    { id: "leak_failed", label: "Başarısız ödemeler", detail: "3 abonelik, yeniden deneme sırasında", amount: 28_400, source: "stripe" },
    { id: "leak_cards", label: "Süresi dolan kartlar", detail: "5 müşteri, 30 gün içinde", amount: 22_600, source: "stripe" },
    { id: "leak_unbilled", label: "Faturalanmamış aşım", detail: "Kullanım var, fatura kesilmemiş", amount: 13_800, source: "quickbooks" },
  ],

  reads: [
    { integrationId: "stripe", what: "Abonelik, tahsilat ve iade kayıtları", minutesAgo: 12 },
    { integrationId: "gmail", what: "Fatura ve tahsilat e-postaları", minutesAgo: 12 },
    { integrationId: "quickbooks", what: "Defter, bordro ve kategori dökümü", minutesAgo: 14 },
    { integrationId: "notion", what: "Tedarikçi anlaşmaları ve yenileme tarihleri", minutesAgo: 68 },
  ],

  missing: [
    "Wise hesabındaki iki döviz hareketinin kur karşılığı okunamadı; toplamlara dahil edilmedi.",
  ],
};

export function financeSnapshot(): FinanceSnapshot {
  return SNAPSHOT;
}

export function sum(lines: Array<{ amount: number }>): number {
  return lines.reduce((total, line) => total + line.amount, 0);
}

export function sumPrevious(lines: FinanceLine[]): number {
  return lines.reduce((total, line) => total + (line.previousAmount ?? 0), 0);
}

/** How a receivable is doing, by age alone — never by guesswork about intent. */
export type ReceivableState = "due" | "late" | "at-risk";

export function receivableState(receivable: Receivable): ReceivableState {
  if (receivable.overdueDays >= 15) return "at-risk";
  if (receivable.overdueDays > 0) return "late";
  return "due";
}

/**
 * Months of runway at the current average net burn.
 *
 * Returned as a number so the page can show the arithmetic it came from rather
 * than a figure nobody can reproduce. A month that made money has no runway
 * problem to report, so it returns null instead of a number that would read as
 * infinite confidence.
 */
export function runwayMonths(cash: number, burn: number): number | null {
  if (burn <= 0) return null;
  return cash / burn;
}
