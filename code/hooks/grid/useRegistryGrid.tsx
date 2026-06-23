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
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import {
    SortingState
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";

export interface GridDescriptor {
    isLoading: boolean;
    data: FieldValues[];
}

/**
 * A custom hook to retrieve grid data into functionalities for the registry.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {TableColumnOption[]} tableColumnOptions Table column settings.
 */
export function useRegistryGrid(
    entityType: string,
    tableColumnOptions: TableColumnOption[],
): GridDescriptor {
    const dict: Dictionary = useDictionary();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sorting, setSorting] = useState<SortingState>(getInitialSortingState(tableColumnOptions));
    const [sortParams, setSortParams] = useState<string>(getInitialSortParams(tableColumnOptions));
    const [data, setData] = useState<FieldValues[]>([]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            const apiUrl: string = makeInternalRegistryAPIwithParams(LifecycleStageMap.OUTSTANDING, entityType, "20", "50", sortParams, "");
            const res: AgentResponseBody = await queryInternalApi(apiUrl);
            const instances: RegistryFieldValues[] = (res.data?.items as RegistryFieldValues[]) ?? [];
            const parsedData: FieldValues[] = parseDataForTable(instances, sorting, dict.title, res.data?.columns);
            setData(parsedData);
            setIsLoading(false);
        };

        fetchData();
    }, [sortParams, entityType]);

    return {
        isLoading,
        data
    };
}
