import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import RegistryTableComponent from 'ui/graphic/table/registry/registry-table-component';
import { parseStringsForUrls } from 'utils/client-utils';

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
  const decodedType:string = decodeURIComponent(resolvedParams.type);
  if (uiSettings.modules.registry && uiSettings.resources?.registry?.paths?.some(path => parseStringsForUrls(path.type) == decodedType)) {
    return (
      <RegistryTableComponent
        entityType={decodedType}
        lifecycleStage={'general'}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}