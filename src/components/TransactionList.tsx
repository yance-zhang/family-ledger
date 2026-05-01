"use client";

import { cn } from "@/lib/utils";
import { useLedgerStore } from "@/store";
import { useCards, useTransactions } from "@/hooks";
import type { Currency, Transaction } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currencySymbol(currency?: Currency) {
  if (currency === "CAD") return "C$";
  if (currency === "USD") return "$";
  return "¥";
}

function formatAmount(cents: number, currency?: Currency) {
  return `${currencySymbol(currency)}${(cents / 100).toFixed(2)}`;
}

// ─── Single row ───────────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  cardName,
}: {
  tx: Transaction;
  cardName?: string;
}) {
  const deleteTransaction = useLedgerStore((s) => s.deleteTransaction);
  const isIncome = tx.type === "income";

  return (
    <li className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Category badge */}
        <span className="text-xl">
          {/* icon loaded from category, fallback */}💰
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-800">{tx.category}</p>
          <p className="text-xs text-zinc-400">
            {tx.date}
            {cardName ? ` · ${cardName}` : ""}
            {tx.note ? ` · ${tx.note}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-sm font-semibold",
            isIncome ? "text-green-500" : "text-red-500",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(tx.amount, tx.currency)}
        </span>
        <button
          aria-label="删除"
          onClick={() => tx.id != null && deleteTransaction(tx.id)}
          className="rounded p-1 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────

interface TransactionListProps {
  month: string; // 'YYYY-MM'
  currency: Currency;
  cardId?: number;
}

export function TransactionList({
  month,
  currency,
  cardId,
}: TransactionListProps) {
  const cards = useCards();
  const cardNameMap = new Map(cards.map((card) => [card.id, card.name]));
  const { transactions, isLoading } = useTransactions(
    month,
    undefined,
    currency,
    cardId,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-zinc-400 text-sm">
        加载中…
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-zinc-400">
        <span className="text-4xl">📭</span>
        <p className="text-sm">本月暂无记录</p>
      </div>
    );
  }

  // Group by date
  const groups = transactions.reduce<Record<string, Transaction[]>>(
    (acc, tx) => {
      (acc[tx.date] ??= []).push(tx);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([date, items]) => (
        <section key={date}>
          <p className="mb-2 px-1 text-xs font-medium text-zinc-400">{date}</p>
          <ul className="space-y-2">
            {items.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                cardName={tx.cardId ? cardNameMap.get(tx.cardId) : undefined}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
