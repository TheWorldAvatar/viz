import { Metadata } from 'next';

import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { FormTypeMap, LifecycleStageMap } from 'types/form';
import { NavBarItemSettings, UISettings } from 'types/settings';
import { InterceptFormContainerComponent } from 'ui/interaction/form/form-container';

interface InterceptAddFormPageProps {
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
  };
}

/**
 * Displays the intercepted route for adding an entity through a modal.
 */
export default async function InterceptAddFormPage(props: Readonly<InterceptAddFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const decodedType = decodeURIComponent(resolvedParams?.type);
  return (
    <InterceptFormContainerComponent
      entityType={decodedType}
      formType={FormTypeMap.ADD}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === decodedType}
      accountType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT).key}
      pricingType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key}
    />
  );
}
