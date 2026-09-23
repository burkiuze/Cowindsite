/**
 * Money, formatted the way the ledger it came from writes it.
 *
 * Shared so the assistant's report and the finance surface can never disagree
 * about what a number looks like. A currency code the browser does not know
 * falls back to a plain number with the code beside it, because a report that
 * throws is worse than one that reads slightly plainer.
 */
export function moneyFormatter(currency: string, short = false): (value: number) => string {
  const options: Intl.NumberFormatOptions = short
    ? { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }
    : { style: "currency", currency, maximumFractionDigits: 0 };
  try {
    const format = new Intl.NumberFormat("tr-TR", options);
    return (value) => format.format(value);
  } catch {
    const plain = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
    return (value) => `${plain.format(value)} ${currency}`;
  }
}

/** Percentage change, or null when there is nothing to compare against. */
export function change(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function signed(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
