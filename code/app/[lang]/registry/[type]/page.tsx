import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from '@/io/config/routes';
import SettingsStore from '@/io/config/settings';
import { LifecycleStage, LifecycleStageMap } from '@/types/form';
import { NavBarItemSettings, ResourcesPathSettings, TableColumnOption, UISettings } from '@/types/settings';
import RegistryTableComponent from '@/ui/graphic/table/registry/registry-table-component';
import { parseStringsForUrls } from '@/utils/client-utils';
import { LanguageDictionary } from '@/types/dictionary';
import { ConditionalFormatSetting } from '@/types/table';
import { getConditionalFormattingStyles } from '@/utils/fetch/serverside-fetch';

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
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
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
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const resolvedParams = await props.params;
  const decodedType: string = decodeURIComponent(resolvedParams.type);
  if (uiSettings.modules.registry) {
    // Stage should be pending for the main data
    let lifecycleStage: LifecycleStage;
    let caption: LanguageDictionary;
    const registryPath: ResourcesPathSettings = uiSettings.resources?.registry?.paths?.find(path => parseStringsForUrls(path.type) == decodedType);
    let conditionalFormattingStyles: ConditionalFormatSetting[] = [];
    if (registryPath) {
      lifecycleStage = LifecycleStageMap.GENERAL;
      conditionalFormattingStyles = await getConditionalFormattingStyles(decodedType);
      caption = registryPath.caption;
    } else if (uiSettings.resources?.registry?.data) {
      conditionalFormattingStyles = await getConditionalFormattingStyles(LifecycleStageMap.PENDING);
      lifecycleStage = LifecycleStageMap.PENDING;
    } else {
      redirect(Routes.HOME);
    }
    const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(decodedType, lifecycleStage);
    return (
      <RegistryTableComponent
        entityType={decodedType}
        message={caption}
        lifecycleStage={lifecycleStage}
        cellFormatSettings={conditionalFormattingStyles}
        tableColumnOptions={tableColumnSettings}
        accountType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT)?.key}
        addEntity={registryPath?.add}
        exports={uiSettings.resources?.registry?.exports ?? []}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
