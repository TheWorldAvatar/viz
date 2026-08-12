import { Dictionary } from "@/types/dictionary";
import { db } from "@/utils/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { FieldValues } from "react-hook-form";

/**
 * Get tasks from IndexedDb in real time.
 *
 * @param {number} mobileFields Mobile specific fields.
 */
export function useLiveTasks(mobileFields: string[], dict: Dictionary): {
    data: FieldValues[];
    previewData: FieldValues[];
} {
    const tasks: FieldValues[] = useLiveQuery(() => db.tasks.toArray(),
        []);
    return useMemo(() => {
        if (!tasks || tasks.length == 0) return { data: [], previewData: [] };

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