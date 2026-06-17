"use client";

export function moneyStringToCents(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 100) : 0;
  if (!value) return 0;
  const numericValue = Number(String(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(numericValue) ? Math.round(numericValue * 100) : 0;
}

export function centsToMoneyString(value: number | null | undefined) {
  const cents = Number.isFinite(value) ? value ?? 0 : 0;
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
