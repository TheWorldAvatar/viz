import styles from './summary.module.css';

import { useEffect, useState } from 'react';

import { useDictionary } from 'hooks/useDictionary';
import { Routes } from 'io/config/routes';
import { Dictionary } from 'types/dictionary';
import { RegistryFieldValues } from 'types/form';
import RedirectButton from 'ui/interaction/action/redirect/redirect-button';
import Accordion from 'ui/text/accordion/accordion';
import AccordionField from 'ui/text/accordion/accordion-field';
import InternalApiServices, { InternalApiIdentifier } from 'utils/internal-api-services';

interface SummarySectionProps {
  id: string;
  entityType: string;
}

/**
 * This component renders a summary section for the target contract in the registry.
 * 
 * @param {string} id The contract's identifier.
 * @param {string} entityType The contract resource ID.
 * @param {string} registryAgentApi The target endpoint for the registry agent.
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
        const contractRes: RegistryFieldValues = await fetch(InternalApiServices.getRegistryApi(InternalApiIdentifier.INSTANCES, props.entityType, "true", props.id),
          { cache: 'no-store', credentials: 'same-origin' }
        ).then((response) => response.json())

        setContract(contractRes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles["container"]}>
      <Accordion
        title={dict.title.description}
        isLoading={isLoading}
      >{contract && Object.keys(contract).map((field, index) => {
        if (field != "id" && !Array.isArray(contract[field]) && contract[field].value) {
          return <AccordionField
            key={field + index}
            name={field}
            value={contract[field].value}
          />
        }
      })}</Accordion>
      <div className={styles["action"]}>
        <RedirectButton
          icon="read_more"
          url={`${Routes.REGISTRY}/${props.entityType}/${props.id}`}
          isActive={false}
          tooltipText={dict.action.viewMore}
        />
      </div>
    </div>
  );
}