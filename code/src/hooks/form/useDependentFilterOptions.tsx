import { useDebounce } from "hooks/useDebounce";
import { useEffect, useState } from "react";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface DependentFilterOptionsDescriptor {
    options: SelectOptionType[];
    isLoading: boolean;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * A custom hook to retrieve dependent entity options with search/filter capability.
 * Queries the backend dynamically as the user types, with debouncing to avoid excessive API calls.
 *
 * @param {string} entityType Type of entity to query.
 */
export function useDependentFilterOptions(
    entityType: string,
): DependentFilterOptionsDescriptor {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [options, setOptions] = useState<SelectOptionType[]>([]);
    const [search, setSearch] = useState<string>("");
    const debouncedSearch: string = useDebounce<string>(search, 500);

    // Fetch entities whenever entity type or search term changes

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const res: AgentResponseBody = await queryInternalApi(
                    makeInternalRegistryAPIwithParams(
                        InternalApiIdentifierMap.INSTANCES,
                        entityType,   // type: params[0]
                        null,         // label: params[1]
                        null,         // identifier: params[2]
                        null,         // subtype: params[3]
                        null,         // page: params[4]
                        null,         // limit: params[5]
                        null,         // sort_by: params[6]
                        null,         // filters: params[7]
                        null,         // branch_delete: params[8]
                        debouncedSearch, // search: params[9]
                    )
                );
                const respOptions: SelectOptionType[] = res.data?.items as SelectOptionType[];
                setOptions(respOptions ?? []);
            } catch (error) {
                console.error("Error fetching dependent entities", error);
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (entityType) {
            fetchData();
        } else {
            setOptions([]);
        }
    }, [entityType, debouncedSearch]);

    return {
        options,
        isLoading,
        setSearch,
    };
}
