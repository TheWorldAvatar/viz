import RegistryTableComponent from "ui/graphic/table/registry/registry-table-component";

export default function BillingAccountsPage() {
  return (
    <RegistryTableComponent
      entityType="billing"
      lifecycleStage="billing_accounts"
    />
  );
}
