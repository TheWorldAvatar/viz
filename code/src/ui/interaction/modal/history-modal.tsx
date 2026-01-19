import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { AgentResponseBody, HistoryDetails, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { formatValueByDataType } from "ui/graphic/table/registry/registry-table-utils";
import { XSD_DATETIME } from "utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import Modal from "./modal";
import { LifecycleStage, LifecycleStageMap } from "types/form";

interface HistoryModalProps {
    id: string;
    entityType: string;
    lifecycleStage: LifecycleStage;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A modal component to display the history of changes for an entity.
 *
 * @param {string} id - The identifier for the entity.
 * @param {string} entityType - The type of entity being viewed.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 */
export default function HistoryModal(props: Readonly<HistoryModalProps>) {
    const dict: Dictionary = useDictionary();
    const [historyDetails, setHistoryDetails] = useState<HistoryDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // A hook that fetches data initially
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            const url: string = makeInternalRegistryAPIwithParams(
                InternalApiIdentifierMap.HISTORY,
                props.id,
                props.lifecycleStage == LifecycleStageMap.ACTIVITY ? "bill" :
                    props.lifecycleStage == LifecycleStageMap.OUTSTANDING ||
                        props.lifecycleStage == LifecycleStageMap.SCHEDULED ||
                        props.lifecycleStage == LifecycleStageMap.CLOSED ? "task" :
                        props.entityType,
            );
            const res: AgentResponseBody = await queryInternalApi(url);
            setHistoryDetails(res.data.items as HistoryDetails[]);
            setIsLoading(false);
        };

        fetchData();
    }, []);

    return (
        <Modal className="!w-full md:!max-w-2xl lg:!max-w-4xl !h-auto  !min-h-[60vh] max-h-[60vh] md:!min-h-[70vh] md:!max-h-[70vh] !rounded-xl !shadow-xl !border !border-border p-4" isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
            <div className="flex flex-col my-auto w-full mt-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-base md:text-lg font-semibold">{dict.title.history}</h1>
                    </div>
                    <p className="text-sm md:text-base">{historyDetails.length} {historyDetails.length > 1 || historyDetails.length === 0 ? dict.message.entries : dict.message.entry}</p>
                </div>
                {!isLoading && (

                    <div className="mt-2 w-full overflow-y-auto max-h-[42vh] md:max-h-[60vh] border rounded-lg border-border/50">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="text-left text-sm text-foreground">
                                    <th className="sticky top-0 bg-ring z-10 border-b border-border/50 p-2">{dict.action.date}</th>
                                    <th className="sticky top-0 bg-ring z-10 border-b border-border/50 p-2">{dict.title.user}</th>
                                    <th className="sticky top-0 bg-ring z-10 border-b border-border/50 p-2">{dict.title.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {historyDetails.length > 0 ? historyDetails.map((history, index) => (
                                    <tr key={index} className="text-sm text-muted-foreground hover:bg-muted/30 ">
                                        <td className="py-3 px-2">{formatValueByDataType(history?.timestamp?.value, XSD_DATETIME)}</td>
                                        <td className="py-3 px-2">{history?.user?.value ?? "-"}</td>
                                        <td className="py-3 px-2">{history?.message?.value}</td>
                                    </tr>
                                )) :
                                    <tr>
                                        <td colSpan={3} className="p-2">{dict.message.noEntries}</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                )}
                {isLoading && <div className="flex justify-center items-center h-48">
                    <LoadingSpinner isSmall={false} />
                </div>}
            </div>
        </Modal>
    )
}
