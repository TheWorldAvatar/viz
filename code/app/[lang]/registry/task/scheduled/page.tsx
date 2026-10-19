import { Metadata } from "next";
import { redirect } from "next/navigation";

import { Modules, PageTitles, Routes } from "@/io/config/routes";
import SettingsStore from "@/io/config/settings";
import { NavBarItemSettings, TableColumnOption, UISettings } from "@/types/settings";
import RegistryTableComponent from "@/ui/graphic/table/registry/registry-table-component";
import { LifecycleStageMap } from "@/types/form";
import { getConditionalFormattingStyles } from "@/utils/fetch/serverside-fetch";
import { ConditionalFormatSetting } from "@/types/table";

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
 * Displays the registry page for viewing scheduled tasks by dates.
 *
 * @returns React component for display.
 */
export default async function RegistryScheduledTaskPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(uiSettings.resources?.registry?.data, LifecycleStageMap.SCHEDULED);

  if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
    const conditionalFormattingStyles: ConditionalFormatSetting[] = await getConditionalFormattingStyles(LifecycleStageMap.SCHEDULED);
    return (
      <RegistryTableComponent
        entityType={uiSettings.resources?.registry?.data}
        lifecycleStage={LifecycleStageMap.SCHEDULED}
        cellFormatSettings={conditionalFormattingStyles}
        tableColumnOptions={tableColumnSettings}
        allowTaskPrioritisation={uiSettings.resources?.registry?.priority}
        dragSync={uiSettings.resources?.registry?.dragSync}
        exports={uiSettings.resources?.registry?.exports ?? []}
      />
    );
  } else {
    redirect(Routes.HOME);
  }
}
