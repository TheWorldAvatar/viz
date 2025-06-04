import { Metadata } from 'next';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { UISettings } from 'types/settings';
import FormContainerComponent from 'ui/interaction/form/form-container';
import { NavBarItemProps } from 'ui/navigation/navbar/navbar-item';

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
  const uiSettings: UISettings = JSON.parse(SettingsStore.getUISettings());
  const metadata: NavBarItemProps = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}

/**
 * Displays the form page for adding an entity.
 */
export default async function AddFormPage(props: Readonly<AddFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = JSON.parse(SettingsStore.getUISettings());
  return (
    <FormContainerComponent
      entityType={resolvedParams?.type}
      formType={Paths.REGISTRY_ADD}
      agentApi={uiSettings?.resources?.registry?.url}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === resolvedParams?.type}
      isModal={false}
    />
  );
}