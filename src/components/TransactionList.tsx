"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLedgerStore } from "@/store";
import { useCards, useTransactions } from "@/hooks";
import { TransactionForm } from "@/components/TransactionForm";
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

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  tx,
  onConfirm,
  onCancel,
}: {
  tx: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-base font-semibold text-zinc-900">确认删除</h3>
          <p className="mt-2 text-sm text-zinc-500">
            确定要删除「{tx.category}」这条记录吗？此操作不可撤销。
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Single row ───────────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  cardName,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  cardName?: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}) {
  const isIncome = tx.type === "income";

  return (
    <li className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl shrink-0">💰</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800">{tx.category}</p>
          <p className="truncate text-xs text-zinc-400">
            {tx.date}
            {cardName ? ` · ${cardName}` : ""}
            {tx.note ? ` · ${tx.note}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span
          className={cn(
            "text-sm font-semibold",
            isIncome ? "text-green-500" : "text-red-500",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(tx.amount, tx.currency)}
        </span>

        {/* Edit button */}
        <button
          aria-label="编辑"
          onClick={() => onEdit(tx)}
          className="rounded p-1 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          aria-label="删除"
          onClick={() => onDelete(tx)}
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
  const deleteTransaction = useLedgerStore((s) => s.deleteTransaction);

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

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

  async function handleDeleteConfirm() {
    if (deletingTx?.id != null) {
      await deleteTransaction(deletingTx.id);
    }
    setDeletingTx(null);
  }

  return (
    <>
      <div className="space-y-4">
        {Object.entries(groups).map(([date, items]) => (
          <section key={date}>
            <p className="mb-2 px-1 text-xs font-medium text-zinc-400">
              {date}
            </p>
            <ul className="space-y-2">
              {items.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  cardName={tx.cardId ? cardNameMap.get(tx.cardId) : undefined}
                  onEdit={setEditingTx}
                  onDelete={setDeletingTx}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* ── Edit bottom sheet ──────────────────────────────────────────────── */}
      {editingTx && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingTx(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
            <div className="mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-zinc-50 shadow-xl">
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-zinc-300" />
              </div>
              <div className="overflow-y-auto px-4 pb-8 overscroll-contain">
                <TransactionForm
                  initialTransaction={editingTx}
                  onSuccess={() => setEditingTx(null)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm modal ───────────────────────────────────────────── */}
      {deletingTx && (
        <DeleteConfirmModal
          tx={deletingTx}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTx(null)}
        />
      )}
    </>
  );
}
