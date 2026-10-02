import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Modules, PageTitles, Routes } from '@/io/config/routes';
import SettingsStore from '@/io/config/settings';
import { NavBarItemSettings, TableColumnOption, UISettings } from '@/types/settings';
import RegistryGridComponent from '@/ui/container/registry-grid-container';

/**
 * Set page metadata.
 * 
 * @returns metadata promise.
 */
export async function generateMetadata(): Promise<Metadata> {
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const metadata: NavBarItemSettings = uiSettings.links?.find(link => link.url === Modules.REGISTRY);
    return {
        title: metadata?.title ?? PageTitles.REGISTRY,
    }
}

/**
 * Displays the registry page for viewing outstanding tasks in a mobile interface.
 * 
 * @returns React component for display. 
 */
export default function RegistryMobileOutstandingTaskPage() {
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const tableColumnSettings: TableColumnOption[] = SettingsStore.getTableColumnSettings(
        uiSettings.resources?.registry?.data, "mobile");
    if (uiSettings.modules.registry && uiSettings.resources?.registry?.data) {
        return (
            <RegistryGridComponent
                entityType={uiSettings.resources?.registry?.data}
                tableColumnOptions={tableColumnSettings}
            />
        );
    } else {
        redirect(Routes.HOME);
    }
}