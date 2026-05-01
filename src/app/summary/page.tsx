"use client";

import Link from "next/link";
import { useState } from "react";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { Select } from "@/components/ui/select";
import { useCards, useMonthlyReport } from "@/hooks";
import type { Currency } from "@/types";

function symbol(currency: Currency) {
  if (currency === "CAD") return "C$";
  if (currency === "USD") return "$";
  return "¥";
}

function formatAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

function formatMonth(month: string) {
  const [year, mm] = month.split("-");
  return `${year}年${Number(mm)}月`;
}

export default function SummaryPage() {
  const cards = useCards();
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
          <h1 className="text-base font-semibold text-zinc-900">月汇总</h1>
          <Link
            href="/"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            返回首页
          </Link>
        </div>

        <div className="mt-3 flex justify-center">
          <CurrencySwitcher value={currency} onChange={setCurrency} />
        </div>

        <div className="mt-3">
          <Select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="all">全部卡片</option>
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
            <p className="text-xs text-zinc-500">累计收入</p>
            <p className="mt-1 text-sm font-semibold text-green-600">
              {currSymbol}
              {formatAmount(totalIncome)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-zinc-500">累计支出</p>
            <p className="mt-1 text-sm font-semibold text-red-600">
              {currSymbol}
              {formatAmount(totalExpense)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-zinc-500">累计结余</p>
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
            每月累计收支
          </h2>

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              加载中...
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              暂无记录
            </div>
          ) : (
            rows.map((row) => (
              <article
                key={row.month}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    {formatMonth(row.month)}
                  </h3>
                  <span className="text-xs text-zinc-400">{row.count} 笔</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-500">收入</p>
                    <p className="mt-1 font-semibold text-green-600">
                      {currSymbol}
                      {formatAmount(row.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">支出</p>
                    <p className="mt-1 font-semibold text-red-600">
                      {currSymbol}
                      {formatAmount(row.expense)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">结余</p>
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
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
