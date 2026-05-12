"use client";
import { useCallback, useContext, useMemo } from 'react';
import { Dictionary } from 'types/dictionary';
import { DictionaryContext } from '../utils/dictionary/DictionaryContext';

export const useDictionary = () => {
    const dict: Dictionary = useContext(DictionaryContext);
    if (!dict) {
        throw new Error('useDictionary must be used within a DictionaryProvider');
    }

    const defaultFormatter: Intl.NumberFormat = new Intl.NumberFormat("en-GB");
    const translatedFormatter: Intl.NumberFormat = new Intl.NumberFormat(dict.lang);

    // [translatedGroupSeparator, translatedDecimalSeparator, defaultGroupSeparator, defaultDecimalSeparator]
    const numberSeparators: string[] = useMemo(() => {
        return [...getNumberSeparators(translatedFormatter), ...getNumberSeparators(defaultFormatter)]
    }, [dict.lang]
    );

    const toNumberDisplay = useCallback((value: string | number | null | undefined): string => {
        if (value === null || value === undefined) { return ""; }
        // Replace default decimal separator with the translated separator
        return value.toString().replace(numberSeparators[3], numberSeparators[1]);
    }, [numberSeparators]);

    const normaliseNumber = useCallback((value: string): string => {
        if (!value) return "";
        // Drop the group separators from the input
        const cleanVal: string = value.split(numberSeparators[0]).join("")
            // Replace translated decimal separator with the default separator
            .replace(numberSeparators[1], numberSeparators[3])
            // Remove anything that isn't a digit or the one allowed dot
            .replace(/[^0-9.]/g, "");

        // Prevent the addition of multiple default decimal separators ie .
        const parts: string[] = cleanVal.split(numberSeparators[3]);
        if (parts.length > 2) {
            // Keep the first part, join the rest of the parts together
            return parts[0] + numberSeparators[3] + parts.slice(1).join("");
        }
        return cleanVal;
    }, [numberSeparators]);

    return {
        ...dict,
        toNumberDisplay,
        normaliseNumber,
    };
};

function getNumberSeparators(formatter: Intl.NumberFormat): string[] {
    const parts: Intl.NumberFormatPart[] = formatter.formatToParts(1000.1);
    const groupSeparator: string = parts.find((part) => part.type === "group")?.value || ",";
    const decimalSeparator: string = parts.find((part) => part.type === "decimal")?.value || ".";
    return [groupSeparator, decimalSeparator];
}