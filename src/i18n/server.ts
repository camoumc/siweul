import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/fr";
import fr from "./dictionaries/fr";
import en from "./dictionaries/en";
import es from "./dictionaries/es";
import ar from "./dictionaries/ar";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en, es, ar };

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("siweul_locale")?.value;
  if (value && isValidLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export async function getServerDictionary(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getServerLocale();
  return { locale, dict: getDictionary(locale) };
}
