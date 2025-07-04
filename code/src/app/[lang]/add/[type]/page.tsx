import { Metadata } from 'next';

import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import FormContainerComponent from 'ui/interaction/form/form-container';

interface AddFormPageProps {
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
 * Displays the form page for adding an entity.
 */
export default async function AddFormPage(props: Readonly<AddFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  return (
    <FormContainerComponent
      entityType={resolvedParams?.type}
      formType={'add'}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === resolvedParams?.type}
      isModal={false}
    />
  );
}