"use client";

import { useLocale, useSetLocale } from "@/i18n/LocaleContext";

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  const next = locale === "zh" ? "en" : "zh";
  const label = locale === "zh" ? "EN" : "中";

  return (
    <button
      type="button"
      aria-label={`Switch to ${next}`}
      onClick={() => setLocale(next)}
      className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
        />
      </svg>
    </button>
  );
}
