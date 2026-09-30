import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { getRowRecordId } from "@/ui/graphic/table/registry/registry-table-utils";
import { toast } from "@/ui/interaction/action/toast/toast";
import { getAfterDelimiter } from "@/utils/client-utils";
import { LEXORANK_KEY } from "@/utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { rankBetween } from "@/utils/table/lexorank-utils";
import { useRef, useState } from "react";
import { FieldValues } from "react-hook-form";

interface TableRowOrderDescriptor {
    hasUpdatedOrder: boolean;
    triggerBulkEdit: boolean;
    dirtyTasks: Record<string, FieldValues>;
    applyOrder: (_rows: FieldValues[]) => FieldValues[];
    syncOrder: (_rows: FieldValues[], _newIndex: number) => void;
    syncTasks: (_id: string, _lexorank: string) => void;
    resetOrder: () => void;
    onSyncTasks: () => Promise<void>;
    setTriggerBulkEdit: React.Dispatch<React.SetStateAction<boolean>>,
}

/**
 * A custom hook that remembers the user's custom (drag and drop) row order across table refreshes.
 * The order is held as a list of stable record IDs in a ref, so it survives refetches and remounts
 * of the table itself, but is discarded when the owning page unmounts.
 *
 * @returns Helpers to apply the remembered order to incoming rows, save a new order, and reset it.
 */
export function useTableRowOrder(): TableRowOrderDescriptor {
    // A null ref means no custom order is in effect, and rows are left in the server's order
    const orderRef = useRef<string[] | null>(null);
    const [triggerBulkEdit, setTriggerBulkEdit] = useState<boolean>(false);
    const [dirtyTasks, setDirtyTasks] = useState<Record<string, FieldValues>>({});

    const syncOrder = (rows: FieldValues[], newIndex: number): void => {
        orderRef.current = rows.map(row => getRowRecordId(row));
        if (LEXORANK_KEY in rows[0]) {
            const prevRank: string = rows[newIndex - 1]?.[LEXORANK_KEY] || null;
            const nextRank: string = rows[newIndex + 1]?.[LEXORANK_KEY] || null;
            const newRank: string = rankBetween(prevRank, nextRank);
            rows[newIndex] = {
                ...rows[newIndex],
                [LEXORANK_KEY]: newRank,
            };
            syncTasks(rows[newIndex].event_id, newRank);
        }
    };

    // Sync the dirty task for registry planner to update their lexorank in the end
    const syncTasks = (id: string, lexorank: string): void => {
        const idOnly: string = getAfterDelimiter(id, "/");
        setDirtyTasks((prev) => ({
            ...prev,
            [idOnly]: { id: idOnly, lexorank }, // Overwrites if already dirty, adds if new
        }));
    };
    const onSyncTasks = async (): Promise<void> => {
        const response: AgentResponseBody = await queryInternalApi(
            makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.TASKS, LEXORANK_KEY),
            "PUT", JSON.stringify(Object.values(dirtyTasks)));
        if (response?.error) {
            toast(response?.error?.message, "error");
        } else {
            resetOrder();
            setTriggerBulkEdit(true);
        }
    };

    const resetOrder = (): void => {
        orderRef.current = null;
        setDirtyTasks({});
    };

    // Reorders a freshly fetched page to match the remembered order. Rows that were never part of
    // that order are appended last, and rows that no longer exist drop out of it.
    const applyOrder = (rows: FieldValues[]): FieldValues[] => {
        if (!orderRef.current || !rows?.length) {
            return rows;
        }
        const savedPositions: Map<string, number> = new Map<string, number>();
        orderRef.current.forEach((recordId, index) => {
            if (!savedPositions.has(recordId)) {
                savedPositions.set(recordId, index);
            }
        });
        const savedRows: FieldValues[] = [];
        const newRows: FieldValues[] = [];
        rows.forEach(row => savedPositions.has(getRowRecordId(row)) ? savedRows.push(row) : newRows.push(row));
        // Sorting is stable, so rows sharing a position keep their incoming order
        savedRows.sort((a, b) => savedPositions.get(getRowRecordId(a)) - savedPositions.get(getRowRecordId(b)));
        // Rows added by anyone go last, while rows that disappeared are simply never picked up above
        const ordered: FieldValues[] = [...savedRows, ...newRows];
        orderRef.current = ordered.map(row => getRowRecordId(row));
        return ordered;
    };

    return {
        hasUpdatedOrder: !orderRef.current,
        triggerBulkEdit, dirtyTasks, applyOrder, syncOrder, syncTasks, resetOrder, onSyncTasks, setTriggerBulkEdit
    };
}
