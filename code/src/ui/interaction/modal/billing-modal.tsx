import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { ServiceCostDetails } from "types/billing";
import { Dictionary } from "types/dictionary";
import { FormTypeMap } from "types/form";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import Modal from "./modal";
import LoadingSpinner from "ui/graphic/loader/spinner";


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
    const dict: Dictionary = useDictionary();
    const [costDetails, setCostDetails] = useState<ServiceCostDetails>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // A hook that fetches data initially
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            const url: string = makeInternalRegistryAPIwithParams(
                InternalApiIdentifierMap.BILL,
                FormTypeMap.VIEW,
                props.id,
            );

            const res: AgentResponseBody = await queryInternalApi(url);
            setCostDetails(res.data.items[0] as ServiceCostDetails);
            setIsLoading(false);
        };

        fetchData();
    }, []);

    return (
        <Modal className="!w-full  md:!max-w-2xl lg:!max-w-3xl  !h-auto !min-h-0 !rounded-xl !shadow-xl !border !border-border" isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
            <div className="flex flex-col p-2  w-full max-w-2xl mx-auto mt-4">
                <div className="flex  items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">{dict.title.serviceCostBreakdown}</h2>
                    <p className="text-foreground">{props.date}</p>
                </div>
                <div>
                    <div className="flex items-center justify-between mt-4 bg-ring p-2.5 rounded-sm">
                        <p className="font-bold text-foreground">{dict.title.item}</p>
                        <p className="text-foreground">{dict.title.amount}</p>
                    </div>
                    {costDetails != null && !isLoading ? (
                        <div className="flex flex-col max-h-[40vh] md:max-h-[50vh] lg:max-h-[60vh]">
                            <div className="flex-1 overflow-y-auto pr-2">
                                {/* Additional charges */}
                                {costDetails?.charge?.map((charge, index) => (
                                    <div key={index} className="flex p-2 justify-between">
                                        <p className="text-sm text-pretty w-58 md:w-md text-gray-600 dark:text-gray-300">{charge?.description}</p>
                                        <p className="text-gray-600 dark:text-gray-300">+ ${charge?.amount}</p>
                                    </div>
                                ))}

                                {/* Discounts */}
                                {costDetails?.discount?.map((discount, index) => (
                                    <div key={index} className="flex p-2 justify-between">
                                        <p className="text-sm w-58 md:w-md text-gray-600 dark:text-gray-300">{discount?.description}</p>
                                        <p className="text-gray-600 dark:text-gray-300">- ${discount?.amount}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-end gap-10 mt-2 p-2 border-t border-border">
                                <p>{dict.title.total}</p>
                                <p className="font-bold">${costDetails?.amount}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-48">
                            <LoadingSpinner isSmall={false} />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
