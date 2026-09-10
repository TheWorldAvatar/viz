"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useDictionary } from "@/hooks/useDictionary";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { OntologyConcept } from "@/types/form";
import TextField from "@/ui/text/field/field";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import Button from "../../button";

interface FormQuickViewConceptProps {
  label: string;
  conceptUri: string;
}

/**
 * A component that renders an ontology concept field for a form quick view panel.
 * 
 * @param {string} label - The field name.
 * @param {string} conceptUri - The IRI of the concept.
 **/
export default function FormQuickViewConcept(
  props: Readonly<FormQuickViewConceptProps>
) {
  const dict: Dictionary = useDictionary();

  const [concept, setConcept] = useState<OntologyConcept>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        setIsLoading(true);
        const body: AgentResponseBody = await queryInternalApi(
          makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.CONCEPT, props.conceptUri)
        );
        setConcept(body.data?.items?.[0] as OntologyConcept);
      } catch (error) {
        console.error("Error fetching concept:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && !concept) {
      fetchConcept();
    }
  }, [isOpen, concept, props.conceptUri]);

  return (
    <div className="flex flex-col py-2 w-full">
      <div className="flex flex-row items-baseline ">
        <h4 className="shrink-0 w-28 lg:w-36 text-sm sm:text-base text-foreground capitalize font-semibold flex-wrap">
          {props.label}
        </h4>
        <div className="flex-1 text-sm sm:text-base text-foreground flex gap-2">
          <Button
            type="button"
            size="icon"
            tooltipText={isOpen ? dict.action.hide : dict.action.show}
            leftIcon={isOpen ? ChevronUp : ChevronDown}
            onClick={() => setIsOpen(!isOpen)}
            variant={isOpen ? "secondary" : "outline"}
            loading={isLoading}
          />
        </div>
      </div>
      {isOpen && !isLoading && (
        <div className="mt-2 rounded-lg p-2 bg-background shadow-md">
          <p className="text-sm sm:text-base text-foreground font-semibold">
            {concept?.label?.value ?? "—"}
          </p>
          {concept?.description?.value && (
            <TextField content={concept.description.value} />
          )}
        </div>
      )}
    </div>
  );
}
