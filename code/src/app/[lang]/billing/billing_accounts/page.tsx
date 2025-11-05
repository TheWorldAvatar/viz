import BillingTableComponent from "ui/graphic/table/billing/billing-table-component";

export default function BillingAccountsPage() {
    return (
        <BillingTableComponent
            entityType="billing_accounts"
            lifecycleStage="active"
        />
    );
}