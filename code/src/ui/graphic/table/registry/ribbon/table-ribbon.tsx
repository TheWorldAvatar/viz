"use client";

import styles from "./table.ribbon.module.css";
import fieldStyles from "ui/interaction/form/field/field.module.css";

import React from "react";
import { useProtectedRole } from "hooks/useProtectedRole";
import { useRouter } from "next/navigation";

import { Routes } from "io/config/routes";
import { RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import ClickActionButton from "ui/interaction/action/click/click-button";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import MaterialIconButton from "ui/graphic/icon/icon-button";

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

  const isKeycloakEnabled = process.env.KEYCLOAK === "true";

  const authorised = useProtectedRole().authorised;

  const taskId: string = "task date";

  // Handle change event for the date input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSelectedDate(event.target.value);
  };

  const triggerRefresh: React.MouseEventHandler<HTMLDivElement> = () => {
    props.triggerRefresh();
  };

  return (
    <div className={styles.menu}>
      {/* Top 3 buttons */}
      <div className={styles["status-buttons"]}>
        <RedirectButton
          icon="pending"
          url={`${Routes.REGISTRY_PENDING}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_PENDING}
          className={styles["status-button-container"]}
          activeStyle={styles["active-button"]}
          title="Pending"
        />
        <RedirectButton
          icon="schedule"
          url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
          className={styles["status-button-container"]}
          activeStyle={styles["active-button"]}
          title="Active"
        />
        <RedirectButton
          icon="archive"
          url={`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ARCHIVE}
          className={styles["status-button-container"]}
          activeStyle={styles["active-button"]}
          title="Archive"
        />
      </div>
      {/* Divider Line */}
      <div className={styles.divider} />

      {/* Action Buttons Row */}
      <div className={styles["action-buttons"]}>
        {(authorised || !isKeycloakEnabled) &&
          props.lifecycleStage == Routes.REGISTRY_PENDING && (
            <ClickActionButton
              icon={"add"}
              title={"add " + props.entityType}
              onClick={() => {
                router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`);
              }}
            />
          )}
        {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
          props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
          <RedirectButton
            icon={"task"}
            url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
            title={"overview"}
          />
        )}
        {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
          props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
          <RedirectButton
            icon={"event"}
            url={`${Routes.REGISTRY_TASK_DATE}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
            title={"view tasks"}
          />
        )}
        {props.lifecycleStage == Routes.REGISTRY_REPORT && (
          <ClickActionButton
            icon={"first_page"}
            title={`back to ${props.entityType}s`}
            onClick={() => {
              router.back();
            }}
          />
        )}
        <DownloadButton instances={props.instances} />
        {(authorised || !isKeycloakEnabled) &&
          props.lifecycleStage == Routes.REGISTRY_TASK_DATE && (
            <>
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
              <MaterialIconButton
                iconName={"cached"}
                iconStyles={[styles["icon"]]}
                onClick={triggerRefresh}
              />
            </>
          )}
      </div>
    </div>
  );
}
