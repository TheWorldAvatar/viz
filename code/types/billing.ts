export type ServiceCostDetails = {
    amount: string;
    charge: InvoiceLine[];
    discount: InvoiceLine[];
};

type InvoiceLine = {
    amount: string;
    description: string;
};
