import { useConnected } from "@/hooks/useConnected";
import { localStorageManager } from "@/state/browser-storage-manager";
import { Dictionary } from "@/types/dictionary";
import { toast } from "@/ui/interaction/action/toast/toast";
import { db, DynamicTask } from "@/utils/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { interpolate } from "../client-utils";
import { TASK_VIEWER_FILTER } from "../constants";

/**
 * Clear all tasks in IndexedDb.
 */
export async function clearTasks(): Promise<void> {
    await db.tasks.clear();
}

/**
 * Bulk update tasks in IndexedDb.
 *
 * @param {FieldValues[]} instances Target tasks.
 */
export async function bulkPutTasks(instances: FieldValues[]): Promise<void> {
    await db.tasks.bulkPut(instances);
}

/**
 * Get task from IndexedDb.
 *
 * @param {string} id Target task identifier.
 */
export async function getTask(id: string): Promise<DynamicTask> {
    const task: DynamicTask = await db.tasks.get(id);
    return task;
}

/**
 * Get tasks from IndexedDb in real time.
 *
 * @param {number} mobileFields Mobile specific fields.
 */
export function useLiveTasks(mobileFields: string[], selectedCount: number, dict: Dictionary): {
    data: FieldValues[];
    previewData: FieldValues[];
} {
    const isOnline: boolean = useConnected();
    const tasks: FieldValues[] = useLiveQuery(() => db.tasks.toArray(),
        []);
    return useMemo(() => {
        if (!tasks || tasks.length == 0) return { data: [], previewData: [] };
        if (localStorageManager.get(TASK_VIEWER_FILTER) && selectedCount > 0 && tasks.length != selectedCount) {
            if (isOnline) {
                toast(interpolate(dict.message.showScrollMore, String(tasks.length), String(selectedCount)), "default")
            } else {
                toast(interpolate(dict.message.showReconnect, String(tasks.length), String(selectedCount)), "error")
            }
        }
        return {
            data: tasks?.map(instance => {
                return {
                    id: instance.id,
                    ["scheduleType"]: dict.form[instance["scheduleType"]],
                    ...Object.fromEntries(
                        Object.entries(instance).filter(([key, value]) =>
                            !["iri", "id", "event_id", "status", "scheduleType", "lastmodified"].includes(key) && value !== null && value !== undefined)
                    )
                }
            }),
            previewData: tasks?.map(instance => {
                // When there are no custom settings, ensure only values with contents are returned
                if (mobileFields.length === 0) return {
                    // Extract event id to support redirects
                    event_id: instance.event_id,
                    ...Object.fromEntries(
                        Object.entries(instance).filter(([key, value]) => key != "iri" && key != "event_id" && value !== null && value !== undefined)
                    )
                };
                return {
                    id: instance.id,
                    event_id: instance.event_id,
                    date: instance.date,
                    status: instance.status,
                    ...Object.fromEntries(
                        // Filter out undefined fields
                        mobileFields.filter(field => !!instance[field as keyof typeof instance])
                            .map(field => [field, instance[field as keyof typeof instance]])
                    )
                }
            })
        };
    }, [tasks, mobileFields]);
}