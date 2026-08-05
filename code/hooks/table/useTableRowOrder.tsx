import { useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { getRowRecordId } from "@/ui/graphic/table/registry/registry-table-utils";

interface TableRowOrderDescriptor {
    hasCustomOrder: boolean;
    applyOrder: (_rows: FieldValues[]) => FieldValues[];
    saveOrder: (_rows: FieldValues[]) => void;
    resetOrder: () => void;
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
    const [hasCustomOrder, setHasCustomOrder] = useState<boolean>(false);

    const saveOrder = (rows: FieldValues[]): void => {
        orderRef.current = rows.map(row => getRowRecordId(row));
        setHasCustomOrder(true);
    };

    const resetOrder = (): void => {
        orderRef.current = null;
        setHasCustomOrder(false);
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

    return { hasCustomOrder, applyOrder, saveOrder, resetOrder };
}
