"use client";

import { useState, useEffect, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useLedgerStore } from "@/store";
import { useCards, useCategories } from "@/hooks";
import { useT } from "@/i18n/LocaleContext";
import type { Currency, Transaction, TransactionType } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionFormProps {
  /** When provided, the form operates in edit mode. */
  initialTransaction?: Transaction;
  /** Called after a transaction is successfully saved.
   *  Receives the 'YYYY-MM' month of the saved record so the caller
   *  can navigate to it if the transaction falls in a different month. */
  onSuccess?: (savedMonth: string) => void;
  className?: string;
}

// ─── Initial form state ───────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

interface FormFields {
  amount: string;
  currency: Currency;
  cardId: string;
  date: string;
  type: TransactionType;
  category: string;
  note: string;
}

const defaultFields = (): FormFields => ({
  amount: "",
  currency: "RMB",
  cardId: "",
  date: today(),
  type: "expense",
  category: "",
  note: "",
});

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionForm({
  initialTransaction,
  onSuccess,
  className,
}: TransactionFormProps) {
  const isEditMode = initialTransaction != null;

  const fieldsFromTx = (tx: Transaction): FormFields => ({
    amount: (tx.amount / 100).toFixed(2),
    currency: tx.currency ?? "RMB",
    cardId: tx.cardId != null ? String(tx.cardId) : "",
    date: tx.date,
    type: tx.type,
    category: tx.category,
    note: tx.note ?? "",
  });

  const [fields, setFields] = useState<FormFields>(
    initialTransaction ? fieldsFromTx(initialTransaction) : defaultFields(),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormFields, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  // Sync fields if the parent passes a different transaction to edit
  useEffect(() => {
    if (initialTransaction) {
      setFields(fieldsFromTx(initialTransaction));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTransaction?.id]);

  // Reactive category list filtered by the selected type
  const categories = useCategories(fields.type);
  const cards = useCards();
  const addTransaction = useLedgerStore((s) => s.addTransaction);
  const updateTransaction = useLedgerStore((s) => s.updateTransaction);
  const t = useT();

  // ── Field helpers ───────────────────────────────────────────────────────────

  const set = <K extends keyof FormFields>(key: K, value: FormFields[K]) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  // Reset category when type changes to avoid stale selections
  const handleTypeChange = (type: TransactionType) => {
    setFields((prev) => ({ ...prev, type, category: "" }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: typeof errors = {};

    const amountNum = parseFloat(fields.amount);
    if (!fields.amount || isNaN(amountNum) || amountNum <= 0) {
      next.amount = t.errorAmount;
    }
    if (!fields.date) next.date = t.errorDate;
    if (!fields.cardId) next.cardId = t.errorCard;
    if (!fields.category) next.category = t.errorCategory;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: Math.round(parseFloat(fields.amount) * 100),
        currency: fields.currency,
        cardId: Number(fields.cardId),
        date: fields.date,
        type: fields.type,
        category: fields.category,
        note: fields.note.trim() || undefined,
      };

      if (isEditMode && initialTransaction?.id != null) {
        await updateTransaction(initialTransaction.id, payload);
      } else {
        await addTransaction(payload);
      }

      const savedMonth = fields.date.slice(0, 7);
      if (!isEditMode) setFields(defaultFields());
      setErrors({});
      onSuccess?.(savedMonth);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm",
        className,
      )}
      noValidate
    >
      <h2 className="text-lg font-semibold text-zinc-900">
        {isEditMode ? t.editRecord : t.newRecord}
      </h2>

      {/* ── Type toggle ──────────────────────────────────────────────────── */}
      <div className="flex rounded-lg border border-zinc-200 p-1">
        {(["expense", "income"] as TransactionType[]).map((txType) => (
          <button
            key={txType}
            type="button"
            onClick={() => handleTypeChange(txType)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-medium transition-colors",
              fields.type === txType
                ? txType === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
                : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            {txType === "expense" ? t.expenseLabel : t.incomeLabel}
          </button>
        ))}
      </div>

      {/* ── Amount + Currency ────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">{t.amountLabel}</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={fields.amount}
            onChange={(e) => set("amount", e.target.value)}
            className={cn(
              "col-span-2",
              errors.amount && "border-red-400 focus-visible:ring-red-400",
            )}
          />
          <Select
            id="currency"
            value={fields.currency}
            onChange={(e) => set("currency", e.target.value as Currency)}
          >
            <option value="RMB">RMB</option>
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </Select>
        </div>
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* ── Date ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="date">{t.dateLabel}</Label>
        <Input
          id="date"
          type="date"
          value={fields.date}
          onChange={(e) => set("date", e.target.value)}
          className={cn(
            errors.date && "border-red-400 focus-visible:ring-red-400",
          )}
        />
        {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="card">{t.cardLabel}</Label>
        <Select
          id="card"
          value={fields.cardId}
          onChange={(e) => set("cardId", e.target.value)}
          className={cn(
            errors.cardId && "border-red-400 focus-visible:ring-red-400",
          )}
        >
          <option value="" disabled>
            {t.selectCardPlaceholder}
          </option>
          {cards.map((card) => (
            <option key={card.id} value={String(card.id)}>
              {card.name}（{card.type === "credit" ? t.creditCard : t.debitCard}
              ）
            </option>
          ))}
        </Select>
        {errors.cardId && (
          <p className="text-xs text-red-500">{errors.cardId}</p>
        )}
      </div>

      {/* ── Category ─────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="category">{t.categoryLabel}</Label>
        <Select
          id="category"
          value={fields.category}
          onChange={(e) => set("category", e.target.value)}
          className={cn(
            errors.category && "border-red-400 focus-visible:ring-red-400",
          )}
        >
          <option value="" disabled>
            {t.selectCategoryPlaceholder}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon}{" "}
              {t.categoryNames[c.name as keyof typeof t.categoryNames] ??
                c.name}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-xs text-red-500">{errors.category}</p>
        )}
      </div>

      {/* ── Note ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="note">{t.noteLabel}</Label>
        <Textarea
          id="note"
          placeholder={t.notePlaceholder}
          rows={2}
          value={fields.note}
          onChange={(e) => set("note", e.target.value)}
        />
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <Button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full",
          fields.type === "income"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600",
        )}
      >
        {submitting ? t.saving : isEditMode ? t.saveChanges : t.save}
      </Button>
    </form>
  );
}
