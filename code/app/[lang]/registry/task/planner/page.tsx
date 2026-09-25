import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from '@/io/config/routes';
import SettingsStore from '@/io/config/settings';
import { LifecycleStageMap } from '@/types/form';
import { NavBarItemSettings, TableColumnOption, UISettings } from '@/types/settings';
import RegistryPlannerTableComponent from '@/ui/graphic/table/registry/registry-planner-table-component';

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
export default function RegistryTaskPlannerPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(uiSettings.resources?.registry?.data, LifecycleStageMap.OUTSTANDING);
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    return (
      <RegistryPlannerTableComponent
        entityType={uiSettings.resources?.registry?.data}
        tableColumnOptions={tableColumnSettings}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
