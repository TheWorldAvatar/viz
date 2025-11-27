import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import { TaskFormContainerComponent } from "ui/interaction/form/task-form-container";

interface DispatchFormPageProps {
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
 * Displays the form page for dispatching a task.
 */
export default async function DispatchFormPage(
  props: Readonly<DispatchFormPageProps>
) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const decodedType = decodeURIComponent(resolvedParams?.type);
  return (
    <TaskFormContainerComponent
      entityType={decodedType}
      formType={"dispatch"}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === decodedType}
    />
  );
}
