import Modal from "./modal";


interface BillingModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const additionalCharges = [
    {
        description: "Use of additional equipment or tools that were not included in the original scope of work",
        amount: 1500,
    },
    {
        description: "Referral discount provided when a client refers a new customer.",
        amount: 500,
    },
];

const discounts = [
    {
        description: "Referral discount provided when a client refers a new customer.",
        amount: 500,
    },
    {
        description: "Seasonal discount applied during holiday periods.",
        amount: 300,
    },
];


export default function BillingModal(props: Readonly<BillingModalProps>) {
    return (
        <Modal className="!w-full !max-w-3xl !h-auto !min-h-0 !rounded-xl !shadow-xl !border !border-border" isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
            <div className="flex flex-col p-2  w-full max-w-2xl mx-auto">
                <div className="flex  items-center justify-between">
                    <h2 className="text-xl font-semibold ">Service Cost breakdown</h2>
                    <p>12/12/2025</p>
                </div>
                <div>
                    <div className="flex  items-center justify-between mt-4 bg-ring p-2 rounded-sm">
                        <span className="font-bold ">Item</span>
                        <span className="text-muted-foreground">Amount</span>
                    </div>
                    <div>
                        {/* Base service cost */}
                        <div className="flex p-2 justify-between mt-2">
                            <p className="text-md max-w-sm font-bold">Service price</p>
                            <span className="text-muted-foreground">$3000</span>
                        </div>
                    </div>
                    <div>
                        {/* Additional charges */}
                        {additionalCharges.map((charge, index) => (
                            <div key={index} className="flex  p-2 justify-between">
                                <p className="text-sm max-w-sm text-gray-500 dark:text-gray-300">{charge.description}</p>
                                <span className="text-muted-foreground">+ ${charge.amount}</span>
                            </div>
                        ))}
                        {/* Discounts */}
                        {discounts.map((discount, index) => (
                            <div key={index} className="flex  p-2  justify-between">
                                <p className="text-sm max-w-sm text-gray-500 dark:text-gray-300">{discount.description}</p>
                                <span className="text-muted-foreground">- ${discount.amount}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-10 mt-2 p-2 border-b border-t border-border">
                        <p>Total</p>
                        <span className="font-bold">$3000</span>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
