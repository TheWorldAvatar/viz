import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { browserStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { RegistryStatusMap, RegistryTaskOption, SparqlResponseField } from "@/types/form";
import { BULK_IDENTIFIER } from "@/utils/constants";
import { DynamicTask } from "@/utils/db/db";
import { dexieTaskRepo } from "@/utils/db/dexie-task-repository";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";

interface UseTaskDataResult {
    task: RegistryTaskOption | null;
}

/**
 * A custom hook to retrieve task data for a given task ID.
 *
 * @param {string} id The task identifier.
 * @param {boolean} isConnected Checks if the data is connected.
 * @param {Dispatch<SetStateAction<boolean>>} setIsFetching External state setter for fetching status.
 * @returns {UseTaskDataResult} The task data.
 */
export function useTaskData(
    id: string,
    isConnected: boolean,
    setIsFetching: Dispatch<SetStateAction<boolean>>,
): UseTaskDataResult {
    const [task, setTask] = useState<RegistryTaskOption | null>(null);

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
                    const taskId: string = browserStorageManager.get(RegistryStatusMap.COMPLETED)
                    const cachedTask: DynamicTask = await dexieTaskRepo.getTask(taskId);
                    item = {
                        id: taskId,
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
    }, [id, isConnected, setIsFetching]);

    return { task };
}