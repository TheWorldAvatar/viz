import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';
import { DefaultPageThumbnailProps } from 'ui/pages/page-thumbnail';

interface ArchiveRegistryPageProps {
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
 * Displays the registry page for archived contracts that have expired.
 * 
 * @returns React component for display. 
 */
export default async function ArchiveRegistryPage(props: Readonly<ArchiveRegistryPageProps>) {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  const resolvedParams = await props.params
  if (uiSettings.modules.registry && uiSettings.resources?.registry) {
    return (
      <RegistryTableComponent
        entityType={resolvedParams.type}
        lifecycleStage={Paths.REGISTRY_ARCHIVE}
        registryAgentApi={uiSettings.resources?.registry?.url}
      />
    );
  } else {
    redirect(Paths.HOME);
  }
}