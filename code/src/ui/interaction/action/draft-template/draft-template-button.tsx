
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import React from "react";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface DraftTemplateButtonProps {
    onDraftTemplate: (() => void | Promise<void>) | React.MouseEventHandler<HTMLButtonElement>;
    recurrenceCount: number;
    setRecurrenceCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function DraftTemplateButton(props: Readonly<DraftTemplateButtonProps>) {
    const dict: Dictionary = useDictionary();
    const { isLoading } = useOperationStatus();

    return (
        <div className="flex gap-2 items-baseline">
            <Button
                leftIcon="content_copy"
                label={dict.action.draftTemplate + " x " + props.recurrenceCount}
                variant="ghost"
                disabled={isLoading}
                onClick={props.onDraftTemplate}
            />
            <div className="flex items-center gap-2">
                <Button
                    leftIcon="remove"
                    size="icon"
                    variant="outline"
                    disabled={isLoading || props.recurrenceCount <= 1}
                    onClick={() => props.setRecurrenceCount(prev => prev - 1)}
                    className="border-dashed"
                />
                <Button
                    leftIcon="add"
                    size="icon"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => props.setRecurrenceCount(prev => prev + 1)}
                    className="border-dashed"
                />
            </div>
        </div>
    )
}