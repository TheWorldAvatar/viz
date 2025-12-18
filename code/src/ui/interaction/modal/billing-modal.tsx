import { useEffect, useState } from "react";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { ServiceCostDetails } from "types/billing";
import { FormTypeMap } from "types/form";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import Modal from "./modal";

interface BillingModalProps {
    id: string;
    date: string;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A modal component to display the breakdown of an individual service cost.
 *
 * @param {string} id - The task ID.
 * @param {string} date - The date to the task is scheduled to be executed for.
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 */
export default function BillingModal(props: Readonly<BillingModalProps>) {
    const [costDetails, setCostDetails] = useState<ServiceCostDetails>(null);
    // A hook that fetches data initially
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const url: string = makeInternalRegistryAPIwithParams(
                InternalApiIdentifierMap.BILL,
                FormTypeMap.VIEW,
                props.id,
            );

            const res: AgentResponseBody = await queryInternalApi(url);
            setCostDetails(res.data.items[0] as ServiceCostDetails);
        };

        fetchData();
    }, []);

    return (
        <Modal className="!w-full !max-w-3xl !h-auto !min-h-0 !rounded-xl !shadow-xl !border !border-border" isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
            <div className="flex flex-col p-2  w-full max-w-2xl mx-auto">
                <div className="flex  items-center justify-between">
                    <h2 className="text-xl font-semibold ">Service Cost breakdown</h2>
                    <p>{props.date}</p>
                </div>
                <div>
                    <div className="flex  items-center justify-between mt-4 bg-ring p-2 rounded-sm">
                        <span className="font-bold ">Item</span>
                        <span className="text-muted-foreground">Amount</span>
                    </div>
                    {costDetails != null && <>
                        <div>
                            {/* Base service cost */}
                            <div className="flex p-2 justify-between mt-2">
                                <p className="text-md max-w-sm font-bold">Service price</p>
                                <span className="text-muted-foreground">${costDetails?.amount}</span>
                            </div>
                        </div>
                        <div>
                            {/* Additional charges */}
                            {costDetails?.charge?.map((charge, index) => (
                                <div key={index} className="flex  p-2 justify-between">
                                    <p className="text-sm max-w-sm text-gray-500 dark:text-gray-300">{charge?.description}</p>
                                    <span className="text-muted-foreground">+ ${charge?.amount}</span>
                                </div>
                            ))}
                            {/* Discounts */}
                            {costDetails?.discount?.map((discount, index) => (
                                <div key={index} className="flex  p-2  justify-between">
                                    <p className="text-sm max-w-sm text-gray-500 dark:text-gray-300">{discount?.description}</p>
                                    <span className="text-muted-foreground">- ${discount?.amount}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-end gap-10 mt-2 p-2 border-b border-t border-border">
                            <p>Total</p>
                            <span className="font-bold">${costDetails?.price}</span>
                        </div>
                    </>}
                </div>
            </div>
        </Modal>
    )
}
