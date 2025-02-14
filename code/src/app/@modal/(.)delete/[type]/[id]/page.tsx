import { Metadata } from 'next';

import { Modules, PageTitles, Paths } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { UISettings } from 'types/settings';
import FormContainerComponent from 'ui/interaction/form/form-container';
import FormModal from 'ui/interaction/modal/form/form-modal';
import { DefaultPageThumbnailProps } from 'ui/pages/page-thumbnail';

interface InterceptDeleteFormPageProps {
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
  const metadata: DefaultPageThumbnailProps = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  }
}

/**
 * Displays the intercepted route for deleting a specific entity through a modal.
 */
export default async function InterceptFormDeletePage(props: Readonly<InterceptDeleteFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = JSON.parse(SettingsStore.getDefaultSettings());
  return (
    <FormModal>
      <FormContainerComponent
        entityType={resolvedParams?.type}
        formType={Paths.REGISTRY_DELETE}
        agentApi={uiSettings?.resources?.registry?.url}
        isPrimaryEntity={uiSettings?.resources?.registry?.data === resolvedParams?.type}
      />
    </FormModal>
  );
}