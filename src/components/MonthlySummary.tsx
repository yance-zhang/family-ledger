"use client";

import { useMonthlyTotals } from "@/hooks";
import { useT } from "@/i18n/LocaleContext";
import type { Currency } from "@/types";

function formatYuan(cents: number) {
  return (cents / 100).toFixed(2);
}

interface MonthlySummaryProps {
  month: string; // 'YYYY-MM'
  currency: Currency;
  cardId?: number;
}

export function MonthlySummary({
  month,
  currency,
  cardId,
}: MonthlySummaryProps) {
  const t = useT();
  const { income, expense, balance } = useMonthlyTotals(
    month,
    currency,
    cardId,
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card
        label={t.income}
        value={formatYuan(income)}
        currency={currency}
        color="text-green-500"
      />
      <Card
        label={t.expense}
        value={formatYuan(expense)}
        currency={currency}
        color="text-red-500"
      />
      <Card
        label={t.balance}
        value={formatYuan(balance)}
        currency={currency}
        color={balance >= 0 ? "text-green-500" : "text-red-500"}
      />
    </div>
  );
}

function Card({
  label,
  value,
  currency,
  color,
}: {
  label: string;
  value: string;
  currency: Currency;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`mt-1 text-base font-semibold ${color}`}>
        {currency === "CAD" ? "C$" : currency === "USD" ? "$" : "¥"}
        {value}
      </span>
    </div>
  );
}
