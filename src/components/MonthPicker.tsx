"use client";

import { useT } from "@/i18n/LocaleContext";

interface MonthPickerProps {
  value: string; // 'YYYY-MM'
  onChange: (month: string) => void;
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const t = useT();
  const [y, m] = value.split("-");
  const label = t.monthFormat(y, Number(m));

  return (
    <div className="flex items-center justify-between">
      <button
        aria-label={t.prevMonth}
        onClick={() => onChange(addMonths(value, -1))}
        className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <span className="text-base font-semibold text-zinc-800">{label}</span>

      <button
        aria-label={t.nextMonth}
        onClick={() => onChange(addMonths(value, 1))}
        className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
