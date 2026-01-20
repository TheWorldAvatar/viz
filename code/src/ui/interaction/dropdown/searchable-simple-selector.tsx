import { useState } from "react";
import Select, {
    MultiValue,
    SingleValue
} from "react-select";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { selectorStyles } from "ui/css/selector-style";
import { SelectOptionType } from "./simple-selector";

interface SearchableSimpleSelectorProps {
    options: SelectOptionType[];
    initialValue: SelectOptionType;
    onChange: (_value: SelectOptionType | null) => void;
    onSearchChange: (_searchValue: string) => void;
    isLoading?: boolean;
    isDisabled?: boolean;
    noOptionMessage?: string;
}

/**
 * A searchable single-select dropdown that queries options dynamically as the user types. Only one option is selectable at a time.
 *
 * @param {SelectOptionType[]} options The list of options to display.
 * @param {SelectOptionType} initialValue The initial value.
 * @param onChange Function called when a selection is made.
 * @param onSearchChange Function called when the search input changes, to trigger dynamic option loading.
 * @param {boolean} isLoading Optional flag to show loading state.
 * @param {boolean} isDisabled Optional flag to disable the selector.
 * @param {string} noOptionMessage Optional message to display when no options are available.
 */
export default function SearchableSimpleSelector(
    props: Readonly<SearchableSimpleSelectorProps>
) {
    const dict: Dictionary = useDictionary();
    const [inputValue, setInputValue] = useState<string>("");
    const [selectedOption, setSelectedOption] = useState<SelectOptionType | null>(props.initialValue ?? null);

    const handleChange = (
        newValue: SingleValue<SelectOptionType> | MultiValue<SelectOptionType>,
    ) => {
        const value: SelectOptionType = newValue as SelectOptionType;
        setSelectedOption(value);
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
            styles={selectorStyles}
            options={props.options}
            value={selectedOption}
            onChange={handleChange}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            isLoading={props.isLoading}
            isSearchable
            isDisabled={props.isDisabled}
            noOptionsMessage={props.noOptionMessage ? () => props.noOptionMessage : () => dict.message.noOptions}
        />
    );
}
