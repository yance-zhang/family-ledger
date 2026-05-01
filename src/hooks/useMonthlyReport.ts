import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/db";
import type { Currency } from "@/types";

export interface MonthlyReportRow {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
  count: number;
}

interface MonthlyReportResult {
  rows: MonthlyReportRow[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  isLoading: boolean;
}

export function useMonthlyReport(
  currency: Currency,
  cardId?: number,
): MonthlyReportResult {
  const [rows, setRows] = useState<MonthlyReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      let transactions = await db.transactions
        .orderBy("date")
        .reverse()
        .toArray();

      transactions = transactions.filter(
        (t) => (t.currency ?? "RMB") === currency,
      );

      if (cardId != null) {
        transactions = transactions.filter((t) => t.cardId === cardId);
      }

      const monthMap = new Map<string, MonthlyReportRow>();

      for (const tx of transactions) {
        const month = tx.date.slice(0, 7);
        const current = monthMap.get(month) ?? {
          month,
          income: 0,
          expense: 0,
          balance: 0,
          count: 0,
        };

        if (tx.type === "income") {
          current.income += tx.amount;
        } else {
          current.expense += tx.amount;
        }

        current.balance = current.income - current.expense;
        current.count += 1;

        monthMap.set(month, current);
      }

      return Array.from(monthMap.values()).sort((a, b) =>
        a.month < b.month ? 1 : -1,
      );
    }).subscribe({
      next: (value) => {
        setRows(value);
        setIsLoading(false);
      },
      error: () => setIsLoading(false),
    });

    return () => subscription.unsubscribe();
  }, [currency, cardId]);

  const totalIncome = rows.reduce((sum, row) => sum + row.income, 0);
  const totalExpense = rows.reduce((sum, row) => sum + row.expense, 0);
  const totalBalance = totalIncome - totalExpense;

  return {
    rows,
    totalIncome,
    totalExpense,
    totalBalance,
    isLoading,
  };
}
