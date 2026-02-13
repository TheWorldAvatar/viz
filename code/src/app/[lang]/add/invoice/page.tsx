import { Metadata } from 'next';

import { Modules, PageTitles } from 'io/config/routes';
import SettingsStore from 'io/config/settings';
import { NavBarItemSettings, TableColumnOrderSettings, UISettings } from 'types/settings';
import { FormTypeMap, LifecycleStageMap } from 'types/form';
import AddInvoiceComponent from 'ui/interaction/form/add-invoice-component';

interface AddFormPageProps {
  params: Promise<{
    type: string
  }>
}

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
export default async function AddInvoiceFormPage(props: Readonly<AddFormPageProps>) {
  const resolvedParams = await props.params;
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const tableColumnOrderSettings: TableColumnOrderSettings = SettingsStore.getTableColumnOrderSettings();

  const decodedType = decodeURIComponent(resolvedParams?.type);
  return (
    <AddInvoiceComponent
      entityType={FormTypeMap.INVOICE}
      formType={FormTypeMap.INVOICE}
      isPrimaryEntity={uiSettings?.resources?.registry?.data === decodedType}
      registryEntityType={uiSettings?.resources?.registry?.data}
      tableColumnOrder={tableColumnOrderSettings}
      accountType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.ACCOUNT).key}
      pricingType={uiSettings.resources?.billing?.paths?.find(path => path.type === LifecycleStageMap.PRICING).key}
    />
  );
}