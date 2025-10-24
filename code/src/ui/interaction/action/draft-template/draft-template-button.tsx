
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import React, { useState } from "react";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { JsonObject } from "types/json";
import Button from "ui/interaction/button";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import { toast } from "../toast/toast";
import { TableDescriptor } from "hooks/table/useTable";

interface DraftTemplateButtonProps {
    triggerRefresh: () => void;
    recordType: string;
    rowId?: string;
    tableDescriptor?: TableDescriptor;
}

/**
 * This component renders a button to draft templates for single or multiple records.
 *
 *  @param triggerRefresh A function to refresh the table when required.
 *  @param {string} recordType The type of the record.
 *  @param {string} rowId The ID of the row to draft the template for.
 *  @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 */

export default function DraftTemplateButton(props: Readonly<DraftTemplateButtonProps>) {
    const dict: Dictionary = useDictionary();
    const { isLoading, startLoading, stopLoading } = useOperationStatus();
    const [recurrenceCount, setRecurrenceCount] = useState<number>(1);

    const handleDraftTemplate: React.MouseEventHandler<HTMLButtonElement> = async () => {
        // Determine contract IDs based on whether it's bulk or single row action
        const contractIds: string[] = props.tableDescriptor
            ? props.tableDescriptor.table.getSelectedRowModel().rows.map(row => row.original.id)
            : props.rowId
                ? [props.rowId]
                : [];

        if (contractIds.length === 0) {
            return;
        }

        const reqBody: JsonObject = {
            id: contractIds,
            type: props.recordType,
            recurrence: recurrenceCount
        };

        startLoading();
        const res = await fetch(
            makeInternalRegistryAPIwithParams("event", "draft", "copy"),
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                credentials: "same-origin",
                body: JSON.stringify(reqBody),
            }
        );

        const responseBody: AgentResponseBody = await res.json();
        stopLoading();
        toast(
            responseBody?.data?.message || responseBody?.error?.message,
            responseBody?.error ? "error" : "success"
        );

        if (!responseBody?.error) {
            // Clear selection if bulk action, and refresh table
            if (props.tableDescriptor) {
                props.tableDescriptor.table.resetRowSelection();
            }
            props.triggerRefresh?.();
        }

    }

    return (
        <div className="flex gap-2 items-baseline">
            <Button
                leftIcon="content_copy"
                label={dict.action.draftTemplate + " x " + recurrenceCount}
                variant="ghost"
                disabled={isLoading}
                onClick={handleDraftTemplate}
            />
            <div className="flex items-center gap-2">
                <Button
                    leftIcon="remove"
                    size="icon"
                    variant="outline"
                    disabled={isLoading || recurrenceCount <= 1}
                    onClick={() => setRecurrenceCount(prev => prev - 1)}
                    className="border-dashed"
                />
                <Button
                    leftIcon="add"
                    size="icon"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => setRecurrenceCount(prev => prev + 1)}
                    className="border-dashed"
                />
            </div>
        </div>
    )
}