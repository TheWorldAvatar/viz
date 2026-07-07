import { db } from "@/utils/table/db";
import { FieldValues } from "react-hook-form";

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