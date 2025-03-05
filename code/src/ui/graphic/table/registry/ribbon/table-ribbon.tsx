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
            text: styles["registry-nav-button-text"],
            hover: styles["registry-nav-button-hover"],
          }}
        />
        <RedirectButton
          label="Active"
          icon="schedule"
          url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
          isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
          isHoverableDisabled={true}
          className={styles["registry-nav-button"]}
          styling={{
            active: styles["active-state"],
            text: styles["registry-nav-button-text"],
            hover: styles["registry-nav-button-hover"],
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
            text: styles["registry-nav-button-text"],
            hover: styles["registry-nav-button-hover"],
          }}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles["action-ribbon"]}>
        {(authorised || !isKeycloakEnabled) &&
          props.lifecycleStage == Routes.REGISTRY_PENDING && (
            <ClickActionButton
              icon={"add"}
              label={"add " + props.entityType}
              onClick={() => {
                router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`);
              }}
            />
          )}
        {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
          props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
            <ClickActionButton
              icon={"task"}
              label={"overview"}
              onClick={() => {
                router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`);
              }}
            />
          )}
        {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
          props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
            <ClickActionButton
              icon={"event"}
              label={"view tasks"}
              onClick={() => {
                router.push(`${Routes.REGISTRY_ADD}/${props.entityType}`);
              }}
            />
          )}
        {props.lifecycleStage == Routes.REGISTRY_REPORT && (
          <ClickActionButton
            icon={"first_page"}
            label={`back to ${props.entityType}s`}
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
