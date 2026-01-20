import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { NavBarItemSettings, UISettings } from "types/settings";
import { TaskRescheduleComponent } from "ui/interaction/form/task-reschedule-container";

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
 * Displays the form page for rescheduling a task.
 */
export default async function RescheduleFormPage() {
    return (
        <TaskRescheduleComponent />
    );
}
