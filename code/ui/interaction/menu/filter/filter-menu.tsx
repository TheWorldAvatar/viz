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

    // Prevent hydration issues by updating menu open after and returning no component
    useEffect(() => {
        setIsMenuOpen(!localStorageManager.get(TASK_VIEWER_FILTER))
    }, [])

    if (props.isInitialLoading) {
        return;
    }

    return <PopoverActionButton
        placement="bottom"
        leftIcon="filter_list"
        variant={props.hasNoActiveFilters ? "ghost" : "secondary"}
        isOpen={isMenuOpen}
        setIsOpen={setIsOpen}
        disabled={!isConnected}
        tooltipText={dict.action.filter}
        size="icon"
        aria-label={dict.action.filter}
    >
        <section className="flex justify-between ml-2 items-center">
            <h1>{dict.action.filter}</h1>
            <div className="flex gap-4 items-center">
                <Button
                    leftIcon="filter_list_off"
                    aria-label={dict.action.clearAllFilters}
                    iconSize="medium"
                    className="mt-1"
                    disabled={props.hasNoActiveFilters}
                    size="icon"
                    onClick={() => props.resetFilters()}
                    tooltipText={dict.action.clearAllFilters}
                    variant="destructive"
                />
                {!props.hasNoActiveFilters && <Button
                    leftIcon="close"
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                />}
            </div>
        </section>
        <section className="h-[80vh] overflow-y-auto">
            {props.isInitialLoading ? <LoadingSpinner isSmall={false} /> :
                props.columns.map((column, index) => {
                    if (column.dataType === "array") return;
                    const fieldId: string = column.id;
                    const fieldTitle: string = column.header.toString();
                    const targetFilter: ColumnFilter = props.filters.find(filter => filter.id === fieldId);
                    const currentFilter: string[] = !targetFilter ? [] : (targetFilter.value as string[]);
                    return <Accordion
                        key={index}
                        id={fieldId}
                        title={fieldTitle}
                        isActive={currentFilter.length > 0}
                    >
                        <RegistryFilter
                            type={props.entityType}
                            field={fieldId}
                            fieldType={column.dataType}
                            lifecycleStage={LifecycleStageMap.OUTSTANDING}
                            selectedDate={getInitialDateFromLifecycleStage(LifecycleStageMap.OUTSTANDING, false)}
                            filters={props.filters}
                            onSubmission={(selectedOptions: string[]) => {
                                props.updateFilter(column.id.toString(), selectedOptions);
                            }}
                        />
                    </Accordion>
                })}
        </section>
    </PopoverActionButton>
}