import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';
import { DefaultPageThumbnailProps } from 'ui/pages/page-thumbnail';

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getUISettings());
  const metadata: DefaultPageThumbnailProps = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}

/**
 * Displays the registry page for viewing tasks by dates.
 * 
 * @returns React component for display. 
 */
export default function RegistryTaskByDatePage() {
  const uiSettings: UISettings = JSON.parse(SettingsStore.getUISettings());
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    return (
      <RegistryTableComponent
        entityType={uiSettings.resources?.registry?.data}
        lifecycleStage={Paths.REGISTRY_TASK_DATE}
        registryAgentApi={uiSettings.resources?.registry?.url}
      />
    );
  } else {
    redirect(Paths.HOME);
  }
}