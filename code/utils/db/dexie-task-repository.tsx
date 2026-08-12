import { AgentResponseBody, AgentResponseDataPayload, ColumnDefinitionResponse } from "@/types/backend-agent";
import { IndexedDbState, IndexedDbStateMap, LifecycleStageMap, RegistryFieldValues } from "@/types/form";
import { flattenInstance } from "@/ui/graphic/table/registry/registry-table-utils";
import { db, DynamicTask, IndexedDbMetadata } from "@/utils/db/db";
import { EntityTable } from "dexie";
import { FieldValues } from "react-hook-form";
import { getId, getUTCDate } from "../client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "../internal-api-services";

export const TASK_SYNC_EVENT: string = "task_sync";
class DexieTaskRepository {
    private TASK_KEY: string = "tasks";
    private INITIAL_BATCH_SIZE: number = 100;
    private BATCH_SIZE: number = 500;
    private STALE_TIME_S: number = 5 * 60;

    /**
     * Retrieves the field key for tasks.
    */
    getFieldKey(): string {
        return this.TASK_KEY;
    }

    /**
     * Get the initial batch size.
     */
    getInitialBatchSize(): number {
        return this.INITIAL_BATCH_SIZE;
    }

    /**
     * Remove the target task in IndexedDb.
     * 
     * @param {string} id Target task identifier.
     */
    async removeTask(id: string): Promise<void> {
        const meta: IndexedDbMetadata = await db.metadata.get(this.TASK_KEY);
        await this.updateMeta(meta?.state, meta?.count - 1, meta?.columns);
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
     * Start the sync with the database to get the initial batch for first render.
     * 
     * @param {string} entityType The entity type.
     * @param {string} sortParams The parameters for sorting.
     * @param {string} filters The parameters for filters.
     * @param {boolean} isConnected Indicates if the platform is online.
     * @param {boolean} hasFiltersChanged Indicates if the filters has changed since previous sync.
     */
    async syncInitialBatch(entityType: string, sortParams: string, filters: string,
        isConnected: boolean, hasFiltersChanged: boolean): Promise<AgentResponseDataPayload> {
        const meta: IndexedDbMetadata = await db.metadata.get(this.TASK_KEY);
        const table: EntityTable<DynamicTask, "task_id"> = db.tasks;

        // When the device is online, filters have changed, and either no cached metadata exists 
        // or the cached data exceeds the allowed stale time limit clear and resync the data
        const reqFetch: boolean = !meta || (this.genCurrentTimestamp() - meta?.lastUpdated > this.STALE_TIME_S);
        if (isConnected && (hasFiltersChanged || reqFetch)) {
            await table.clear();
            return await this.fetchTasks(entityType, "0", this.INITIAL_BATCH_SIZE.toString(), sortParams, filters, isConnected);
        }

        return {
            items: await table.limit(100).toArray(),
            totalItems: meta?.count,
            columns: meta?.columns,
        }
    }

    /**
     * Start the sync with the database.
     * 
     * @param {string} entityType The entity type.
     * @param {string} sortParams The parameters for sorting.
     * @param {string} filters The parameters for filters.
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
        const meta: IndexedDbMetadata = await db.metadata.get(this.TASK_KEY);
        // Trigger fetch only when online, and data is either syncing or stale
        let isStale: boolean = meta?.state == IndexedDbStateMap.COMPLETE && (this.genCurrentTimestamp() - meta?.lastUpdated > this.STALE_TIME_S);
        const triggerFetch: boolean = isConnected && (meta?.state == IndexedDbStateMap.SYNC || isStale);
        while (hasMore && triggerFetch) {
            const responsePayload: AgentResponseDataPayload = await dexieTaskRepo.fetchTasks(
                entityType, Math.floor(currentOffset / this.BATCH_SIZE).toString(), this.BATCH_SIZE.toString(),
                sortParams, filters, isConnected);

            const nextBatch: FieldValues[] = responsePayload.items as FieldValues[];
            currentOffset += nextBatch.length;

            if (nextBatch.length < this.BATCH_SIZE) {
                hasMore = false;
            }
            // To prevent data clearing after first stale check, but status will change to sync instead
            isStale = false;
        }
    }

    private async fetchTasks(entityType: string, page: string, limit: string,
        sortParams: string, filters: string, isConnected: boolean): Promise<AgentResponseDataPayload> {
        const meta: IndexedDbMetadata = await db.metadata.get(this.TASK_KEY);
        if (!isConnected) {
            return {
                items: [],
                totalItems: meta?.count,
                columns: meta?.columns,
            }
        }

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
        const table: EntityTable<DynamicTask, "task_id"> = db.tasks;
        if (res.data?.items?.length > 0) {
            (res.data?.items as RegistryFieldValues[]).forEach(instance => {
                const flattenedInstance: FieldValues = flattenInstance(instance);
                data.push({
                    task_id: getId(flattenedInstance["event_id"]),
                    ...flattenedInstance
                });
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