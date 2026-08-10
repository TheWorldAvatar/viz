import { AgentResponseBody, AgentResponseDataPayload } from "@/types/backend-agent";
import { FormOptionState, FormOptionStateMap, LifecycleStageMap, RegistryFieldValues } from "@/types/form";
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
     * Clear all tasks in IndexedDb.
     */
    async clearTasks(): Promise<void> {
        await db.tasks.clear();
    }

    /**
     * Bulk update tasks in IndexedDb.
     *
     * @param {FieldValues[]} instances Target tasks.
     */
    async bulkPutTasks(instances: FieldValues[]): Promise<void> {
        await db.tasks.bulkPut(instances);
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

        const table: EntityTable<DynamicTask, "event_id"> = await db.tasks;
        // Grab data in batches of 500, and continue looping if syncing
        // If task has been completed, only grab the new data with the timestamp check
        let hasMore: boolean = true;
        let currentOffset: number = 0;
        while (hasMore) {
            const responsePayload: AgentResponseDataPayload = await dexieTaskRepo.fetchTasks(
                entityType, Math.floor(currentOffset / this.BATCH_SIZE).toString(), this.BATCH_SIZE.toString(),
                sortParams, filters);

            const nextBatch: FieldValues[] = responsePayload.items as FieldValues[];
            await table.bulkPut(nextBatch);
            currentOffset += nextBatch.length;

            if (nextBatch.length < this.BATCH_SIZE) {
                hasMore = false;
            }
        }
    }

    async fetchTasks(entityType: string, page: string, limit: string, sortParams: string, filters: string): Promise<AgentResponseDataPayload> {
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
        if (res.data?.items?.length > 0) {
            (res.data?.items as RegistryFieldValues[]).forEach(instance => {
                data.push(flattenInstance(instance));
            });
        }
        if (data?.length < Number.parseFloat(limit)) {
            await this.updateMeta(FormOptionStateMap.COMPLETE, res.data?.currentItemCount);
        } else {
            await this.updateMeta(FormOptionStateMap.SYNC, res.data?.currentItemCount);
        }

        return {
            items: data,
            totalItems: res.data?.currentItemCount,
            columns: res.data?.columns,
        }
    }

    /**
     * Updates the field metadata.
     * 
     * @param {FormOptionState} state The current state of the field syncing process.
     * @param {number} count The total count of data cached.
    */
    private async updateMeta(state: FormOptionState, count: number): Promise<void> {
        await db.metadata.put({
            field: this.TASK_KEY,
            state,
            count,
            lastUpdated: this.genCurrentTimestamp(),
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