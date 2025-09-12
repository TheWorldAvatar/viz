"use client";
import { useId, useState } from 'react';

export interface FormQuickViewState {
    id: string;
    isQuickViewOpen: boolean;
    setIsQuickViewOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A custom hook to set up the states for the quick view panel of the selected dropdown option for a form.
 */
export function useFormQuickView(
): FormQuickViewState {
    const id: string = useId();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(true);
    return {
        id,
        isQuickViewOpen,
        setIsQuickViewOpen,
    };
};
