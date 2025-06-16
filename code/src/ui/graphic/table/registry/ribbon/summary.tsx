import { useEffect, useState } from "react";

import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues } from "types/form";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import Accordion from "ui/text/accordion/accordion";
import AccordionField from "ui/text/accordion/accordion-field";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

interface SummarySectionProps {
  id: string;
  entityType: string;
}

/**
 * This component renders a summary section for the target contract in the registry.
 *
 * @param {string} id The contract's identifier.
 * @param {string} entityType The contract resource ID.
 */
export default function SummarySection(props: Readonly<SummarySectionProps>) {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contract, setContract] = useState<RegistryFieldValues>(null);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const contractRes: RegistryFieldValues = await fetch(
          makeInternalRegistryAPIwithParams(
            "instances",
            props.entityType,
            "true",
            props.id
          ),
          { cache: "no-store", credentials: "same-origin" }
        ).then((response) => response.json());

        setContract(contractRes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex justify-between items-center">
      <Accordion title={dict.title.description} isLoading={isLoading}>
        {contract &&
          Object.keys(contract).map((field, index) => {
            if (
              field != "id" &&
              !Array.isArray(contract[field]) &&
              contract[field].value
            ) {
              return (
                <AccordionField
                  key={field + index}
                  name={field}
                  value={contract[field].value}
                />
              );
            }
          })}
      </Accordion>
      <div className="ml-0 ">
        <RedirectButton
          size="icon"
          leftIcon="read_more"
          url={`${Routes.REGISTRY}/${props.entityType}/${props.id}`}
          tooltipText={dict.action.viewMore}
        />
      </div>
    </div>
  );
}
