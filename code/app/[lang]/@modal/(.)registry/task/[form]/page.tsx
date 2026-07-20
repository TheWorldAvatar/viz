import { Metadata } from "next";

import { Modules, PageTitles } from "@/io/config/routes";
import SettingsStore from "@/io/config/settings";
import { FormType, FormTypeMap } from "@/types/form";
import { NavBarItemSettings, UISettings } from "@/types/settings";
import { InterceptTaskFormContainerComponent } from "@/ui/interaction/form/task-form-container";

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
 * Displays the intercepted route for the form page associated with a task.
 */
export default async function InterceptTaskFormPage({ params, searchParams }: PageProps) {
    const { id } = await searchParams;
    const { form } = await params;
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const entityType: string = uiSettings?.resources?.registry?.data ?? "";

    if (form === FormTypeMap.CANCEL || form === FormTypeMap.COMPLETE || form === FormTypeMap.DISPATCH ||
        form === FormTypeMap.REPORT || form === FormTypeMap.ACCRUAL || form === FormTypeMap.VIEW ||
        form === FormTypeMap.EXEMPT
    ) {
        return (
            <InterceptTaskFormContainerComponent
                id={id}
                entityType={entityType}
                formType={form}
            />
        );
    }
}
