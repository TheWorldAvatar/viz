import { useDictionary } from "@/hooks/useDictionary";
import { AgentResponseBody } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStageMap, RegistryFieldValues } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import {
    getInitialSortingState,
    getInitialSortParams,
    parseDataForTable
} from "@/ui/graphic/table/registry/registry-table-utils";
import { getId } from "@/utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import {
    SortingState
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import useOperationStatus from "../useOperationStatus";

export interface GridDescriptor {
    isLoading: boolean;
    data: FieldValues[];
    resetFormSession: () => void;
    triggerRefresh: () => void;
}

/**
 * A custom hook to retrieve grid data into functionalities for the registry.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {TableColumnOption[]} mobileFieldOptions Options for the mobile fields.
 */
export function useRegistryGrid(
    entityType: string,
    mobileFieldOptions: TableColumnOption[],
): GridDescriptor {
    const dict: Dictionary = useDictionary();
    const { isLoading, refreshId, startLoading, stopLoading, resetFormSession, triggerRefresh } = useOperationStatus();

    const mobileFields = useRef<string[]>(mobileFieldOptions ? mobileFieldOptions?.map(option => option.name) : []);
    const [data, setData] = useState<FieldValues[]>([]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            startLoading();
            const apiUrl: string = makeInternalRegistryAPIwithParams(LifecycleStageMap.OUTSTANDING, entityType, "20", "50", getInitialSortParams([]), "");
            const res: AgentResponseBody = await queryInternalApi(apiUrl);
            const instances: RegistryFieldValues[] = (res.data?.items as RegistryFieldValues[]) ?? [];
            let parsedData: FieldValues[] = parseDataForTable(instances, [], dict.title, res.data?.columns);
            parsedData = parsedData.map(instance => {
                if (!mobileFields.current) return instance;
                return {
                    id: instance.id,
                    event_id: getId(instance.event_id),
                    date: instance.date,
                    status: instance.status,
                    ...Object.fromEntries(
                        // Filter out undefined fields
                        mobileFields.current.filter(field => !!instance[field as keyof typeof instance])
                            .map(field => [field, instance[field as keyof typeof instance]])
                    )
                }
            });
            setData(parsedData);
            stopLoading();
        };

        fetchData();
    }, [entityType, refreshId]);

    return {
        isLoading,
        data,
        resetFormSession,
        triggerRefresh,
    };
}
