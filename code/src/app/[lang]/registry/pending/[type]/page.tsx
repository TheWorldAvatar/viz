import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';

interface PendingRegistryPageProps {
  params: Promise<{
    type: string
  }>
}

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}

/**
 * Displays the registry page for contracts that are pending approval.
 * 
 * @returns React component for display. 
 */
export default async function PendingRegistryPage(props: Readonly<PendingRegistryPageProps>) {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const resolvedParams = await props.params;
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    return (
      <RegistryTableComponent
        entityType={decodeURIComponent(resolvedParams.type)}
        lifecycleStage={'pending'}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}