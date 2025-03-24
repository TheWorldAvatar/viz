import { useState, useEffect } from 'react';
import { Assets } from 'io/config/assets';

// Custom hook to retrieve background image url
export function useBackgroundImageUrl(): string {
  const lightBackgroundUrl: string = process.env.ASSET_PREFIX + Assets.BACKGROUND_LIGHT;
  const darkBackgroundUrl: string = process.env.ASSET_PREFIX + Assets.BACKGROUND_DARK;
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>(lightBackgroundUrl);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Find and update the browser display setting for light and dark
  useEffect(() => {
    const darkModeMediaQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeMediaQuery.matches);

    // Add an event listener that updates this prop when a user switch their browser settings
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    darkModeMediaQuery.addEventListener("change", handleDarkModeChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleDarkModeChange);
    };
  }, []);

  // Sets the background url according to the current display mode
  useEffect(() => {
    if (typeof window !== "undefined" && isDarkMode) {
      setBackgroundImageUrl(darkBackgroundUrl);
    } else {
      setBackgroundImageUrl(lightBackgroundUrl);
    }
  }, [darkBackgroundUrl, lightBackgroundUrl, isDarkMode]);

  return backgroundImageUrl;
}