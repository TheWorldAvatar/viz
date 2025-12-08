"use client"

import { useState } from "react"
import Button from "ui/interaction/button"
import { useDictionary } from "hooks/useDictionary"
import { Dictionary } from "types/dictionary"

interface SelectedDatesDisplayProps {
    dates: Date[]
    onDatesChange: (_dates: Date[]) => void
    disabled?: boolean
}

export default function SelectedDatesDisplay(props: Readonly<SelectedDatesDisplayProps>) {
    const dict: Dictionary = useDictionary()
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const sortedDates: Date[] = [...props.dates].sort((a, b) => a.getTime() - b.getTime())

    const handleRemoveDate = (indexToRemove: number) => {
        const updatedDates: Date[] = props.dates.filter((_, index) => index !== indexToRemove)
        props.onDatesChange(updatedDates)
    }

    return (
        <div className="w-full space-y-2">
            <div className={`w-full rounded-lg flex items-center justify-between  ${props.disabled ? "opacity-75" : ""}`}>
                <div className="flex items-center gap-2 text-left">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ring text-foreground font-semibold text-sm">
                        {props.dates.length}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">
                            {props.dates.length === 1 ? dict.form.dateSelected : dict.form.datesSelected}
                        </span>
                    </div>
                </div>
                <Button
                    onClick={(e) => {
                        e.preventDefault()
                        setIsExpanded(!isExpanded)
                    }}
                    leftIcon={isExpanded ? "expand_less" : "expand_more"}
                    variant="outline"
                    size="icon"
                    iconSize="small"
                />
            </div>

            {isExpanded && (
                <div className={`bg-muted border border-border rounded-lg overflow-hidden ${props.disabled ? "opacity-75" : ""}`}>
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                        {sortedDates.map((date, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between border-b last:border-b-0 border-border "
                            >
                                <div className="flex items-center ">
                                    <span className="text-sm font-medium text-foreground">
                                        {date.toLocaleDateString()}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    leftIcon="close"
                                    variant="ghost"
                                    size="icon"
                                    iconSize="small"
                                    className="w-8 h-8 text-red-400 hover:bg-red-100 dark:text-red-600 dark:hover:!bg-red-200 mb-1"
                                    onClick={() => {
                                        // Find index by timestamp value 
                                        const originalIndex = props.dates.findIndex(d => d.getTime() === date.getTime());
                                        handleRemoveDate(originalIndex);
                                    }}
                                    disabled={props.disabled || props.dates.length === 1}
                                    aria-label={`Remove date ${date.toLocaleDateString()}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
