import "server-only";
import { Dictionary } from "types/dictionary";

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  de: () =>
    import("utils/dictionary/data/de.json").then((module) => module.default),
  en: () =>
    import("utils/dictionary/data/en.json").then((module) => module.default),
};

export const getDictionary = async (locale: string): Promise<Dictionary> =>
  dictionaries[locale]().catch((error) => {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    throw error;
  });
