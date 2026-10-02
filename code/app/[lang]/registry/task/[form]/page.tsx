import { Metadata } from "next";

import { Modules, PageTitles } from "@/io/config/routes";
import SettingsStore from "@/io/config/settings";
import { FormType, FormTypeMap } from "@/types/form";
import { NavBarItemSettings, UISettings } from "@/types/settings";
import { TaskFormContainerComponent } from "@/ui/interaction/form/task-form-container";
import { notFound } from "next/navigation";

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
    const metadata: NavBarItemSettings = uiSettings?.links?.find(
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
    let uiSettings: UISettings = null;
    try {
        uiSettings = SettingsStore.getUISettings();
    } catch (e) {
        console.warn("Failed to get UI settings offline, using local fallback", e);
    }
    const entityType: string = uiSettings?.resources?.registry?.data ?? "";

    if (form === FormTypeMap.CANCEL || form === FormTypeMap.COMPLETE || form === FormTypeMap.DISPATCH ||
        form === FormTypeMap.REPORT || form === FormTypeMap.ACCRUAL || form === FormTypeMap.VIEW ||
        form === FormTypeMap.EXEMPT
    ) {
        return (
            <TaskFormContainerComponent
                id={id}
                entityType={entityType}
                formType={form}
            />
        );
    }
    notFound();
}
