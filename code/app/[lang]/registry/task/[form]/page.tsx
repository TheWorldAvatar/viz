import { Metadata } from "next";

import { Modules, PageTitles } from "@/io/config/routes";
import SettingsStore from "@/io/config/settings";
import { FormType } from "@/types/form";
import { NavBarItemSettings, UISettings } from "@/types/settings";
import { TaskFormContainerComponent } from "@/ui/interaction/form/task-form-container";

type PageProps = {
    params: Promise<{ form: FormType }>;
    searchParams: Promise<{ id: string }>;
};

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
 * Displays the form page associated with a task.
 */
export default async function TaskFormPage({ params, searchParams }: PageProps) {
    const { id } = await searchParams;
    const { form } = await params;
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const entityType: string = uiSettings?.resources?.registry?.data ?? "";
    return (
        <TaskFormContainerComponent
            id={id}
            entityType={entityType}
            formType={form}
        />
    );
}
