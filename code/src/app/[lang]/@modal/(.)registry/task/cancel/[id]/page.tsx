import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import { InterceptTaskFormContainerComponent } from "ui/interaction/form/task-form-container";

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
 * Displays the intercepted route for canceling a task through a modal.
 */
export default async function InterceptCancelTaskPage() {
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const entityType: string = uiSettings?.resources?.registry?.data ?? "";
    return (
        <InterceptTaskFormContainerComponent
            entityType={entityType}
            formType={"cancel"}
        />
    );
}
