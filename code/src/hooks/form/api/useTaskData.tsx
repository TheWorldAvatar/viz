import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { AgentResponseBody } from "types/backend-agent";
import { RegistryTaskOption, SparqlResponseField } from "types/form";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

interface UseTaskDataResult {
    task: RegistryTaskOption | null;
}

/**
 * A custom hook to retrieve task data for a given task ID.
 *
 * @param {string} id The task identifier.
 * @param {Dispatch<SetStateAction<boolean>>} setIsFetching External state setter for fetching status.
 * @returns {UseTaskDataResult} The task data.
 */
export function useTaskData(
    id: string,
    setIsFetching: Dispatch<SetStateAction<boolean>>
): UseTaskDataResult {
    const [task, setTask] = useState<RegistryTaskOption | null>(null);

    useEffect(() => {
        const fetchTask = async (): Promise<void> => {
            setIsFetching(true);
            try {
                const resBody: AgentResponseBody = await queryInternalApi(
                    makeInternalRegistryAPIwithParams("tasks", "task", id)
                );
                const itemData: Record<string, SparqlResponseField> = resBody.data?.items?.[0] as Record<string, SparqlResponseField>;
                const item: RegistryTaskOption = {
                    contract: itemData.contract.value,
                    status: itemData.status.value,
                    date: itemData.date.value,
                    scheduleType: itemData.scheduleType.value,
                }

                setTask(item);

            } catch (error) {
                console.error("Failed to fetch task data:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (id) {
            fetchTask();
        }
    }, [id, setIsFetching]);

    return { task };
}