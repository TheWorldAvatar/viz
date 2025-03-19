import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import SettingsStore from 'io/config/settings';
import { Paths, PageTitles, Modules } from 'io/config/routes';
import { UISettings } from 'types/settings';
import { DefaultPageThumbnailProps } from 'ui/pages/page-thumbnail';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';

interface ActiveRegistryPageProps {
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
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  const metadata: DefaultPageThumbnailProps = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}
/**
 * Displays the registry page for contracts that are currently active.
 * 
 * @returns React component for display. 
 */
export default async function ActiveRegistryPage(props : ActiveRegistryPageProps) {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  const resolvedParams = await props.params;
  if (!uiSettings.modules.registry || !uiSettings.resources?.registry?.data) {
    redirect(Paths.HOME);
  }

  return (
    <RegistryTableComponent
      entityType={resolvedParams.type}
      lifecycleStage={Paths.REGISTRY_ACTIVE}
      registryAgentApi={uiSettings.resources?.registry?.url}
    />
  );
}