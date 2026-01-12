
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import React, { useState } from "react";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { JsonObject } from "types/json";
import Button from "ui/interaction/button";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { toast } from "../toast/toast";

interface DraftTemplateButtonProps {
    recordType: string;
    rowId: string[];
    triggerRefresh: () => void;
    resetRowSelection?: () => void;
}

/**
 * This component renders a button to draft templates for single or multiple records.
 *
 *  @param {string} recordType The type of the record.
 *  @param {string} rowId The ID of the row to draft the template for.
 *  @param triggerRefresh A function to refresh the table when required.
 *  @param resetRowSelection An optional function to reset the row selection in the table.
 */
export default function DraftTemplateButton(props: Readonly<DraftTemplateButtonProps>) {
    const dict: Dictionary = useDictionary();
    const { isLoading, startLoading, stopLoading } = useOperationStatus();
    const [recurrenceCount, setRecurrenceCount] = useState<number>(1);

    const handleDraftTemplate: React.MouseEventHandler<HTMLButtonElement> = async () => {
        const reqBody: JsonObject = {
            id: props.rowId,
            type: props.recordType,
            recurrence: recurrenceCount
        };

        startLoading();
        const responseBody: AgentResponseBody = await queryInternalApi(
            makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "draft", "copy"),
            "POST",
            JSON.stringify(reqBody)
        );
        stopLoading();
        toast(
            responseBody?.data?.message || responseBody?.error?.message,
            responseBody?.error ? "error" : "success"
        );

        if (!responseBody?.error) {
            props.resetRowSelection?.();
            props.triggerRefresh();
        }
    }

    return (
        <div className="flex gap-1 items-center">
            <Button
                leftIcon="content_copy"
                label={dict.action.draftTemplate + " x "}
                variant="ghost"
                disabled={isLoading}
                onClick={handleDraftTemplate}
            />
            <div className="flex justify-center items-center ">
                <input type="number"
                    min={1}
                    value={recurrenceCount}
                    onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                    className="w-12 p-2 border border-border rounded-md text-sm text-foreground bg-muted"
                    disabled={isLoading}
                />
            </div>
        </div>
    )
}