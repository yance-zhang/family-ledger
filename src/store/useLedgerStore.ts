import { create } from "zustand";
import { db } from "@/db/db";
import type { Card, CardType, Currency, Transaction } from "@/types";

// ─── State Shape ──────────────────────────────────────────────────────────────

interface LedgerState {
  // ── State ──────────────────────────────────────────────────────────────────
  transactions: Transaction[];
  cards: Card[];
  isLoading: boolean;
  error: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  fetchTransactions: (options?: FetchOptions) => Promise<void>;
  addTransaction: (data: TransactionInput) => Promise<number>;
  updateTransaction: (
    id: number,
    data: Partial<TransactionInput>,
  ) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  fetchCards: () => Promise<void>;
  addCard: (data: CardInput) => Promise<number>;
  deleteCard: (id: number) => Promise<void>;
  carryBalanceToNextMonth: (
    month: string,
    currency: Currency,
    cardId?: number,
  ) => Promise<{ success: boolean; reason?: "no_surplus" | "already_carried" }>;
}

export interface TransactionInput {
  amount: number;
  currency: Currency;
  cardId?: number;
  category: string;
  date: string;
  type: "income" | "expense";
  note?: string;
}

export interface CardInput {
  name: string;
  type: CardType;
  bank?: string;
}

export interface FetchOptions {
  month?: string; // 'YYYY-MM' — filter by month if provided
  type?: "income" | "expense";
  currency?: Currency;
  cardId?: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useLedgerStore = create<LedgerState>((set, get) => ({
  transactions: [],
  cards: [],
  isLoading: false,
  error: null,

  // ── Fetch ─────────────────────────────────────────────────────────────────
  fetchTransactions: async (options) => {
    set({ isLoading: true, error: null });
    try {
      let collection = db.transactions.orderBy("date").reverse();

      // Apply optional filters after collecting
      let results = await collection.toArray();

      if (options?.month) {
        results = results.filter((t) => t.date.startsWith(options.month!));
      }
      if (options?.type) {
        results = results.filter((t) => t.type === options.type);
      }
      if (options?.currency) {
        results = results.filter(
          (t) => (t.currency ?? "RMB") === options.currency,
        );
      }
      if (options?.cardId != null) {
        results = results.filter((t) => t.cardId === options.cardId);
      }

      set({ transactions: results, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  // ── Add ───────────────────────────────────────────────────────────────────
  addTransaction: async (data) => {
    const record: Transaction = {
      ...data,
      currency: data.currency,
      cardId: data.cardId,
      createdAt: Date.now(),
    };
    const id = await db.transactions.add(record);
    // Optimistic prepend — keeps list sorted without a full refetch
    set((state) => ({
      transactions: [{ ...record, id } as Transaction, ...state.transactions],
    }));
    return id as number;
  },

  // ── Update ────────────────────────────────────────────────────────────────
  updateTransaction: async (id, data) => {
    await db.transactions.update(id, data);
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t,
      ),
    }));
  },

  // ── Delete ────────────────────────────────────────────────────────────────
  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  fetchCards: async () => {
    const cards = await db.cards.orderBy("createdAt").reverse().toArray();
    set({ cards });
  },

  addCard: async (data) => {
    const record: Card = {
      ...data,
      bank: data.bank?.trim() || undefined,
      createdAt: Date.now(),
    };
    const id = await db.cards.add(record);
    set((state) => ({ cards: [{ ...record, id } as Card, ...state.cards] }));
    return id as number;
  },

  deleteCard: async (id) => {
    await db.cards.delete(id);
    set((state) => ({ cards: state.cards.filter((c) => c.id !== id) }));
  },

  carryBalanceToNextMonth: async (month, currency, cardId) => {
    const allTxs = await db.transactions.toArray();
    const monthTxs = allTxs.filter(
      (t) =>
        t.date.startsWith(month) &&
        (t.currency ?? "RMB") === currency &&
        (cardId == null || t.cardId === cardId),
    );

    const income = monthTxs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    if (balance <= 0) return { success: false, reason: "no_surplus" };

    const [y, m] = month.split("-").map(Number);
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
          (cardId == null || t.cardId === cardId),
      )
      .first();

    if (existing) return { success: false, reason: "already_carried" };

    await db.transactions.add({
      amount: balance,
      currency,
      cardId,
      category: "结余结转",
      date: nextMonthFirst,
      type: "income",
      note: `${month} 月结余结转`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
}));
