import { AgentResponseBody, AgentResponseDataPayload, ColumnDefinitionResponse } from "@/types/backend-agent";
import { IndexedDbState, IndexedDbStateMap, LifecycleStageMap, RegistryFieldValues } from "@/types/form";
import { flattenInstance } from "@/ui/graphic/table/registry/registry-table-utils";
import { db, DynamicTask } from "@/utils/db/db";
import { EntityTable } from "dexie";
import { FieldValues } from "react-hook-form";
import { getUTCDate } from "../client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "../internal-api-services";

export const TASK_SYNC_EVENT: string = "task_sync";
class DexieTaskRepository {
    private TASK_KEY: string = "tasks";
    private BATCH_SIZE: number = 500;

    /**
     * Retrieves the field key for tasks.
    */
    getFieldKey(): string {
        return this.TASK_KEY;
    }

    /**
     * Remove the target task in IndexedDb.
     * 
     * @param {string} id Target task identifier.
     */
    async removeTask(id: string): Promise<void> {
        await db.tasks.delete(id);
    }

    /**
     * Get task from IndexedDb.
     *
     * @param {string} id Target task identifier.
     */
    async getTask(id: string): Promise<DynamicTask> {
        const task: DynamicTask = await db.tasks.get(id);
        return task;
    }

    /**
     * Start the sync with the database.
     * 
     * @param {string[]} fields The list of fields to sync data for.
     * @param {boolean} isConnected Indicates if the platform is online.
      */
    async sync(entityType: string, sortParams: string, filters: string, isConnected: boolean) {
        if (!isConnected) {
            return;
        }

        // Grab data in batches of 500, and continue looping if syncing
        // If task has been completed, only grab the new data with the timestamp check
        let hasMore: boolean = true;
        let currentOffset: number = 0;
        while (hasMore) {
            const responsePayload: AgentResponseDataPayload = await dexieTaskRepo.fetchTasks(
                entityType, Math.floor(currentOffset / this.BATCH_SIZE).toString(), this.BATCH_SIZE.toString(),
                sortParams, filters, false);

            const nextBatch: FieldValues[] = responsePayload.items as FieldValues[];
            currentOffset += nextBatch.length;

            if (nextBatch.length < this.BATCH_SIZE) {
                hasMore = false;
            }
        }
    }

    async fetchTasks(entityType: string, page: string, limit: string,
        sortParams: string, filters: string, clearData: boolean): Promise<AgentResponseDataPayload> {
        const apiUrl: string = makeInternalRegistryAPIwithParams(
            LifecycleStageMap.OUTSTANDING,
            entityType,
            getUTCDate(new Date()).getTime().toString(),
            page,
            limit,
            sortParams,
            filters,
        );

        const res: AgentResponseBody = await queryInternalApi(apiUrl);

        const data: FieldValues[] = [];
        const table: EntityTable<DynamicTask, "event_id"> = db.tasks;
        if (res.data?.items?.length > 0) {
            // Clear cached data if set required
            if (clearData) {
                await table.clear();
            }
            (res.data?.items as RegistryFieldValues[]).forEach(instance => {
                data.push(flattenInstance(instance));
            });
            await table.bulkPut(data);
        }
        const columns: ColumnDefinitionResponse[] = res.data?.columns;
        if (data?.length < Number.parseFloat(limit)) {
            await this.updateMeta(IndexedDbStateMap.COMPLETE, res.data?.currentItemCount, columns);
        } else {
            await this.updateMeta(IndexedDbStateMap.SYNC, res.data?.currentItemCount, columns);
        }

        return {
            items: data,
            totalItems: res.data?.currentItemCount,
            columns,
        }
    }

    /**
     * Updates the field metadata.
     * 
     * @param {IndexedDbState} state The current state of the field syncing process.
     * @param {number} count The total count of data cached.
     * @param {ColumnDefinitionResponse[]} columns The column definitions received from the API.
    */
    private async updateMeta(state: IndexedDbState, count: number, columns: ColumnDefinitionResponse[]): Promise<void> {
        await db.metadata.put({
            field: this.TASK_KEY,
            state,
            count,
            lastUpdated: this.genCurrentTimestamp(),
            columns,
        });
    }

    /**
     * Generates the current timestamp in seconds.
    */
    private genCurrentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }
}

export const dexieTaskRepo: DexieTaskRepository = new DexieTaskRepository();