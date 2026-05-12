import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, TableColumnOption, UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';
import { LifecycleStageMap } from 'types/form';

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
 * Displays the registry page that provides a summary for active and archived contracts.
 * 
 * @returns React component for display. 
 */
export default function RegistryReportPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(uiSettings.resources?.registry?.data, LifecycleStageMap.REPORT);
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    return (
      <RegistryTableComponent
        entityType={uiSettings.resources?.registry?.data}
        lifecycleStage={LifecycleStageMap.REPORT}
        tableColumnOptions={tableColumnSettings}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
