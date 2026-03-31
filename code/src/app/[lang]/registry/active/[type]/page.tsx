import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, TableColumnOption, UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';
import { LifecycleStageMap } from 'types/form';

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
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}
/**
 * Displays the registry page for contracts that are currently active.
 * 
 * @returns React component for display. 
 */
export default async function ActiveRegistryPage(props: ActiveRegistryPageProps) {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const resolvedParams = await props.params;
  const decodedType: string = decodeURIComponent(resolvedParams.type);
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(decodedType, LifecycleStageMap.ACTIVE);
  if (!uiSettings.modules.registry || !uiSettings.resources?.registry?.data) {
    redirect(Routes.HOME);
  }

  return (
    <RegistryTableComponent
      entityType={decodedType}
      lifecycleStage={LifecycleStageMap.ACTIVE}
      tableColumnOptions={tableColumnSettings}
    />
  );
}
