import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { AgentResponseBody, HistoryDetails, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap } from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { formatValueByDataType } from "ui/graphic/table/registry/registry-table-utils";
import { XSD_DATETIME } from "utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import Modal from "./modal";

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
        <Modal className="!w-full  md:!max-w-2xl lg:!max-w-3xl  !h-auto !min-h-0 !rounded-xl !shadow-xl !border !border-border" isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
            <div className="flex flex-col p-2  w-full max-w-2xl mx-auto mt-4">
                <h2 className="text-xl font-semibold text-foreground">{dict.title.history}</h2>
                {!isLoading && <table>
                    <tr className="bg-ring rounded-sm">
                        <th className="text-foreground">{dict.action.date}</th>
                        <th className="text-foreground">{dict.title.user}</th>
                        <th className="text-foreground">{dict.title.actions}</th>
                    </tr>
                    {historyDetails.map((history, index) => (
                        <tr key={index} className="text-gray-600 dark:text-gray-300">
                            <td >{formatValueByDataType(history?.timestamp?.value, XSD_DATETIME)}</td>
                            <td >{history?.user?.value ?? "-"}</td>
                            <td>{history?.message?.value}</td>
                        </tr>
                    ))}
                </table>}
                {isLoading && <div className="flex justify-center items-center h-48">
                    <LoadingSpinner isSmall={false} />
                </div>}
            </div>
        </Modal>
    )
}
