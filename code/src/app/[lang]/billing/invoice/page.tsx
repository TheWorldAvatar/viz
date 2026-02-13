import { Modules, PageTitles, Routes } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { redirect } from "next/navigation";
import { LifecycleStageMap } from "types/form";
import { NavBarItemSettings, TableColumnOrderSettings, UISettings } from "types/settings";
import RegistryTableComponent from "ui/graphic/table/registry/registry-table-component";

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

export default function InvoicesPage() {
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const tableColumnOrderSettings: TableColumnOrderSettings = SettingsStore.getTableColumnOrderSettings();

    if (!uiSettings.modules.billing) {
        redirect(Routes.HOME);
    }

    return (
        <RegistryTableComponent
            entityType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT).key}
            lifecycleStage={LifecycleStageMap.INVOICE}
            tableColumnOrder={tableColumnOrderSettings}
        />
    );
}
