import RegistryTableComponent from "ui/graphic/table/registry/registry-table-component";

export default function PricingModelsPage() {
  return (
    <RegistryTableComponent
      entityType="billing"
      lifecycleStage="pricing_models"
    />
  );
}
