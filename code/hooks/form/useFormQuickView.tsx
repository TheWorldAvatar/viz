"use client";
import { useEffect, useId, useState } from 'react';
import { AgentResponseBody, InternalApiIdentifierMap } from '@/types/backend-agent';
import { FormTemplateType, OntologyConcept, QuickViewGroupings } from '@/types/form';
import { parseConceptForQuickViewGroupings, parseFormTemplateForQuickViewGroupings } from '@/ui/interaction/form/form-utils';
import { getAfterDelimiter } from '@/utils/client-utils';
import { makeInternalRegistryAPIwithParams, queryInternalApi } from '@/utils/internal-api-services';

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
 * @param {boolean} isOntologyConcept - Optionally indicates that the entity is an ontology concept.
 */
export function useFormQuickView(
    selectedEntity: string,
    entityType: string,
    isOntologyConcept?: boolean,
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
                const body: AgentResponseBody = await queryInternalApi(
                    isOntologyConcept
                        ? makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.CONCEPT, selectedEntity)
                        : makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.FORM, entityType, selectedEntityId)
                );
                const quickViewGroups: QuickViewGroupings = isOntologyConcept
                    ? parseConceptForQuickViewGroupings(body.data?.items as OntologyConcept[], selectedEntity)
                    : parseFormTemplateForQuickViewGroupings(body.data?.items?.[0] as FormTemplateType);
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
    }, [isQuickViewOpen, entityType, selectedEntity, isOntologyConcept]);

    return {
        id,
        selectedEntityId,
        quickViewGroups,
        isQuickViewLoading,
        isQuickViewOpen,
        setIsQuickViewOpen,
    };
};
