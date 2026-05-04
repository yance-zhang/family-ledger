"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Locale, type Translations } from "./translations";

// ─── Context ──────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "zh",
  t: translations.zh,
  setLocale: () => {},
});

// ─── Locale detection ─────────────────────────────────────────────────────────

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "zh";
  const lang =
    navigator.language ||
    (navigator.languages && navigator.languages[0]) ||
    "zh";
  return lang.startsWith("zh") ? "zh" : "en";
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Default to "zh" for SSR; detect on client after hydration
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  return (
    <LocaleContext.Provider
      value={{ locale, t: translations[locale], setLocale }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Returns the full translations object for the current locale. */
export function useT(): Translations {
  return useContext(LocaleContext).t;
}

/** Returns the current locale code, e.g. "zh" | "en". */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

/** Returns a setter to manually switch locale. */
export function useSetLocale(): (locale: Locale) => void {
  return useContext(LocaleContext).setLocale;
}
