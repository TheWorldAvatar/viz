import { useEffect, useState } from "react";
import {
    components,
    MenuListProps,
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

    // If initial value changes, update the selected option as well
    useEffect(() => {
        setSelectedOption(props.initialValue);
    }, [props.initialValue]);

    const handleChange = (
        newValue: SingleValue<SelectOptionType> | MultiValue<SelectOptionType>,
    ) => {
        const value: SelectOptionType = newValue as SelectOptionType;
        setSelectedOption(value);
        props.onChange(value);
    };

    const MenuList = (
        menuProps: MenuListProps<SelectOptionType, false>
    ) => (
        <components.MenuList {...menuProps}>
            {Array.isArray(menuProps.children) && menuProps.children?.length > 20 && (
                <p className="text-sm text-foreground/80 italic px-2 my-1">
                    {dict.message.typeMore}
                </p>
            )}
            {menuProps.children}
            {Array.isArray(menuProps.children) && menuProps.children?.length > 20 && (
                <p className="text-2xl text-foreground/80 italic px-2 ">...</p>
            )}
        </components.MenuList>
    );

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
            components={{ MenuList }}
        />
    );
}
