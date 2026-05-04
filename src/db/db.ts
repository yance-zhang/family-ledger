import Dexie, { type EntityTable } from "dexie";
import type { Transaction, Category, Budget, Card } from "@/types";

// ─── Database Schema ─────────────────────────────────────────────────────────

class FamilyLedgerDB extends Dexie {
  transactions!: EntityTable<Transaction, "id">;
  categories!: EntityTable<Category, "id">;
  budgets!: EntityTable<Budget, "id">;
  cards!: EntityTable<Card, "id">;

  constructor() {
    super("FamilyLedgerDB");

    /**
     * Version history — never mutate existing versions, only add new ones.
     *
     * v1 – initial schema
     *   transactions: primary key `++id`, indexed on date, type, category
     *   categories:   primary key `++id`, unique name per type
     *   budgets:      primary key `++id`, compound index [month+category]
     */
    this.version(1).stores({
      transactions: "++id, date, type, category, createdAt",
      categories: "++id, &name, type",
      budgets: "++id, month, [month+category]",
    });

    // v2 - add currency index and backfill existing records with RMB
    this.version(2)
      .stores({
        transactions: "++id, date, type, currency, category, createdAt",
        categories: "++id, &name, type",
        budgets: "++id, month, [month+category]",
      })
      .upgrade((tx) =>
        tx
          .table("transactions")
          .toCollection()
          .modify((record: Transaction) => {
            if (!record.currency) {
              record.currency = "RMB";
            }
          }),
      );

    // v3 - add cards table and cardId index on transactions
    this.version(3)
      .stores({
        transactions: "++id, date, type, currency, cardId, category, createdAt",
        categories: "++id, &name, type",
        budgets: "++id, month, [month+category]",
        cards: "++id, &name, type, createdAt",
      })
      .upgrade(async (tx) => {
        const cardsTable = tx.table("cards");
        const count = await cardsTable.count();
        if (count === 0) {
          await cardsTable.bulkAdd([
            {
              name: "招商银行借记卡",
              type: "debit",
              bank: "招商银行",
              createdAt: Date.now(),
            },
            {
              name: "交通银行信用卡",
              type: "credit",
              bank: "交通银行",
              createdAt: Date.now(),
            },
          ] as Card[]);
        }
      });

    // v4 - add "结余结转" income category for monthly balance carryover
    this.version(4).upgrade(async (tx) => {
      const cats = tx.table("categories");
      const existing = await cats.where("name").equals("结余结转").first();
      if (!existing) {
        await cats.add({
          name: "结余结转",
          type: "income",
          icon: "🔄",
          color: "#6366F1",
        });
      }
    });
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const db = new FamilyLedgerDB();

// ─── Seed default categories (runs once on first open) ───────────────────────

db.on("populate", async () => {
  const defaults: Omit<Category, "id">[] = [
    // expense
    { name: "餐饮", type: "expense", icon: "🍜", color: "#F97316" },
    { name: "交通", type: "expense", icon: "🚌", color: "#3B82F6" },
    { name: "购物", type: "expense", icon: "🛍️", color: "#EC4899" },
    { name: "居家", type: "expense", icon: "🏠", color: "#8B5CF6" },
    { name: "医疗", type: "expense", icon: "💊", color: "#EF4444" },
    { name: "娱乐", type: "expense", icon: "🎮", color: "#10B981" },
    { name: "教育", type: "expense", icon: "📚", color: "#F59E0B" },
    { name: "其他支出", type: "expense", icon: "📦", color: "#6B7280" },
    // income
    { name: "工资", type: "income", icon: "💼", color: "#22C55E" },
    { name: "奖金", type: "income", icon: "🎁", color: "#16A34A" },
    { name: "理财", type: "income", icon: "📈", color: "#0EA5E9" },
    { name: "其他收入", type: "income", icon: "💰", color: "#84CC16" },
    { name: "结余结转", type: "income", icon: "🔄", color: "#6366F1" },
  ];

  const defaultCards: Omit<Card, "id">[] = [
    {
      name: "招商银行借记卡",
      type: "debit",
      bank: "招商银行",
      createdAt: Date.now(),
    },
    {
      name: "交通银行信用卡",
      type: "credit",
      bank: "交通银行",
      createdAt: Date.now(),
    },
  ];

  await db.categories.bulkAdd(defaults as Category[]);
  await db.cards.bulkAdd(defaultCards as Card[]);
});
