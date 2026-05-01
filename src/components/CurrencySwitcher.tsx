"use client";

import { cn } from "@/lib/utils";
import type { Currency } from "@/types";

interface CurrencySwitcherProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

const options: Currency[] = ["RMB", "CAD", "USD"];

export function CurrencySwitcher({ value, onChange }: CurrencySwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            value === option
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
