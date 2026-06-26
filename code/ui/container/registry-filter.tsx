import { useFilterOptions } from "@/hooks/table/api/useFilterOptions";
import { LifecycleStage } from "@/types/form";
import DateColumnFilter from "@/ui/graphic/table/action/date-column-filter";
import NumericColumnFilter from "@/ui/graphic/table/action/numeric-column-filter";
import TimeColumnFilter from "@/ui/graphic/table/action/time-column-filter";
import SearchSelector from "@/ui/interaction/dropdown/search-selector";
import { XSD_DATE, XSD_DATETIME, XSD_DECIMAL, XSD_INTEGER, XSD_TIME } from "@/utils/constants";
import { ColumnFilter } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import LoadingSpinner from "../graphic/loader/spinner";

interface RegistryFilterProps {
    type: string;
    name: string;
    fieldType: string;
    lifecycleStage: LifecycleStage,
    selectedDate: DateRange;
    filters: ColumnFilter[];
    onSubmission: (_selectedOptions: string[]) => void;
}

/**
 * This component renders a filter for the target field across the registry instances.
 *
 * @param {string} type The entity type to query for.
 * @param {string} field The field name to find filters for.
 * @param {string} fieldType The type of the field.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {DateRange} selectedDate The currently selected date.
 * @param {ColumnFilter[]} filters Current filter state for all applied filters.
 * @param  onSubmission Executes this function on submission.
 */
export default function RegistryFilter(props: Readonly<RegistryFilterProps>) {
    const isDateField: boolean = props.fieldType === XSD_DATE || props.fieldType === XSD_DATETIME;
    const isTimeField: boolean = props.fieldType === XSD_TIME;
    const isNumericField: boolean = props.fieldType === XSD_DECIMAL || props.fieldType === XSD_INTEGER;

    const [currentFilters, setCurrentFilters] = useState<string[]>(getCurrentFilters(props.filters, props.name));

    useEffect(() => {
        setCurrentFilters(getCurrentFilters(props.filters, props.name));
    }, [props.filters, props.name]);

    const {
        options,
        search,
        isLoading,
        setSearch,
    } = useFilterOptions(
        props.type,
        props.name.toLowerCase(),
        props.lifecycleStage,
        props.selectedDate,
        currentFilters,
        props.filters,
        isDateField || isNumericField || isTimeField,
    );

    if (isLoading) {
        return <LoadingSpinner isSmall={true} />
    }
    if (isDateField) {
        return <DateColumnFilter
            label={props.name}
            currentVal={currentFilters[0]}
            onSubmission={props.onSubmission}
        />
    }

    if (isNumericField) {
        return <NumericColumnFilter
            label={props.name}
            currentVal={currentFilters}
            onSubmission={props.onSubmission}
        />
    }

    if (isTimeField) {
        return <TimeColumnFilter
            label={props.name}
            currentVal={currentFilters}
            onSubmission={props.onSubmission}
        />
    }
    return <SearchSelector
        searchString={search}
        options={options}
        label={props.name}
        initSelectedOptions={currentFilters}
        showOptions={!isLoading}
        onSubmission={props.onSubmission}
        setSearchString={setSearch}
    />
}

function getCurrentFilters(filters: ColumnFilter[], field: string): string[] {
    const targetFilter: ColumnFilter = filters.find(filter => filter.id === field.toLowerCase());
    return !targetFilter ? [] : (targetFilter.value as string[]);
}