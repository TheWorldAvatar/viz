import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import RegistryTableComponent from "ui/graphic/table/registry/registry-table-component";
import { redirect } from "next/navigation";
import { Modules, PageTitles, Routes } from "io/config/routes";
import { LifecycleStage } from "types/form";
import { parseStringsForUrls } from "utils/client-utils";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";


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

export default function BillingAccountsPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();

  if (!uiSettings.modules.billing) {
    redirect(Routes.HOME);
  }

  // Determine lifecycle stage based on whether this type is in billing paths
  let lifecycleStage: LifecycleStage;
  const decodedType = "billing_account";

  if (uiSettings.resources?.billing?.paths?.some(path => parseStringsForUrls(path.type) === decodedType)) {
    lifecycleStage = 'general';
  } else if (uiSettings.resources?.billing?.data) {
    lifecycleStage = 'pending';
  } else {
    redirect(Routes.HOME);
  }

  return (
    <RegistryTableComponent
      entityType={decodedType}
      lifecycleStage={lifecycleStage}
      uiSettings={uiSettings}
    />
  );
}
