/**
 * Handles the default (i.e. "/") route.
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import OptionalPages from 'io/config/optional-pages';
import { Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { Dictionary } from 'types/dictionary';
import { UISettings } from 'types/settings';
import LandingPage from 'ui/pages/landing';
import { getDictionary } from 'utils/dictionary/dictionaries';

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const landingPage = OptionalPages.getPage("landing");
  if (landingPage) {
    return {
      title: landingPage.title
    }
  } else {
    return {
      title: "Welcome"
    }
  }
}

/**
 * Handles the default route (i.e. "/") to display a home page
 * or redirect to another page.
 * 
 * @returns JSX for default (home) page.
 */
export default async function App(props: Readonly<{
  params: Promise<{ lang: string }>;
}>
) {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  const dict: Dictionary = await getDictionary((await props.params).lang);

  if (uiSettings.modules.landing) {
    return (<LandingPage
      dict={dict}
      settings={uiSettings}
    />);
  } else {
    redirect(Paths.MAP);
  }
}
