import { Metadata } from 'next';

import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { LifecycleStageMap } from 'types/form';
import { NavBarItemSettings, TableColumnOrderSettings, UISettings } from 'types/settings';
import InvoiceFormComponent from 'ui/interaction/form/invoice-form-component';

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
 * Displays the form page for adding an invoice
 */
export default async function AddInvoiceFormPage() {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnOrderSettings: TableColumnOrderSettings = SettingsStore.getTableColumnOrderSettings();

  return (
    <InvoiceFormComponent
      entityType={uiSettings?.resources?.registry?.data}
      accountType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT).key}
      tableColumnOrder={tableColumnOrderSettings}
    />
  );
}