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
import { SelectOptionType } from "./simple-selector";

interface SearchableSimpleSelectorProps {
    options: string[];
    initialValue: string;
    onChange: (_value: string) => void;
    onSearchChange: (_searchValue: string) => void;
    isLoading?: boolean;
    isDisabled?: boolean;
}

/**
 * A searchable single-select dropdown that queries options dynamically as the user types. Only one option is selectable at a time.
 *
 * @param {string[]} options The list of option strings to display.
 * @param {string} initialValue The initial value.
 * @param onChange Function called when a selection is made.
 * @param onSearchChange Function called when the search input changes, to trigger dynamic option loading.
 * @param {boolean} isLoading Optional flag to show loading state.
 * @param {boolean} isDisabled Optional flag to disable the selector.
 */
export default function SearchableSimpleSelector(
    props: Readonly<SearchableSimpleSelectorProps>
) {
    const dict: Dictionary = useDictionary();
    const [selectedOption, setSelectedOption] = useState<SelectOptionType>(
        { label: props.initialValue, value: props.initialValue }
    );
    const [inputValue, setInputValue] = useState<string>("");

    const selectOptions: OptionsOrGroups<SelectOptionType, GroupBase<SelectOptionType>> =
        props.options.map((opt) => ({ label: opt, value: opt }));

    const handleChange = (
        newValue: SingleValue<SelectOptionType> | MultiValue<SelectOptionType>,
        _actionMeta: ActionMeta<SelectOptionType>
    ) => {
        const value: string = (newValue as SelectOptionType)?.value;
        setSelectedOption(newValue as SelectOptionType);
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
            options={selectOptions}
            value={selectedOption}
            onChange={handleChange}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            isLoading={props.isLoading}
            isSearchable
            isDisabled={props.isDisabled}
            noOptionsMessage={() => dict.message.noOptions}
        />
    );
}
