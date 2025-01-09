import styles from '../registry.table.module.css';
import iconStyles from 'ui/graphic/icon/icon-button.module.css';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GridRowModel } from '@mui/x-data-grid';

import MaterialIconButton from 'ui/graphic/icon/icon-button';
import { Routes } from 'io/config/routes';
import { getAfterDelimiter, isValidIRI } from 'utils/client-utils';
import { RegistryTaskOption } from 'types/form';
import { Status } from 'ui/text/status/status';

interface RegistryRowActionsProps {
  recordType: string;
  isTaskPage: boolean;
  row: GridRowModel;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

/**
 * Renders the possible row actions for each row in the registry.
 * 
 * @param {string} recordType The type of the record.
 * @param {boolean} isTaskPage Indicator if the table is currently on the task view.
 * @param {GridRowModel} row Row values.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function RegistryRowActions(props: Readonly<RegistryRowActionsProps>) {
  const router = useRouter();

  const recordId: string = props.row.id ?
    isValidIRI(props.row.id) ?
      getAfterDelimiter(props.row.id, "/") : props.row.id
    : props.row.iri;

  const handleClickView = (): void => {
    if (props.isTaskPage) {
      let status: string;
      switch (props.row.order) {
        case "0": {
          status = Status.PENDING_DISPATCH;
          break;
        }
        case "1": {
          status = Status.PENDING_EXECUTION;
          break;
        }
        case "2": {
          status = Status.COMPLETED;
          break;
        }
        case "3": {
          status = Status.CANCELLED;
          break;
        }
        case "4": {
          status = Status.INCOMPLETE;
          break;
        }
        default: {
          status = "";
          break;
        }
      }
      props.setTask({
        id: recordId,
        status: status,
        contract: props.row.contract,
      });
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  return (
    <div className={styles["table-icon-cell"]}>
      {/* Action buttons or icons */}
      <MaterialIconButton
        iconName="expand_circle_right"
        iconStyles={[iconStyles["small-icon"], styles["expand-icon"]]}
        onClick={handleClickView}
      />
    </div>
  );
}