import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from '@/io/config/routes';
import SettingsStore from '@/io/config/settings';
import { NavBarItemSettings, TableColumnOption, UISettings } from '@/types/settings';
import RegistryTableComponent from '@/ui/graphic/table/registry/registry-table-component';
import { LifecycleStageMap } from '@/types/form';
import { ConditionalFormatSetting } from '@/types/table';
import { getConditionalFormattingStyles } from '@/utils/fetch/serverside-fetch';

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
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
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
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const resolvedParams = await props.params
  const decodedType: string = decodeURIComponent(resolvedParams.type);
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(decodedType, LifecycleStageMap.ARCHIVE);
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    const conditionalFormattingStyles: ConditionalFormatSetting[] = await getConditionalFormattingStyles(LifecycleStageMap.ARCHIVE);
    return (
      <RegistryTableComponent
        entityType={decodedType}
        lifecycleStage={LifecycleStageMap.ARCHIVE}
        cellFormatSettings={conditionalFormattingStyles}
        tableColumnOptions={tableColumnSettings}
        exports={uiSettings.resources?.registry?.exports ?? []}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
