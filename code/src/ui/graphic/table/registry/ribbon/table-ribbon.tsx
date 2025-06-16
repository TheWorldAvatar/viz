"use client";

import React from "react";

import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import { useDictionary } from "hooks/useDictionary";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import ColumnSearchComponent from "../actions/column-search";
import Button from "ui/interaction/button";

interface TableRibbonProps {
  path: string;
  entityType: string;
  registryAgentApi: string;
  lifecycleStage: string;
  selectedDate: string;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  setCurrentInstances: React.Dispatch<
    React.SetStateAction<RegistryFieldValues[]>
  >;
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
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 * @param triggerRefresh Method to trigger refresh.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
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
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      {props.lifecycleStage !== Routes.REGISTRY_GENERAL && (
        <div className="flex items-center justify-center sm:gap-4 bg-gray-200 max-w-fit  p-1.5 text-center rounded-lg">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.pendingRegistry) && (
            <RedirectButton
              label={dict.nav.title.pending}
              icon="pending"
              url={`${Routes.REGISTRY_PENDING}/${props.entityType}`}
              isActive={props.lifecycleStage == Routes.REGISTRY_PENDING}
              isHoverableDisabled={true}
              isTransparent={true}
              className={
                props.lifecycleStage == Routes.REGISTRY_PENDING
                  ? "!bg-background"
                  : ""
              }
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.activeArchiveRegistry) && (
            <RedirectButton
              label={dict.nav.title.active}
              icon="schedule"
              url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
              isActive={
                props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
                props.lifecycleStage == Routes.REGISTRY_TASK_DATE
              }
              isHoverableDisabled={true}
              isTransparent={true}
              className={
                props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
                props.lifecycleStage == Routes.REGISTRY_TASK_DATE
                  ? "!bg-background"
                  : ""
              }
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.activeArchiveRegistry) && (
            <RedirectButton
              label={dict.nav.title.archive}
              icon="archive"
              url={`${Routes.REGISTRY_ARCHIVE}/${props.entityType}`}
              isActive={props.lifecycleStage == Routes.REGISTRY_ARCHIVE}
              isHoverableDisabled={true}
              isTransparent={true}
              className={
                props.lifecycleStage == Routes.REGISTRY_ARCHIVE
                  ? "!bg-background"
                  : ""
              }
            />
          )}
        </div>
      )}

      <div className="w-full border-[0.5px] border-border" />

      <div className="flex justify-between md:gap-2 lg:gap-0 flex-wrap ">
        <div className="flex items-center !-ml-2 ">
          <Button size="icon" leftIcon="cached" onClick={triggerRefresh} />
          {props.instances.length > 0 && (
            <ColumnSearchComponent
              instances={props.instances}
              setCurrentInstances={props.setCurrentInstances}
            />
          )}
        </div>
        {/* <Button
          variant="secondary"
          size="lg"
          disabled={true}
          loading
          leftIcon={
            <Icon className="material-symbols-outlined ">{"download"}</Icon>
          }
        >
          Hello
        </Button> */}
        <div className="flex  flex-wrap gap-2 mt-2 md:mt-0  ">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            (props.lifecycleStage == Routes.REGISTRY_PENDING ||
              props.lifecycleStage == Routes.REGISTRY_GENERAL) && (
              <RedirectButton
                icon="add"
                label={`${dict.action.add} ${props.entityType.replace(
                  "_",
                  " "
                )}`}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
                isActive={false}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.viewTask) &&
            (props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
              props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
              <RedirectButton
                icon="task"
                label={dict.action.overview}
                url={`${Routes.REGISTRY_ACTIVE}/${props.entityType}`}
                isActive={props.lifecycleStage == Routes.REGISTRY_ACTIVE}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.viewTask) &&
            (props.lifecycleStage == Routes.REGISTRY_ACTIVE ||
              props.lifecycleStage == Routes.REGISTRY_TASK_DATE) && (
              <RedirectButton
                icon="event"
                label={dict.action.viewTasks}
                url={Routes.REGISTRY_TASK_DATE}
                isActive={props.lifecycleStage == Routes.REGISTRY_TASK_DATE}
              />
            )}
          {props.lifecycleStage == Routes.REGISTRY_REPORT && (
            <ReturnButton
              icon="first_page"
              label={`${dict.action.backTo} ${props.entityType.replace(
                "_",
                " "
              )}s`}
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.invoice) &&
            props.lifecycleStage == Routes.REGISTRY_REPORT && (
              <RedirectButton
                icon="print"
                label={dict.action.generateReport}
                url={`${Routes.REGISTRY_EDIT}/pricing/${props.path}`}
                isActive={false}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.export) && (
            <DownloadButton instances={props.instances} />
          )}
        </div>
      </div>
      <div className="flex ml-2 mt-2">
        {props.lifecycleStage == Routes.REGISTRY_TASK_DATE && (
          <div className="flex items-center gap-4">
            <label
              className="my-1 text-sm md:text-lg text-left whitespace-nowrap"
              htmlFor={taskId}
            >
              {dict.action.date}:
            </label>
            <input
              id={taskId}
              className="h-8 w-full max-w-none p-5 rounded-lg border-1 border-border bg-muted text-foreground shadow-md"
              type={"date"}
              defaultValue={props.selectedDate}
              aria-label={taskId}
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
