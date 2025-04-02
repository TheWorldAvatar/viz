import { Dictionary } from 'types/dictionary';
import { getDictionary } from 'utils/dictionary/dictionaries';
import { DictionaryProvider } from 'utils/dictionary/DictionaryContext';

export async function generateStaticParams() {
    return [
        { lang: 'en-GB' },
        { lang: 'de' },
    ];
}

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { lang: string };
}) {
    const dictionary: Dictionary = await getDictionary(params.lang as 'en-GB' | 'de');

    return (
        <html lang={params.lang}>
            <body>
                <DictionaryProvider dictionary={dictionary}>
                    {children}
                </DictionaryProvider>
            </body>
        </html>
    );
}