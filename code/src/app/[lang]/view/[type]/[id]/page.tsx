
import { Metadata } from 'next';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, UISettings } from 'types/settings';
import FormContainerComponent from 'ui/interaction/form/form-container';

interface ViewFormPageProps {
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
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}

/**
 * Displays the form page for viewing one item.
 * 
 * @returns React component for display. 
 */
export default async function ViewFormPage(props: Readonly<ViewFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());

  return (
    <FormContainerComponent
      entityType={resolvedParams?.type}
      formType={Paths.REGISTRY}
      agentApi={uiSettings?.resources?.registry?.url}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === resolvedParams?.type}
      isModal={false}
    />
  );
}