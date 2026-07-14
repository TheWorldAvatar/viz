import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useConnected } from "@/hooks/useConnected";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { RegistryTaskOption, SparqlResponseField } from "@/types/form";
import { BULK_IDENTIFIER } from "@/utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { DynamicTask } from "@/utils/table/db";
import { getTask } from "@/utils/table/dexie-utils";

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
    const isConnected: boolean = useConnected();

    useEffect(() => {
        const fetchTask = async (): Promise<void> => {
            setIsFetching(true);
            try {
                let item: RegistryTaskOption = null;
                if (isConnected) {
                    const resBody: AgentResponseBody = await queryInternalApi(
                        makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.TASKS, "task", id)
                    );
                    const itemData: Record<string, SparqlResponseField> = resBody.data?.items?.[0] as Record<string, SparqlResponseField>;
                    item = {
                        id: id,
                        contract: itemData.contract.value,
                        status: itemData.status.value,
                        date: itemData.date.value,
                        scheduleType: itemData.scheduleType.value,
                    }
                } else {
                    const cachedTask: DynamicTask = await getTask(id);
                    item = {
                        id: id,
                        contract: cachedTask.id as string,
                        status: cachedTask.status as string,
                        date: cachedTask.date as string,
                        scheduleType: cachedTask.scheduleType as string,
                    }
                }

                setTask(item);
            } catch (error) {
                console.error("Failed to fetch task data:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (id && id != BULK_IDENTIFIER) {
            fetchTask();
        }
    }, [id, setIsFetching]);

    return { task };
}