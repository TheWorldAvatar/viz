import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, TableColumnOrderSettings, UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';

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
 * Displays the registry page for viewing tasks by dates.
 * 
 * @returns React component for display. 
 */
export default function RegistryTaskByDatePage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnOrderSettings: TableColumnOrderSettings = SettingsStore.getTableColumnOrderSettings();
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    return (
      <RegistryTableComponent
        entityType={uiSettings.resources?.registry?.data}
        lifecycleStage={'closed'}
        tableColumnOrder={tableColumnOrderSettings}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
