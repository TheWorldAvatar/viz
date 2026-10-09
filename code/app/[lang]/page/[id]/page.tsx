import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Routes } from '@/io/config/routes';
import SettingsStore from '@/io/config/settings';
import { NavBarItemSettings, UISettings } from '@/types/settings';
import ExternalPage from '@/ui/pages/external-page';

interface PageProps {
  params: Promise<{
    id: string
  }>;
};

/**
 * Retrieves the page link with the matching id.
 *
 * @param {string} id The route identifier.
 */
function getPageLink(id: string): NavBarItemSettings | undefined {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  return uiSettings.links?.find(link => link.type === "page" && link.id === id);
}

/**
 * Set page metadata.
 *
 * @returns metadata promise.
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const link: NavBarItemSettings = getPageLink(id);
  return {
    title: link?.title,
    description: link?.caption ?? ""
  }
}

/**
 * A page displaying an external web application configured as a link with type `page` in the UI settings.
 *
 * @returns React component for display.
 */
export default async function Page(props: PageProps) {
  const { id } = await props.params;
  const link: NavBarItemSettings = getPageLink(id);
  if (!link?.url) {
    redirect(Routes.HOME);
  }
  return (
    <ExternalPage
      url={link.url}
      title={link.title}
    />
  );
}
