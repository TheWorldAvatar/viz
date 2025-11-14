import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import { FormContainerComponent } from "ui/interaction/form/form-container";

interface CompleteFormPageProps {
  params: Promise<{
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
 * Displays the form page for adding an entity.
 */
export default async function CompleteFormPage(
  props: Readonly<CompleteFormPageProps>
) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const decodedType = decodeURIComponent(resolvedParams?.type);
  return (
    <FormContainerComponent
      entityType={decodedType}
      formType={"complete"}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === decodedType}
    />
  );
}
