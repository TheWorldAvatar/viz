import iconStyles from 'ui/graphic/icon/icon-button.module.css';
import styles from '../registry.table.module.css';

import { useRouter } from 'next/navigation';
import React from 'react';
import { FieldValues } from 'react-hook-form';

import { Routes } from 'io/config/routes';
import { RegistryTaskOption } from 'types/form';
import MaterialIconButton from 'ui/graphic/icon/icon-button';
import { Status } from 'ui/text/status/status';
import { getId } from 'utils/client-utils';

interface RegistryRowActionsProps {
  recordType: string;
  lifecycleStage: string;
  row: FieldValues;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

/**
 * Renders the possible row actions for each row in the registry.
 * 
 * @param {string} recordType The type of the record.
 * @param {string} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {FieldValues} row Row values.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function RegistryRowActions(props: Readonly<RegistryRowActionsProps>) {
  const router = useRouter();
  const recordId: string = props.row.event_id ?
    getId(props.row.event_id) :
    props.row.id ? getId(props.row.id) : props.row.iri;

  const handleClickView = (): void => {
    if (props.lifecycleStage == Routes.REGISTRY_ACTIVE || props.lifecycleStage == Routes.REGISTRY_ARCHIVE) {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY_REPORT}/${recordId}`);
    } else if (props.lifecycleStage == Routes.REGISTRY_TASK_DATE || props.lifecycleStage == Routes.REGISTRY_REPORT) {
      let status: string;
      if (props.row.order === "0" || props.row.event === "https://www.theworldavatar.com/kg/ontoservice/OrderReceivedEvent") {
        status = Status.PENDING_DISPATCH;
      } else if (props.row.order === "1" || props.row.event === "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent") {
        status = Status.PENDING_EXECUTION;
      } else if (props.row.order === "2" || props.row.event === "https://www.theworldavatar.com/kg/ontoservice/ServiceDeliveryEvent") {
        status = Status.COMPLETED;
      } else if (props.row.order === "3" || props.row.event === "https://www.theworldavatar.com/kg/ontoservice/TerminatedServiceEvent") {
        status = Status.CANCELLED;
      } else if (props.row.order === "4" || props.row.event === "https://www.theworldavatar.com/kg/ontoservice/IncidentReportEvent") {
        status = Status.INCOMPLETE;
      } else {
        status = "";
      }
      props.setTask({
        id: recordId,
        status: status,
        contract: props.row.id,
        date: props.row.date,
      });
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  return (
    <div className={styles["table-icon-cell"]}>
      <MaterialIconButton
        iconName="expand_circle_right"
        iconStyles={[iconStyles["small-icon"], styles["expand-icon"]]}
        onClick={handleClickView}
      />
    </div>
  );
}