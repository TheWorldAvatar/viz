"use client";

import { useConnected } from "@/hooks/useConnected";
import { useDictionary } from "@/hooks/useDictionary";
import { localStorageManager } from "@/state/browser-storage-manager";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStageMap } from "@/types/form";
import RegistryFilter from "@/ui/container/registry-filter";
import LoadingSpinner from "@/ui/graphic/loader/spinner";
import { EnhancedColumnDef } from "@/ui/graphic/table/registry/registry-table-utils";
import Accordion from "@/ui/interaction/accordion/accordion";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import Button from "@/ui/interaction/button";
import { getInitialDateFromLifecycleStage } from "@/utils/client-utils";
import { TASK_VIEWER_FILTER } from "@/utils/constants";
import { ColumnFilter } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";

interface FilterMenuProps {
    isInitialLoading: boolean;
    hasNoActiveFilters: boolean;
    entityType: string;
    columns: EnhancedColumnDef<FieldValues>[];
    filters: ColumnFilter[];
    resetFilters: () => void;
    updateFilter: (_field: string, _selectedOptions: string[]) => void;
}

/**
 * This component renders a filter menu.
 *
 * @param {boolean} isInitialLoading Indicates that the menu is on its first render.
 * @param {boolean} hasNoActiveFilters Indicates that there is no active filter.
 * @param {string} entityType Type of entity for rendering.
 * @param {EnhancedColumnDef<FieldValues>[]} columns The list of filter fields.
 * @param {ColumnFilter[]} filters The current filter state.
 * @param resetFilters A function to reset all filters.
 * @param updateFilter A function to update the filter value.
 */
export default function FilterMenu(props: Readonly<FilterMenuProps>) {
    const dict: Dictionary = useDictionary();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(props.hasNoActiveFilters);
    const isConnected: boolean = useConnected();
    const filterableColumns: EnhancedColumnDef<FieldValues>[] = props.columns.filter(column => column.dataType !== "array");

    const setIsOpen: Dispatch<SetStateAction<boolean>> = (valueOrFn) => {
        // Early termination without active filter to prevent data view
        if (props.hasNoActiveFilters) {
            return;
        }

        if (typeof valueOrFn === "function") {
            setIsMenuOpen((prev) => (valueOrFn as (prevState: boolean) => boolean)(prev));
        } else {
            setIsMenuOpen(valueOrFn);
        }
    };

    // Indicates that a filter other than the submitted field is still active
    const hasOtherActiveFilters = (fieldId: string): boolean => props.filters
        .some(filter => filter.id !== fieldId && filter.id !== "status" && (filter.value as string[])?.length > 0);

    // Prevent hydration issues by updating menu open after and returning no component
    useEffect(() => {
        setIsMenuOpen(!localStorageManager.get(TASK_VIEWER_FILTER))
    }, [])

    if (props.isInitialLoading) {
        return;
    }

    return <PopoverActionButton
        placement="bottom"
        draggable={!props.hasNoActiveFilters}
        bottomSheet
        leftIcon="filter_list"
        variant={props.hasNoActiveFilters ? "outline" : "secondary"}
        isOpen={isMenuOpen}
        setIsOpen={setIsOpen}
        disabled={!isConnected}
        tooltipText={dict.action.filter}
        size="icon"
        className={`${!props.hasNoActiveFilters ? "border border-border" : ""}`}
        aria-label={dict.action.filter}
    >
        <section className="shrink-0 flex justify-between items-center px-1 mb-1">
            <h1 className="text-lg font-semibold">{dict.action.filter}</h1>
        </section>
        <section className={`${props.hasNoActiveFilters ? "max-h-[70vh]" : "max-h-[50vh]"} min-h-0 overflow-y-auto px-1 w-full`}>
            {props.isInitialLoading ? <LoadingSpinner size="xl" /> :
                filterableColumns.length === 0 ?
                    <p className="text-muted-foreground text-center py-2">{dict.message.noTasks}</p> :
                    filterableColumns.map((column, index) => {
                        const fieldId: string = column.id;
                        const fieldTitle: string = column.header.toString();
                        const targetFilter: ColumnFilter = props.filters.find(filter => filter.id === fieldId);
                        const currentFilter: string[] = !targetFilter ? [] : (targetFilter.value as string[]);
                        return <Accordion
                            key={index}
                            id={fieldId}
                            title={fieldTitle}
                            isActive={currentFilter.length > 0}
                            disabled={!isConnected}
                        >
                            <RegistryFilter
                                type={props.entityType}
                                field={fieldId}
                                fieldType={column.dataType}
                                lifecycleStage={LifecycleStageMap.OUTSTANDING}
                                selectedDate={getInitialDateFromLifecycleStage(LifecycleStageMap.OUTSTANDING, false)}
                                filters={props.filters}
                                disabled={!isConnected}
                                className="w-full"
                                onSubmission={(selectedOptions: string[]) => {
                                    if (isConnected) {
                                        props.updateFilter(fieldId, selectedOptions);
                                        if (selectedOptions.length > 0 || hasOtherActiveFilters(fieldId)) {
                                            setIsMenuOpen(false);
                                        }
                                    }
                                }}
                            />
                        </Accordion>
                    })}
        </section>
        <footer className="shrink-0 -mx-2 border-t border-border pt-2 px-3">
            <Button
                leftIcon="filter_list_off"
                label={dict.action.clearAllFilters}
                aria-label={dict.action.clearAllFilters}
                iconSize="medium"
                disabled={props.hasNoActiveFilters || !isConnected}
                onClick={() => props.resetFilters()}
                variant="outline"
                className="w-full min-h-12 justify-center"
            />
        </footer>
    </PopoverActionButton>
}