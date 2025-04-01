import 'server-only'

const dictionaries = {
    'de': () => import('dictionaries/de.json').then((module) => module.default),
    'en-GB': () => import('dictionaries/en-GB.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'en-GB' | 'de') =>
    dictionaries[locale]().catch((error) => {
        console.error(`Failed to load dictionary for locale: ${locale}`, error);
        throw error;
    })