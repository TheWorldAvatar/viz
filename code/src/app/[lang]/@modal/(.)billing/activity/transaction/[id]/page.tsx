import { Metadata } from 'next';

import { Modules, PageTitles, Routes } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { redirect } from 'next/navigation';
import { FormTypeMap, LifecycleStageMap } from 'types/form';
import { NavBarItemSettings, UISettings } from 'types/settings';
import { InterceptFormContainerComponent } from 'ui/interaction/form/form-container';

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
 * Displays the form page to generate an invoice for the specific task.
 */
export default async function InterceptAddInvoiceFormPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();

  if (!uiSettings.modules.billing) {
    redirect(Routes.HOME);
  }
  return (
    <InterceptFormContainerComponent
      entityType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key}
      formType={FormTypeMap.ADD_INVOICE}
      isPrimaryEntity={false}
    />
  );
}