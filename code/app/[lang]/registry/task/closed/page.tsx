import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from '@/io/config/routes';
import SettingsStore from '@/io/config/settings';
import { NavBarItemSettings, TableColumnOption, UISettings } from '@/types/settings';
import RegistryTableComponent from '@/ui/graphic/table/registry/registry-table-component';
import { LifecycleStageMap } from '@/types/form';
import { ConditionalFormatSetting } from '@/types/table';
import { getConditionalFormattingStyles } from '@/utils/fetch/serverside-fetch';

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
 * Displays the registry page for viewing closed tasks by dates.
 * 
 * @returns React component for display. 
 */
export default async function RegistryClosedTaskPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(uiSettings.resources?.registry?.data, LifecycleStageMap.CLOSED);
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    const conditionalFormattingStyles: ConditionalFormatSetting[] = await getConditionalFormattingStyles(LifecycleStageMap.CLOSED);
    return (
      <RegistryTableComponent
        entityType={uiSettings.resources?.registry?.data}
        lifecycleStage={LifecycleStageMap.CLOSED}
        accountType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT).key}
        pricingType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key}
        cellFormatSettings={conditionalFormattingStyles}
        tableColumnOptions={tableColumnSettings}
        exports={uiSettings.resources?.registry?.exports ?? []}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
