/**
 * Formats a monetary integer in base kobo/cents into a standard Nigerian Naira (NGN) string.
 *
 * Requirements (UI Context Spec 5, §6):
 * - Backend sends all amounts in base kobo/cents (e.g. 150000 kobo = ₦1,500).
 * - Avoids floating point precision drift.
 * - By default, omits trailing `.00` for whole amounts, or optionally formats with fixed decimals.
 *
 * @param amountInKobo - Integer representation of the amount in kobo (e.g., 150000 -> ₦1,500)
 * @param options - Optional formatting configuration
 * @returns Formatted currency string with the "₦" symbol (e.g., "₦1,500")
 */
export interface FormatCurrencyOptions {
  /**
   * Whether to always show kobo decimals (e.g. ₦1,500.00). Defaults to false (only shows when non-zero or requested).
   */
  showDecimals?: boolean;
  /**
   * Custom fallback if amount is invalid, undefined, or NaN. Defaults to "₦0".
   */
  fallback?: string;
  /**
   * Currency symbol prefix. Defaults to "₦".
   */
  symbol?: string;
}

export function formatCurrency(
  amountInKobo: number | bigint | string | null | undefined,
  options?: FormatCurrencyOptions
): string {
  const { showDecimals = false, fallback = "₦0", symbol = "₦" } = options ?? {};

  if (amountInKobo === null || amountInKobo === undefined) {
    return fallback;
  }

  const numericKobo = typeof amountInKobo === "string" ? Number(amountInKobo) : Number(amountInKobo);

  if (Number.isNaN(numericKobo)) {
    return fallback;
  }

  const nairaValue = numericKobo / 100;

  // Determine whether to show 2 decimal places:
  // Show if explicit option is true OR if there is an active non-zero kobo remainder (e.g., 150050 kobo = ₦1,500.50)
  const hasKoboFraction = Math.abs(numericKobo % 100) > 0;
  const fractionDigits = showDecimals || hasKoboFraction ? 2 : 0;

  const formattedNumber = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(nairaValue);

  return `${symbol}${formattedNumber}`;
}

/**
 * Converts a major unit Naira input (e.g. "1500" or 1500) to base kobo integer for API dispatch.
 * Example: 1500 -> 150000
 */
export function nairaToKobo(nairaAmount: number | string): number {
  const numeric = typeof nairaAmount === "string" ? Number(nairaAmount.replace(/[^0-9.-]+/g, "")) : nairaAmount;
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.round(numeric * 100);
}

/**
 * Converts base kobo to standard major Naira units.
 * Example: 150000 -> 1500
 */
export function koboToNaira(koboAmount: number | string): number {
  const numeric = typeof koboAmount === "string" ? Number(koboAmount) : koboAmount;
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return numeric / 100;
}