// ─── Transaction ────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";
export type Currency = "RMB" | "CAD" | "USD";
export type CardType = "debit" | "credit";

export interface Transaction {
  id?: number; // auto-incremented primary key
  amount: number; // positive value in smallest currency unit (e.g. cents)
  currency?: Currency; // optional for backward compatibility, default RMB
  cardId?: number; // selected payment card
  category: string; // e.g. 'food', 'salary', 'transport'
  date: string; // ISO 8601 date string: 'YYYY-MM-DD'
  type: TransactionType;
  note?: string; // optional memo
  createdAt?: number; // timestamp for internal ordering
}

// ─── Card ────────────────────────────────────────────────────────────────────

export interface Card {
  id?: number;
  name: string;
  type: CardType;
  bank?: string;
  createdAt?: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id?: number;
  name: string;
  type: TransactionType;
  icon?: string; // emoji or icon identifier
  color?: string; // hex color for UI
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface Budget {
  id?: number;
  category: string;
  amount: number;
  month: string; // 'YYYY-MM'
}
