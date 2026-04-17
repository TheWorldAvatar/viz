import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import { TaskFormContainerComponent } from "ui/interaction/form/task-form-container";
import { FormTypeMap } from "types/form";

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
 * Displays the form page for exempting a task from billing.
 */
export default async function ExemptFormPage() {
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const entityType: string = uiSettings?.resources?.registry?.data ?? "";
    return (
        <TaskFormContainerComponent
            entityType={entityType}
            formType={FormTypeMap.EXEMPT}
        />
    );
}
