import { Metadata } from 'next';

import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import FormContainerComponent from 'ui/interaction/form/form-container';

interface DeleteFormPageProps {
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
 * Displays the form page for deleting one item.
 * 
 * @returns React component for display. 
 */
export default async function DeleteFormPage(props: Readonly<DeleteFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  return (
    <FormContainerComponent
      entityType={resolvedParams?.type}
      formType={'delete'}
      isPrimaryEntity={decodeURIComponent(uiSettings?.resources?.registry?.data) === decodeURIComponent(resolvedParams?.type)}
      isModal={false}
    />
  );
}