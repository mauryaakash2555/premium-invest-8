"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { Lang, TranslationKey } from "./i18n";
import { t as translate } from "./i18n";

export type LangContextValue = {
  lang: Lang;
  setLang: (next: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider(props: { value: { lang: Lang; setLang: (next: Lang) => void }; children: ReactNode }) {
  const { lang, setLang } = props.value;

  const ctx = useMemo<LangContextValue>(() => {
    return {
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    };
  }, [lang, setLang]);

  return <LangContext.Provider value={ctx}>{props.children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
