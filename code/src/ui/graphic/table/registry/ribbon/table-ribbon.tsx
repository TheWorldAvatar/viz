"use client";

import fieldStyles from "ui/interaction/form/field/field.module.css";
import styles from "./table.ribbon.module.css";

import React from "react";

import { usePermissionScheme } from 'hooks/auth/usePermissionScheme';
import { useDictionary } from 'hooks/useDictionary';
import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import ClickActionButton from "ui/interaction/action/click/click-button";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import ColumnSearchComponent from "../actions/column-search";

interface TableRibbonProps {
  path: string;
  entityType: string;
  selectedDate: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  setCurrentInstances: React.Dispatch<React.SetStateAction<RegistryFieldValues[]>>;
  triggerRefresh: () => void;
}

/**
 * Renders a ribbon for the view page
 *
 * @param {string} path The current path name after the last /.
 * @param {string} entityType The type of entity.
 * @param {string} selectedDate The selected date in the date field input.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 * @param setSelectedDate Method to update selected date.
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 * @param triggerRefresh Method to trigger refresh.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === 'true';
  const permissionScheme: PermissionScheme = usePermissionScheme();
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
      {props.lifecycleStage !== LifecycleStage.GENERAL && (
        <div className={styles["registry-nav-ribbon"]}>
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.pendingRegistry) && <RedirectButton
            label={dict.nav.title.pending}
            icon="pending"
            url={`${Routes.REGISTRY_PENDING}/${props.entityType}`}
            isActive={props.lifecycleStage == LifecycleStage.PENDING}
            isHoverableDisabled={true}
            isTransparent={true}
            className={styles["registry-nav-button"]}
            styling={{
              active: styles["active-state"],
            }}
          />}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.activeArchiveRegistry) && <RedirectButton
            label={dict.nav.title.active}
            icon="schedule"
            url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
            isActive={props.lifecycleStage == LifecycleStage.ACTIVE || props.lifecycleStage == LifecycleStage.TASKS}
            isHoverableDisabled={true}
            isTransparent={true}
            className={styles["registry-nav-button"]}
            styling={{
              active: styles["active-state"],
            }}
          />}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.activeArchiveRegistry) && <RedirectButton
            label={dict.nav.title.archive}
            icon="archive"
            url={`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`}
            isActive={props.lifecycleStage == LifecycleStage.ARCHIVE}
            isHoverableDisabled={true}
            isTransparent={true}
            className={styles["registry-nav-button"]}
            styling={{
              active: styles["active-state"],
            }}
          />}
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles["action-ribbon-container"]}>
        <div className={styles["action-ribbon"]}>
          <ClickActionButton
            icon={"cached"}
            onClick={triggerRefresh}
            isTransparent={true}
          />
          {props.instances.length > 0 && <ColumnSearchComponent
            instances={props.instances}
            setCurrentInstances={props.setCurrentInstances}
          />}
        </div>
        <div className={styles["action-ribbon"]}>
          {props.lifecycleStage == LifecycleStage.TASKS && (
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
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.sales) &&
            (props.lifecycleStage == LifecycleStage.PENDING || props.lifecycleStage == LifecycleStage.GENERAL) && (
              <RedirectButton
                icon="add"
                label={`${dict.action.add} ${props.entityType.replace("_", " ")}`}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
                isActive={false}
              />
            )}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.viewTask) &&
            (props.lifecycleStage == LifecycleStage.ACTIVE ||
              props.lifecycleStage == LifecycleStage.TASKS) && (
              <RedirectButton
                icon="task"
                label={dict.action.overview}
                url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
                isActive={props.lifecycleStage == LifecycleStage.ACTIVE}
              />
            )}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.viewTask) && (props.lifecycleStage == LifecycleStage.ACTIVE ||
            props.lifecycleStage == LifecycleStage.TASKS) && (
              <RedirectButton
                icon="event"
                label={dict.action.viewTasks}
                url={Routes.REGISTRY_TASK_DATE}
                isActive={props.lifecycleStage == LifecycleStage.TASKS}
              />
            )}
          {props.lifecycleStage == LifecycleStage.REPORT &&
            <ReturnButton
              icon="first_page"
              label={`${dict.action.backTo} ${props.entityType.replace("_", " ")}s`}
            />}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.invoice) && props.lifecycleStage == LifecycleStage.REPORT &&
            <RedirectButton
              icon="print"
              label={dict.action.generateReport}
              url={`${Routes.REGISTRY_EDIT}/pricing/${props.path}`}
              isActive={false}
            />}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.export) &&
            <DownloadButton instances={props.instances} />}
        </div>
      </div>
    </div>
  );
}
