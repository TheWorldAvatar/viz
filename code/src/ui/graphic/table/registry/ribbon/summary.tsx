import styles from './summary.module.css';

import { useEffect, useState } from 'react';

import { Routes } from 'io/config/routes';
import { RegistryFieldValues } from 'types/form';
import { getData } from 'utils/server-actions';
import Accordion from 'ui/text/accordion/accordion';
import AccordionField from 'ui/text/accordion/accordion-field';
import RedirectButton from 'ui/interaction/action/redirect/redirect-button';

interface SummarySectionProps {
  id: string;
  entityType: string;
  registryAgentApi: string;
}

/**
 * This component renders a summary section for the target contract in the registry.
 * 
 * @param {string} id The contract's identifier.
 * @param {string} entityType The contract resource ID.
 * @param {string} registryAgentApi The target endpoint for the registry agent.
 */
export default function SummarySection(props: Readonly<SummarySectionProps>) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contract, setContract] = useState<RegistryFieldValues>(null);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const contract: RegistryFieldValues[] = await getData(props.registryAgentApi, props.entityType, props.id, null, true);
        setContract(contract[0]);
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
        title="Description"
        isLoading={isLoading}
      >{contract && Object.keys(contract).map((field, index) => {
        if (field != "id" && contract[field].value) {
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
          title="view more"
        />
      </div>
    </div>
  );
}