import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';
import { DefaultPageThumbnailProps } from 'ui/pages/page-thumbnail';

interface GeneralRegistryPageProps {
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
 * Displays the registry page for any items based on the dynamic type parameter.
 * 
 * @returns React component for display. 
 */
export default async function GeneralRegistryPage(props: Readonly<GeneralRegistryPageProps>) {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  const resolvedParams = await props.params;
  if (uiSettings.modules.registry && uiSettings.resources?.registry) {
    return (
      <RegistryTableComponent
        entityType={resolvedParams.type}
        lifecycleStage={Paths.REGISTRY_GENERAL}
        registryAgentApi={uiSettings.resources?.registry?.url}
      />
    );
  } else {
    redirect(Paths.HOME);
  }
}