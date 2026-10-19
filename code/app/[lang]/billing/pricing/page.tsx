import { Modules, PageTitles, Routes } from "@/io/config/routes";
import SettingsStore from "@/io/config/settings";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { LifecycleStageMap } from "@/types/form";
import { NavBarItemSettings, TableColumnOption, UISettings } from "@/types/settings";
import RegistryTableComponent from "@/ui/graphic/table/registry/registry-table-component";
import { ConditionalFormatSetting } from "@/types/table";
import { getConditionalFormattingStyles } from "@/utils/fetch/serverside-fetch";

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.BILLING);
  return {
    title: metadata?.title ?? PageTitles.BILLING,
  }
}

export default async function PricingModelsPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key, LifecycleStageMap.PRICING);

  if (!uiSettings.modules.billing) {
    redirect(Routes.HOME);
  }

  const conditionalFormattingStyles: ConditionalFormatSetting[] = await getConditionalFormattingStyles(LifecycleStageMap.PRICING);
  return (
    <RegistryTableComponent
      entityType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key}
      accountType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT).key}
      lifecycleStage={LifecycleStageMap.PRICING}
      cellFormatSettings={conditionalFormattingStyles}
      tableColumnOptions={tableColumnSettings}
      exports={uiSettings.resources?.billing?.exports ?? []}
    />
  );
}
