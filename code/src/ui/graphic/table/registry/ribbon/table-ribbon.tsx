"use client";

import styles from './table.ribbon.module.css';
import fieldStyles from 'ui/interaction/form/field/field.module.css';

import React from 'react';
import { useProtectedRole } from 'hooks/useProtectedRole';
import { useRouter } from 'next/navigation';

import { Routes } from 'io/config/routes';
import { RegistryFieldValues } from 'types/form';
import { DownloadButton } from 'ui/interaction/action/download/download';
import RedirectButton from 'ui/interaction/action/redirect/redirect-button';
import ActionButton from 'ui/interaction/action/action';
import MaterialIconButton from 'ui/graphic/icon/icon-button';

interface TableRibbonProps {
  path: string;
  entityType: string;
  registryAgentApi: string;
  lifecycleStage: string;
  selectedDate: string;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  triggerRefresh: () => void;
}

/**
 * Renders a ribbon for the view page
 * 
 * @param {string} path The current path name after the last /.
 * @param {string} entityType The type of entity.
 * @param {string} registryAgentApi The target endpoint for default registry agents.
 * @param {string} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {string} selectedDate The selected date in the date field input.
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 * @param setSelectedDate Method to update selected date.
 * @param triggerRefresh Method to trigger refresh.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const router = useRouter();

  const isKeycloakEnabled = process.env.KEYCLOAK === 'true';

  const authorised = useProtectedRole().authorised;

  const taskId: string = "task date";

  // Handle change event for the date input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSelectedDate(event.target.value);
  };

  const openAddModal: React.MouseEventHandler<HTMLButtonElement> = () => {
    router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`);
  };

  const triggerRefresh: React.MouseEventHandler<HTMLDivElement> = () => {
    props.triggerRefresh();
  };

  return (
    <div className={styles.menu}>
      <div className={styles["ribbon-button-container"]}>
        <RedirectButton
          icon="pending"
          url={`${Routes.REGISTRY_PENDING}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_PENDING}
          title="Pending"
        />
        <RedirectButton
          icon="schedule"
          url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
          title="Active"
        />
        <RedirectButton
          icon="archive"
          url={`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ARCHIVE}
          title="Archive"
        />
        <RedirectButton
          icon="assessment"
          url={`${Routes.REGISTRY_REPORT}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_REPORT}
          title="Summary"
        />
      </div>
      <div className={styles["ribbon-button-container"]}>
        {(authorised || !isKeycloakEnabled) && props.lifecycleStage == Routes.REGISTRY_PENDING &&
          <ActionButton
            icon={"add"}
            title={"add " + props.entityType}
            onClick={openAddModal}
          />
        }
        {(props.lifecycleStage == Routes.REGISTRY_ACTIVE || props.lifecycleStage == Routes.REGISTRY_TASK_DATE) &&
          <RedirectButton
            icon={"task"}
            url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
            title={"overview"}
          />}
        {(props.lifecycleStage == Routes.REGISTRY_ACTIVE || props.lifecycleStage == Routes.REGISTRY_TASK_DATE) &&
          <RedirectButton
            icon={"event"}
            url={`${Routes.REGISTRY_TASK_DATE}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
            title={"view tasks"}
          />}
        {(props.lifecycleStage == Routes.REGISTRY_REPORT && props.path != props.entityType) &&
          <RedirectButton
            icon={"first_page"}
            url={`${Routes.REGISTRY_REPORT}/${props.entityType}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
            title={`back to ${props.entityType}s`}
          />}
        <DownloadButton
          instances = {props.instances}
        />
        {(authorised || !isKeycloakEnabled) && props.lifecycleStage == Routes.REGISTRY_TASK_DATE && <>
          <div style={{ margin: "auto 0" }}>
            <label className={fieldStyles["form-input-label"]} htmlFor={taskId}>
              Date:
            </label>
            <input
              id={taskId}
              className={fieldStyles["dtpicker"]}
              style={{ width: "5.5rem" }}
              type={"date"}
              defaultValue={props.selectedDate}
              aria-label={taskId}
              onChange={handleDateChange}
            />
          </div>
          <MaterialIconButton
            iconName={"cached"}
            iconStyles={[styles["icon"]]}
            onClick={triggerRefresh}
          />
        </>
        }
      </div>
    </div>
  );
}
