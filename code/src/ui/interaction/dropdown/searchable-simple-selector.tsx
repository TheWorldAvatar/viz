import { useEffect, useRef, useState } from "react";
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
    reqNotApplicableOption?: boolean;
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
 * @param {boolean} reqNotApplicableOption Optional parameter to enable the not applicable option. Defaults to false.
 */
export default function SearchableSimpleSelector(
    props: Readonly<SearchableSimpleSelectorProps>
) {
    const dict: Dictionary = useDictionary();
    const [inputValue, setInputValue] = useState<string>("");
    const hasInitializedNA = useRef(false);
    const naOption: SelectOptionType = { value: "", label: dict.message.na }
    const [selectedOption, setSelectedOption] = useState<SelectOptionType | null>(() => {
        // If NA option is required, use NA option
        if (props.reqNotApplicableOption) {
            return naOption;
        }
        return props.initialValue || null;
    });

    // Add NA option at the start if required
    const parsedOptions: SelectOptionType[] = props.reqNotApplicableOption
        ? [naOption, ...props.options]
        : props.options;


    useEffect(() => {
        if (
            !hasInitializedNA.current &&
            props.reqNotApplicableOption &&
            (!props.initialValue || props.initialValue.value === "")
        ) {
            hasInitializedNA.current = true;
            setSelectedOption(naOption);
            props.onChange(naOption);
        }
    }, [props.reqNotApplicableOption, props.initialValue, naOption]);

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
            options={parsedOptions}
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
