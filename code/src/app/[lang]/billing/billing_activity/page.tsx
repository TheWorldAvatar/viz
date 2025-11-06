import RegistryTableComponent from "ui/graphic/table/registry/registry-table-component";

export default function BillingActivityPage() {
  return (
    <RegistryTableComponent
      entityType="billing"
      lifecycleStage="billing_activity"
    />
  );
}
