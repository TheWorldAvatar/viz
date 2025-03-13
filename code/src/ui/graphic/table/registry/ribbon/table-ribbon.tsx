"use client";

import fieldStyles from "ui/interaction/form/field/field.module.css";
import styles from "./table.ribbon.module.css";

import { useProtectedRole } from "hooks/useProtectedRole";
import React from "react";

import { Routes } from "io/config/routes";
import { RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import ClickActionButton from "ui/interaction/action/click/click-button";

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
  const isKeycloakEnabled = process.env.KEYCLOAK === "true";

  const authorised = useProtectedRole().authorised;

  const taskId: string = "task date";

  // Handle change event for the date input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSelectedDate(event.target.value);
  };

  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };

  return (

    <div className={styles.menu}>
      { props.lifecycleStage !== Routes.REGISTRY_GENERAL && (
      <div className={styles["registry-nav-ribbon"]}>
        <RedirectButton
          label="Pending"
          icon="pending"
          url={`${Routes.REGISTRY_PENDING}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_PENDING}
          isHoverableDisabled={true}
          className={styles["registry-nav-button"]}
          styling={{
            active: styles["active-state"],
            text: styles["transparent-button-text"],
          }}
        />
        <RedirectButton
          label="Active"
          icon="schedule"
          url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE || props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
          isHoverableDisabled={true}
          className={styles["registry-nav-button"]}
          styling={{
            active: styles["active-state"],
            text: styles["transparent-button-text"],
          }}
        />
        <RedirectButton
          label="Archive"
          icon="archive"
          url={`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ARCHIVE}
          isHoverableDisabled={true}
          className={styles["registry-nav-button"]}
          styling={{
            active: styles["active-state"],
            text: styles["transparent-button-text"],
          }}
        />
      </div>
      )}
      
      <div className={styles.divider} />

      { props.lifecycleStage !== Routes.REGISTRY_GENERAL && (
      <div className={styles["action-ribbon-container"]}>
        <ClickActionButton
          icon={"cached"}
          onClick={triggerRefresh}
          className={styles["transparent-button"]}
          styling={{
            text: styles["transparent-button-text"],
          }}
        />
        <div className={styles["action-ribbon"]}>
          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage == Routes.REGISTRY_TASK_DATE && (
              <div style={{ margin: "auto 0" }}>
                <label
                  className={fieldStyles["form-input-label"]}
                  htmlFor={taskId}
                >
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
            )}
          {//RETAIN THE ADD AGREEMENT BUTTON in the conditions
          }
          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage == Routes.REGISTRY_PENDING && (
              <RedirectButton
                icon="add"
                label={"add " + props.entityType}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
                isActive={false}
              />
            )}
          {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
            props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
              <RedirectButton
                icon="task"
                label={"overview"}
                url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
                isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
              />
            )}
          {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
            props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
              <RedirectButton
                icon="event"
                label={"view tasks"}
                url={Routes.REGISTRY_TASK_DATE}
                isActive={props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
              />
            )}
          {props.lifecycleStage == Routes.REGISTRY_REPORT && (
            <ReturnButton
              icon="first_page"
              label={`back to ${props.entityType}s`}
            />
          )}
          <DownloadButton instances={props.instances} />
        </div>
      </div>
      )}
    </div>
  );
}
