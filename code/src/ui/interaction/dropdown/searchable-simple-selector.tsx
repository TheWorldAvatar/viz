import { useState } from "react";
import Select, {
    ActionMeta,
    GroupBase,
    MultiValue,
    OptionsOrGroups,
    SingleValue,
} from "react-select";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { selectorStyles } from "ui/css/selector-style";

export type SelectOptionType = {
    label: string;
    value: string;
};

interface SearchableSimpleSelectorProps {
    options: string[];
    value: string;
    onChange: (_value: string) => void;
    onSearchChange: (_searchValue: string) => void;
    isLoading?: boolean;
    noOptionMessage?: string;
    placeholder?: string;
    isDisabled?: boolean;
}

/**
 * A searchable single-select dropdown that queries options dynamically as the user types.
 * Combines SimpleSelector's single-select behavior with SearchSelector's dynamic search functionality.
 *
 * @param {string[]} options The list of option strings to display.
 * @param {string} value The currently selected value.
 * @param onChange Function called when a selection is made.
 * @param onSearchChange Function called when the search input changes, to trigger dynamic option loading.
 * @param {boolean} isLoading Optional flag to show loading state.
 * @param {string} noOptionMessage Optional message when no options are available.
 * @param {string} placeholder Optional placeholder text.
 * @param {boolean} isDisabled Optional flag to disable the selector.
 */
export default function SearchableSimpleSelector(
    props: Readonly<SearchableSimpleSelectorProps>
) {
    const dict: Dictionary = useDictionary();
    const [inputValue, setInputValue] = useState<string>("");

    const selectOptions: OptionsOrGroups<SelectOptionType, GroupBase<SelectOptionType>> =
        props.options.map((opt) => ({ label: opt, value: opt }));

    // Find the selected option object
    const selectedOption = props.value
        ? { label: props.value, value: props.value }
        : null;

    const handleChange = (
        newValue: SingleValue<SelectOptionType> | MultiValue<SelectOptionType>,
        _actionMeta: ActionMeta<SelectOptionType>
    ) => {
        const value: string = (newValue as SelectOptionType)?.value;
        setInputValue("");
        props.onChange(value);
    };

    const handleInputChange = (newValue: string, actionMeta: { action: string }) => {
        // Only trigger search on user input, not on menu open/close or other actions
        if (actionMeta.action === "input-change") {
            setInputValue(newValue);
            props.onSearchChange(newValue);
        } else if (actionMeta.action === "menu-close") {
            setInputValue("");
        }
        return newValue;
    };

    return (
        <Select
            options={selectOptions}
            value={selectedOption}
            onChange={handleChange}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            styles={selectorStyles}
            isLoading={props.isLoading}
            isClearable
            isSearchable
            isDisabled={props.isDisabled}
            placeholder={props.placeholder || dict.action.search}
            noOptionsMessage={() => props.noOptionMessage ?? ""}
        />
    );
}
