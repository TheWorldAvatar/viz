import BillingTableComponent from "ui/graphic/table/billing/billing-table-component";

export default function PricingModelsPage() {
    return (
        <BillingTableComponent
            entityType="pricing_models"
            lifecycleStage="outstanding"
        />
    );
}