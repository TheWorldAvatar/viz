/**
 * Sets a template for all generated HTML files.
 */

import 'ui/css/globals.css';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Dosis } from 'next/font/google';

import OptionalPages from 'io/config/optional-pages';
import SettingsStore from 'io/config/settings';
import { UISettings } from 'types/settings';
import GlobalContainer from 'ui/global-container';
import { getDictionary } from 'utils/dictionary/dictionaries';
import { DictionaryProvider } from 'utils/dictionary/DictionaryContext';
import { Dictionary } from 'types/dictionary';

/**
 * Performs initialisation when the platform is
 * first loaded. Runs on the server.
 */
function initialise() {
    SettingsStore.readInitialisationSettings();
    // Cache contents of optional static pages
    OptionalPages.loadPages();
}

const dosis = Dosis({
    subsets: ['latin'],
    display: 'swap',
})

export async function generateStaticParams() {
    return [
        { lang: 'en-GB' },
        { lang: 'de-DE' },
    ];
}

/**
 * Define a root layout template to be used for all generated HTML files.
 * 
 * @param children React child elements to add to generated page.
 * 
 * @returns generated React nodes.
 */
export default async function RootLayout({ children, modal, params }: Readonly<{
    children: React.ReactNode;
    modal: React.ReactNode;
    params: Promise<{ lang: string }>;
}>) {
    // Initialise static content
    initialise();
    // Get settings to pass to Toolbar
    const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
    const { lang } = await params;
    const dictionary: Dictionary = await getDictionary(lang);

    // Root element containing all children.
    return (
        <html lang={lang} className={dosis.className}>
            <body>
                <DictionaryProvider dictionary={dictionary}>
                    <GlobalContainer dict={dictionary} settings={uiSettings}>
                        {children}
                        {modal}
                    </GlobalContainer>
                </DictionaryProvider>
                <ToastContainer />
            </body>
        </html>
    );
}