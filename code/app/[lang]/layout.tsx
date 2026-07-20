/**
 * Sets a template for all generated HTML files.
 */

import "@/ui/css/globals.css";

import { SerwistProvider } from "@serwist/turbopack/react";
import OptionalPages, { OptionalPage } from "@/io/config/optional-pages";
import SettingsStore from "@/io/config/settings";
import { Dictionary } from "@/types/dictionary";
import { UISettings } from "@/types/settings";
import GlobalContainer from "@/ui/global-container";
import { SessionInfoProvider } from "@/utils/auth/SessionInfo";
import { getDictionary } from "@/utils/dictionary/dictionaries";
import { DictionaryProvider } from "@/utils/dictionary/DictionaryContext";
import { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import React from "react";
import { Toaster } from "sonner";

/**
 * Performs initialisation when the platform is
 * first loaded. Runs on the server.
 */
function initialise() {
  SettingsStore.readUISettings();
  // Cache contents of optional static pages
  OptionalPages.loadPages();
}

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    }
  ],
  variable: "--font-inter",
});

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "de" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "The World Avatar",
    icons: {
      icon: `${process.env.ASSET_PREFIX || ""}/favicon.ico`,
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#bebebe",
  width: "device-width",
  initialScale: 1,
}

/**
 * Define a root layout template to be used for all generated HTML files.
 *
 * @param children React child elements to add to generated page.
 *
 * @returns generated React nodes.
 */
export default async function RootLayout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Initialise static content
  initialise();
  // Get settings to pass to Toolbar
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const { lang } = await params;
  const dictionary: Dictionary = await getDictionary(lang);
  const pages: OptionalPage[] = OptionalPages.getAllPages();
  const manifestUrl = `${process.env.ASSET_PREFIX || ""}/manifest_${lang}.json`;

  // Root element containing all children.
  return (
    <html lang={lang}>
      <head>
        <link rel="manifest" href={manifestUrl} crossOrigin="use-credentials" />
      </head>
      <body className={inter.className}>
        <SerwistProvider swUrl={`${process.env.ASSET_PREFIX || ""}/serwist/sw.js`}>
          <DictionaryProvider dictionary={dictionary}>
          <SessionInfoProvider>
            <GlobalContainer pages={pages} settings={uiSettings}>
              {children}
              {modal}
              <Toaster duration={Infinity} />
            </GlobalContainer>
          </SessionInfoProvider>
        </DictionaryProvider>
      </SerwistProvider>
    </body>
    </html >
  );
}
