"use client";
import { useEffect, useId, useState } from 'react';
import { AgentResponseBody } from 'types/backend-agent';
import { FormTemplateType, QuickViewGroupings } from 'types/form';
import { parseFormTemplateForQuickViewGroupings } from 'ui/interaction/form/form-utils';
import { getAfterDelimiter } from 'utils/client-utils';
import { makeInternalRegistryAPIwithParams } from 'utils/internal-api-services';

export interface FormQuickViewState {
    id: string;
    selectedEntityId: string;
    quickViewGroups: QuickViewGroupings;
    isQuickViewLoading: boolean;
    isQuickViewOpen: boolean;
    setIsQuickViewOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A custom hook to set up the states for the quick view panel of the selected dropdown option for a form.
 * 
 * @param {string} selectedEntity - The currently selected entity.
 * @param {string} entityType - The type of the entity.
 */
export function useFormQuickView(
    selectedEntity: string,
    entityType: string,
): FormQuickViewState {
    const id: string = useId();
    const selectedEntityId: string = selectedEntity ? getAfterDelimiter(selectedEntity, "/") : undefined;

    const [quickViewGroups, setQuickViewGroups] = useState<QuickViewGroupings>({});
    const [isQuickViewLoading, setIsQuickViewLoading] = useState<boolean>(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsQuickViewLoading(true);
                const template: FormTemplateType = await fetch(
                    makeInternalRegistryAPIwithParams("form", entityType, selectedEntityId),
                    {
                        cache: "no-store",
                        credentials: "same-origin",
                    }
                ).then(async (res) => {
                    const body: AgentResponseBody = await res.json();
                    return body.data?.items?.[0] as FormTemplateType;
                });
                const quickViewGroups: QuickViewGroupings = parseFormTemplateForQuickViewGroupings(template);
                setQuickViewGroups(quickViewGroups)
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsQuickViewLoading(false);
            }
        };

        if (isQuickViewOpen) {
            fetchData();
        };
    }, [isQuickViewOpen, entityType, selectedEntity]);

    return {
        id,
        selectedEntityId,
        quickViewGroups,
        isQuickViewLoading,
        isQuickViewOpen,
        setIsQuickViewOpen,
    };
};
