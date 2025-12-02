import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import { InterceptTaskFormContainerComponent } from "ui/interaction/form/task-form-container";

interface InterceptViewTaskPageProps {
  params: Promise<{
    id: string;
    type: string;
  }>;
}

/**
 * Set page metadata.
 *
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(
    (link) => link.url === Modules.REGISTRY
  );
  return {
    title: metadata?.title ?? PageTitles.REGISTRY,
  };
}

/**
 * Displays the intercepted route for viewing a task through a modal.
 */
export default async function InterceptViewTaskPage(
  props: Readonly<InterceptViewTaskPageProps>
) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const decodedType: string = decodeURIComponent(resolvedParams?.type);
  return (
    <InterceptTaskFormContainerComponent
      entityType={decodedType}
      formType={"view"}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === decodedType}
    />
  );
}
