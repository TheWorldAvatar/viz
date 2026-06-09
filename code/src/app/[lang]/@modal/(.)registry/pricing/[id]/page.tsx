import { Metadata } from "next";

import { Modules, PageTitles } from "io/config/routes";
import SettingsStore from "io/config/settings";
import { FormTypeMap, LifecycleStageMap } from "types/form";
import { NavBarItemSettings, UISettings } from "types/settings";
import { InterceptFormContainerComponent } from "ui/interaction/form/form-container";

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
 * Displays the intercepted route to view the form for contract details and adjust pricing only.
 */
export default async function InterceptAdjustPricingFormPage() {
    const uiSettings: UISettings = SettingsStore.getUISettings();
    const entityType: string = uiSettings?.resources?.registry?.data ?? "";
    return (
        <InterceptFormContainerComponent
            entityType={entityType}
            formType={FormTypeMap.ADJUST_PRICE}
            pricingType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key}
            isPrimaryEntity={true}
        />
    );
}
