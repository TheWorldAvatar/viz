import BillingTableComponent from "ui/graphic/table/billing/billing-table-component";

export default function BillingActivityPage() {
    return (
        <BillingTableComponent
            entityType="billing_activity"
            lifecycleStage="active"
        />
    );
}