"use client";

import Link from "next/link";
import { useState } from "react";
import type { Currency } from "@/types";
import { useCards } from "@/hooks";
import { useT } from "@/i18n/LocaleContext";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { MonthlySummary } from "@/components/MonthlySummary";
import { MonthPicker } from "@/components/MonthPicker";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { CardManager } from "@/components/CardManager";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Select } from "@/components/ui/select";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function HomePage() {
  const cards = useCards();
  const t = useT();
  const [month, setMonth] = useState(currentMonth());
  const [currency, setCurrency] = useState<Currency>("RMB");
  const [selectedCardId, setSelectedCardId] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [showCardManager, setShowCardManager] = useState(false);

  const activeCardId =
    selectedCardId === "all" ? undefined : Number(selectedCardId);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-zinc-50 pb-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm">
        <MonthPicker value={month} onChange={setMonth} />
        <div className="mt-3 flex justify-center">
          <CurrencySwitcher value={currency} onChange={setCurrency} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="col-span-2"
          >
            <option value="all">{t.allCards}</option>
            {cards.map((card) => (
              <option key={card.id} value={String(card.id)}>
                {card.name}
              </option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => setShowCardManager(true)}
            className="rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {t.manageCards}
          </button>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <LocaleSwitcher />
          <Link
            href="/summary"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {t.viewSummary}
          </Link>
        </div>
      </header>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <section className="px-4 pt-4">
        <MonthlySummary
          month={month}
          currency={currency}
          cardId={activeCardId}
        />
      </section>

      {/* ── Transaction list ──────────────────────────────────────────────── */}
      <section className="px-4 pt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {t.transactionsSection}
        </h2>
        <TransactionList
          month={month}
          currency={currency}
          cardId={activeCardId}
        />
      </section>

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      <button
        aria-label={t.addRecord}
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
        >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* ── Bottom drawer (add transaction) ───────────────────────────────── */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
            <div className="mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-zinc-50 shadow-xl">
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-zinc-300" />
              </div>
              <div className="overflow-y-auto px-4 pb-8 overscroll-contain">
                <TransactionForm
                  onSuccess={(savedMonth) => {
                    setShowForm(false);
                    // Navigate to the month the record was saved in,
                    // so cross-month entries (e.g. Apr 1 entered in May view)
                    // are immediately visible.
                    setMonth(savedMonth);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {showCardManager && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCardManager(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
            <div className="mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-zinc-50 shadow-xl">
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-zinc-300" />
              </div>
              <div className="overflow-y-auto px-4 pb-8 overscroll-contain">
                <CardManager />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
