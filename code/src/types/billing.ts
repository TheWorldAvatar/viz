export type ServiceCostDetails = {
    amount: string;
    price: string;
    charge: InvoiceLine[];
    discount: InvoiceLine[];
};

type InvoiceLine = {
    amount: string;
    description: string;
};
