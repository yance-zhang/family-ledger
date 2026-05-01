import { useState, useEffect } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/db";
import type { Currency, Transaction } from "@/types";

/**
 * Reactive hook — subscribes to the Dexie live query for transactions.
 * Any IndexedDB write (from any tab or component) will automatically
 * re-render consuming components without manual refetch.
 *
 * @param month  Optional 'YYYY-MM' filter
 * @param type   Optional 'income' | 'expense' filter
 */
export function useTransactions(
  month?: string,
  type?: "income" | "expense",
  currency?: Currency,
  cardId?: number,
): { transactions: Transaction[]; isLoading: boolean } {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      let results = await db.transactions.orderBy("date").reverse().toArray();

      if (month) {
        results = results.filter((t) => t.date.startsWith(month));
      }
      if (type) {
        results = results.filter((t) => t.type === type);
      }
      if (currency) {
        results = results.filter((t) => (t.currency ?? "RMB") === currency);
      }
      if (cardId != null) {
        results = results.filter((t) => t.cardId === cardId);
      }

      return results;
    }).subscribe({
      next: (results) => {
        setTransactions(results);
        setIsLoading(false);
      },
      error: () => setIsLoading(false),
    });

    return () => subscription.unsubscribe();
  }, [month, type, currency, cardId]);

  return { transactions, isLoading };
}

/**
 * Derive monthly summary totals from a live transaction list.
 */
export function useMonthlyTotals(
  month: string,
  currency: Currency,
  cardId?: number,
) {
  const { transactions } = useTransactions(month, undefined, currency, cardId);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expense, balance: income - expense };
}
