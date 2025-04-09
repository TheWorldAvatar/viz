"use client";

import fieldStyles from "ui/interaction/form/field/field.module.css";
import styles from "./table.ribbon.module.css";

import { useProtectedRole } from "hooks/useProtectedRole";
import React from "react";

import { Routes } from "io/config/routes";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues } from "types/form";
import ClickActionButton from "ui/interaction/action/click/click-button";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import { useDictionary } from "utils/dictionary/DictionaryContext";

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

  const dict: Dictionary = useDictionary();
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
      {props.lifecycleStage !== Routes.REGISTRY_GENERAL && (
        <div className={styles["registry-nav-ribbon"]}>
          <RedirectButton
            label={dict.nav.title.pending}
            icon="pending"
            url={`${Routes.REGISTRY_PENDING}/${props.entityType}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_PENDING}
            isHoverableDisabled={true}
            isTransparent={true}
            className={styles["registry-nav-button"]}
            styling={{
              active: styles["active-state"],
            }}
          />
          <RedirectButton
            label={dict.nav.title.active}
            icon="schedule"
            url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE || props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
            isHoverableDisabled={true}
            isTransparent={true}
            className={styles["registry-nav-button"]}
            styling={{
              active: styles["active-state"],
            }}
          />
          <RedirectButton
            label={dict.nav.title.archive}
            icon="archive"
            url={`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`}
            isActive={props.lifecycleStage == Routes.REGISTRY_ARCHIVE}
            isHoverableDisabled={true}
            isTransparent={true}
            className={styles["registry-nav-button"]}
            styling={{
              active: styles["active-state"],
            }}
          />
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles["action-ribbon-container"]}>
        <ClickActionButton
          icon={"cached"}
          onClick={triggerRefresh}
          isTransparent={true}
        />
        <div className={styles["action-ribbon"]}>
          {(authorised || !isKeycloakEnabled) &&
            props.lifecycleStage == Routes.REGISTRY_TASK_DATE && (
              <div style={{ margin: "auto 0" }}>
                <label
                  className={fieldStyles["form-input-label"]}
                  htmlFor={taskId}
                >
                  {dict.action.date}:
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

          {(authorised || !isKeycloakEnabled) &&
            (props.lifecycleStage == Routes.REGISTRY_PENDING || props.lifecycleStage == Routes.REGISTRY_GENERAL) && (
              <RedirectButton
                icon="add"
                label={`${dict.action.add} ${props.entityType.replace("_", " ")}`}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
                isActive={false}
              />
            )}
          {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
            props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
              <RedirectButton
                icon="task"
                label={dict.action.overview}
                url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
                isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
              />
            )}
          {(props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
            props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
              <RedirectButton
                icon="event"
                label={dict.action.viewTasks}
                url={Routes.REGISTRY_TASK_DATE}
                isActive={props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
              />
            )}
          {props.lifecycleStage == Routes.REGISTRY_REPORT && (<>
            <ReturnButton
              icon="first_page"
              label={`${dict.action.backTo} ${props.entityType.replace("_", " ")}s`}
            />
            <RedirectButton
              icon="print"
              label={dict.action.generateReport}
              url={`${Routes.REGISTRY_EDIT}/pricing/${props.path}`}
              isActive={false}
            />
          </>)}
          {<DownloadButton instances={props.instances} />}
        </div>
      </div>
    </div>
  );
}
