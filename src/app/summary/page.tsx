"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { Select } from "@/components/ui/select";
import { useCards, useMonthlyReport } from "@/hooks";
import { useLedgerStore } from "@/store/useLedgerStore";
import { db } from "@/db/db";
import { useT } from "@/i18n/LocaleContext";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Currency } from "@/types";
import type { MonthlyReportRow } from "@/hooks/useMonthlyReport";

function symbol(currency: Currency) {
  if (currency === "CAD") return "C$";
  if (currency === "USD") return "$";
  return "¥";
}

function formatAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function SummaryPage() {
  const cards = useCards();
  const t = useT();
  const [currency, setCurrency] = useState<Currency>("RMB");
  const [selectedCardId, setSelectedCardId] = useState<string>("all");

  const activeCardId =
    selectedCardId === "all" ? undefined : Number(selectedCardId);
  const { rows, totalIncome, totalExpense, totalBalance, isLoading } =
    useMonthlyReport(currency, activeCardId);

  const currSymbol = symbol(currency);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-zinc-50 pb-10">
      <header className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-zinc-900">
            {t.monthlySummary}
          </h1>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <Link
              href="/"
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              {t.backHome}
            </Link>
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <CurrencySwitcher value={currency} onChange={setCurrency} />
        </div>

        <div className="mt-3">
          <Select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="all">{t.allCards}</option>
            {cards.map((card) => (
              <option key={card.id} value={String(card.id)}>
                {card.name}
              </option>
            ))}
          </Select>
        </div>
      </header>

      <main className="space-y-4 px-4 pt-4">
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-zinc-500">{t.totalIncome}</p>
            <p className="mt-1 text-sm font-semibold text-green-600">
              {currSymbol}
              {formatAmount(totalIncome)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-zinc-500">{t.totalExpense}</p>
            <p className="mt-1 text-sm font-semibold text-red-600">
              {currSymbol}
              {formatAmount(totalExpense)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-zinc-500">{t.totalBalance}</p>
            <p
              className={`mt-1 text-sm font-semibold ${
                totalBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {currSymbol}
              {formatAmount(totalBalance)}
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t.monthlyBreakdown}
          </h2>

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              {t.loadingDots}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              {t.noData}
            </div>
          ) : (
            rows.map((row) => (
              <MonthRowCard
                key={row.month}
                row={row}
                currency={currency}
                activeCardId={activeCardId}
                currSymbol={currSymbol}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

// ── Per-row card with carry state ─────────────────────────────────────────────

type CarryStatus =
  | "idle"
  | "loading"
  | "done"
  | "no_surplus"
  | "already_carried";

function MonthRowCard({
  row,
  currency,
  activeCardId,
  currSymbol,
}: {
  row: MonthlyReportRow;
  currency: Currency;
  activeCardId: number | undefined;
  currSymbol: string;
}) {
  const carryBalanceToNextMonth = useLedgerStore(
    (s) => s.carryBalanceToNextMonth,
  );
  const [carryStatus, setCarryStatus] = useState<CarryStatus>("idle");
  const t = useT();

  // Check on mount and whenever filters change whether this month was already carried
  useEffect(() => {
    let cancelled = false;
    async function check() {
      const [y, m] = row.month.split("-").map(Number);
      const nextMonth =
        m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
      const nextMonthFirst = `${nextMonth}-01`;
      const existing = await db.transactions
        .where("date")
        .equals(nextMonthFirst)
        .filter(
          (t) =>
            t.category === "结余结转" &&
            (t.currency ?? "RMB") === currency &&
            (activeCardId == null || t.cardId === activeCardId),
        )
        .first();
      if (!cancelled) {
        setCarryStatus(existing ? "already_carried" : "idle");
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [row.month, currency, activeCardId]);

  async function handleCarry() {
    setCarryStatus("loading");
    const result = await carryBalanceToNextMonth(
      row.month,
      currency,
      activeCardId,
    );
    // Permanently lock: do not reset to idle after carry or if already carried
    setCarryStatus(result.success ? "done" : (result.reason ?? "idle"));
  }

  const carryLabel =
    carryStatus === "loading"
      ? t.carrying
      : carryStatus === "done"
        ? t.carried
        : carryStatus === "already_carried"
          ? t.alreadyCarried
          : carryStatus === "no_surplus"
            ? t.noSurplus
            : t.carry;

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800">
          {(() => {
            const [y, m] = row.month.split("-");
            return t.monthFormat(y, Number(m));
          })()}
        </h3>
        <span className="text-xs text-zinc-400">
          {t.recordCount(row.count)}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="grid grid-cols-3 gap-4 text-xs flex-1">
          <div>
            <p className="text-zinc-500">{t.income}</p>
            <p className="mt-1 font-semibold text-green-600">
              {currSymbol}
              {formatAmount(row.income)}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">{t.expense}</p>
            <p className="mt-1 font-semibold text-red-600">
              {currSymbol}
              {formatAmount(row.expense)}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">{t.balance}</p>
            <p
              className={`mt-1 font-semibold ${
                row.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {currSymbol}
              {formatAmount(row.balance)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCarry}
          disabled={
            carryStatus === "loading" ||
            carryStatus === "done" ||
            carryStatus === "already_carried"
          }
          className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carryLabel}
        </button>
      </div>
    </article>
  );
}
