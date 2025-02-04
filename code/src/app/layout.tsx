/**
 * Sets a template for all generated HTML files.
 */

import "ui/css/globals.css";
import "antd/dist/reset.css"; // Ant Design styles

import React, { useEffect, useState } from "react";

import { ToastContainer } from "react-toastify";
import { Dosis } from "next/font/google";
import { ConfigProvider, theme } from "antd";

import OptionalPages from "io/config/optional-pages";
import SettingsStore from "io/config/settings";
import { UISettings } from "types/settings";
import GlobalContainer from "ui/global-container";
import BackgroundImage from "ui/graphic/image/background";

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
  subsets: ["latin"],
  display: "swap",
});

// Ant Design theme configuration
const getThemeConfig = (isDarkMode: boolean) => ({
  algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: "#146a7d",
    colorLink: "#146a7d",
    colorLinkHover: "#20aac9",

    // Map CSS variables to Ant Design tokens
    colorBgContainer: isDarkMode ? "#0d1117" : "#f9f9f9",
    colorBgElevated: isDarkMode ? "#30363d" : "#efefef",
    colorText: isDarkMode ? "#dde9ff" : "#30363d",
    colorTextSecondary: isDarkMode ? "deepskyblue" : "#7f7f80",
    colorBorder: isDarkMode ? "#434b55" : "#b6b6bf",

    // Some customisations
    borderRadius: 6,
    fontFamily: "var(--font-family-primary)",
    fontSize: 14,
  },
});

/**
 * Define a root layout template to be used for all generated HTML files.
 *
 * @param children React child elements to add to generated page.
 * @param modal Modal component to be rendered.
 * @returns generated React nodes.
 */
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  // Run initialisation on the server side
  initialise();

  // Parse settings
  let uiSettings: UISettings;
  try {
    uiSettings = JSON.parse(SettingsStore.getDefaultSettings());
  } catch (error) {
    console.error("Error parsing UI settings:", error);
    uiSettings = {} as UISettings; // Provide fallback settings as needed
  }

  // Get system color scheme preference
  const prefersDark =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

  // Root element containing all children.
  return (
    <html lang="en" className={dosis.className}>
      <body>
        <ConfigProvider theme={getThemeConfig(prefersDark)}>
          <GlobalContainer settings={uiSettings}>
            <BackgroundImage />
            {children}
            {modal}
          </GlobalContainer>
        </ConfigProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
