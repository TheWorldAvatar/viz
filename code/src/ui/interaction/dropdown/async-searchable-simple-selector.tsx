import { useState } from "react";
import {
    MultiValue,
    SingleValue,
} from "react-select";
import AsyncSelect from 'react-select/async';

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { selectorStyles } from "ui/css/selector-style";
import { SelectOptionType } from "./simple-selector";

interface AsyncSearchableSimpleSelectorProps {
    options: (_inputValue: string) => Promise<SelectOptionType[]>;
    initialValue: SelectOptionType;
    onChange: (_value: SelectOptionType | null) => void;
    isDisabled?: boolean;
    noOptionMessage?: string;
}

/**
 * A searchable async single-select dropdown that queries options dynamically as the user types.
 * Only one option is selectable at a time.
 *
 * @param options A function to return options as a promise based on the search value.
 * @param {SelectOptionType} initialValue The initial option.
 * @param onChange Function called when a selection is made.
 * @param {boolean} isDisabled Optional flag to disable the selector.
 * @param {string} noOptionMessage Optional message to display when no options are available.
 */
export default function AsyncSearchableSimpleSelector(
    props: Readonly<AsyncSearchableSimpleSelectorProps>
) {
    const dict: Dictionary = useDictionary();
    const [selectedOption, setSelectedOption] = useState<SelectOptionType>(props.initialValue);

    const handleChange = (
        newValue: SingleValue<SelectOptionType> | MultiValue<SelectOptionType>,
    ) => {
        const value: SelectOptionType = newValue as SelectOptionType;
        setSelectedOption(value);
        props.onChange(value);
    };

    return (
        <AsyncSelect
            styles={selectorStyles}
            value={selectedOption}
            onChange={handleChange}
            loadOptions={props.options}
            defaultOptions
            isSearchable
            isDisabled={props.isDisabled}
            noOptionsMessage={() => props.noOptionMessage ?? dict.message.noOptions}
        />
    );
}
