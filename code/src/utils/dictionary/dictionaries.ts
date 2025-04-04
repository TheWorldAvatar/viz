import 'server-only';
import { Dictionary } from 'types/dictionary';

const dictionaries: Record<string, () => Promise<Dictionary>> = {
    'de-DE': () => import('utils/dictionary/data/de-DE.json').then((module) => module.default),
    'en-GB': () => import('utils/dictionary/data/en-GB.json').then((module) => module.default),
};

export const getDictionary = async (locale: string): Promise<Dictionary> =>
    dictionaries[locale]().catch((error) => {
        console.error(`Failed to load dictionary for locale: ${locale}`, error);
        throw error;
    });