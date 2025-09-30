import { Metadata } from 'next';

import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import { InterceptFormContainerComponent } from 'ui/interaction/form/form-container';

interface InterceptEditFormPageProps {
  params: Promise<{
    id: string,
    type: string,
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
 * Displays the intercepted route for editing a specific entity through a modal.
 */
export default async function InterceptEditFormPage(props: Readonly<InterceptEditFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const decodedType = decodeURIComponent(resolvedParams?.type);
  return (
    <InterceptFormContainerComponent
      entityType={decodedType}
      formType={'edit'}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === decodedType}
    />
  );
}