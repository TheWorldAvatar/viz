"use client"

import { useState } from "react"
import { Icon } from "@mui/material"
import Button from "ui/interaction/button"
import { useDictionary } from "hooks/useDictionary"

interface SelectedDatesDisplayProps {
    dates: Date[]
    onDateRemove: (_index: number) => void
    disabled?: boolean
}

export default function SelectedDatesDisplay(props: Readonly<SelectedDatesDisplayProps>) {
    const dict = useDictionary()
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const sortedDates = [...props.dates].sort((a, b) => a.getTime() - b.getTime())

    return (
        <div className="w-full space-y-2">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full p-3 border border-border rounded-lg flex items-center justify-between transition-all hover:bg-muted/50 bg-muted ${props.disabled ? "opacity-75" : ""}`}
            >
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
                <Icon
                    className="material-symbols-outlined transition-transform"
                    style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    expand_more
                </Icon>
            </button>

            {isExpanded && (
                <div className={`bg-muted border border-border rounded-lg overflow-hidden ${props.disabled ? "opacity-75" : ""}`}>
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                        {sortedDates.map((date, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-background rounded-md border border-border/50"
                            >
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {date.toLocaleDateString(dict.lang === "de" ? "de-DE" : "en-UK", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    leftIcon="close"
                                    variant="ghost"
                                    size="icon"
                                    iconSize="small"
                                    className="w-8 h-8 text-red-400 hover:bg-red-100 dark:text-red-600 dark:hover:!bg-red-200 "
                                    onClick={() => {
                                        // Find index by timestamp value 
                                        const originalIndex = props.dates.findIndex(d => d.getTime() === date.getTime());
                                        props.onDateRemove(originalIndex);
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
