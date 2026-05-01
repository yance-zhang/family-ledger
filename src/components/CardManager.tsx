"use client";

import { useState, type FormEvent } from "react";
import { useCards } from "@/hooks";
import { useLedgerStore } from "@/store";
import type { CardType } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface CardManagerProps {
  className?: string;
}

export function CardManager({ className }: CardManagerProps) {
  const cards = useCards();
  const addCard = useLedgerStore((s) => s.addCard);
  const deleteCard = useLedgerStore((s) => s.deleteCard);

  const [name, setName] = useState("");
  const [type, setType] = useState<CardType>("debit");
  const [bank, setBank] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await addCard({
        name: name.trim(),
        type,
        bank: bank.trim() || undefined,
      });
      setName("");
      setType("debit");
      setBank("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <h3 className="text-sm font-semibold text-zinc-800">新增卡片</h3>

        <div className="space-y-1">
          <Label htmlFor="card-name">卡片名称</Label>
          <Input
            id="card-name"
            placeholder="例如：招商银行储蓄卡"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="card-type">卡片类型</Label>
            <Select
              id="card-type"
              value={type}
              onChange={(e) => setType(e.target.value as CardType)}
            >
              <option value="debit">借记卡</option>
              <option value="credit">信用卡</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="card-bank">银行（可选）</Label>
            <Input
              id="card-bank"
              placeholder="例如：招商银行"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full"
        >
          {submitting ? "保存中..." : "添加卡片"}
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        <h3 className="px-1 text-sm font-semibold text-zinc-800">已有卡片</h3>
        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white p-4 text-center text-sm text-zinc-500">
            暂无卡片
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-zinc-800">{card.name}</p>
                <p className="text-xs text-zinc-500">
                  {card.type === "credit" ? "信用卡" : "借记卡"}
                  {card.bank ? ` · ${card.bank}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="删除卡片"
                onClick={() => card.id && deleteCard(card.id)}
                className="rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
