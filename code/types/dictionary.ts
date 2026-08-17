type contextMenuDictItem = {
  title: string;
  tooltip: string;
};

export type SupportedLanguage = "en" | "en-GB" | "de";
export type LanguageDictionary = Record<SupportedLanguage, string>;

export type Dictionary = {
  lang: SupportedLanguage;
  action: Record<string, string>;
  form: Record<string, string>;
  map: {
    title: Record<string, string>;
    tooltip: Record<string, string>;
  };
  context: Record<string, contextMenuDictItem>;
  message: Record<string, string>;
  nav: {
    caption: Record<string, string>;
    title: Record<string, string>;
    tooltip: Record<string, string>;
  };
  title: Record<string, string>;
  translate?: (value: LanguageDictionary) => string;
  toNumberDisplay?: (value: string | number | readonly string[] | null | undefined) => string;
  normaliseNumber?: (value: string) => string;
};