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
                        InternalApiIdentifierMap.FILTER,
                        "general",
                        entityType,
                        debouncedSearch,
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
