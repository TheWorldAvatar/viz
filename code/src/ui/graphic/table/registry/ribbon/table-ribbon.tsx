"use client";

import React from "react";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import Button from "ui/interaction/button";
import ColumnSearchComponent from "../actions/column-search";

interface TableRibbonProps {
  path: string;
  entityType: string;
  selectedDate: string;
  lifecycleStage: LifecycleStage;
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
 * @param {string} selectedDate The selected date in the date field input.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
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
      {props.lifecycleStage !== "general" &&
        props.lifecycleStage !== "pending" && (
          <div className="flex  items-centre justify-between  sm:gap-4 bg-gray-200 dark:bg-zinc-800   max-w-fit p-1.5 text-center rounded-lg flex-wrap">
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.pendingRegistry) && (
              <RedirectButton
                label={dict.nav.title.outstanding}
                leftIcon="pending"
                url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                variant={
                  props.lifecycleStage == "outstanding" ? "active" : "ghost"
                }
              />
            )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.activeArchiveRegistry) && (
              <RedirectButton
                label={dict.nav.title.scheduled}
                leftIcon="schedule"
                url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
                variant={
                  props.lifecycleStage == "scheduled" ? "active" : "ghost"
                }
              />
            )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.activeArchiveRegistry) && (
              <RedirectButton
                label={dict.nav.title.closed}
                leftIcon="archive"
                url={`${Routes.REGISTRY_TASK_CLOSED}`}
                variant={props.lifecycleStage == "closed" ? "active" : "ghost"}
              />
            )}
          </div>
        )}
      <div className="w-full border-[0.5px] border-border" />
      <div className="flex justify-between md:gap-2 lg:gap-0 flex-wrap ">
        <div className="flex items-center !-ml-2 ">
          <Button
            className="ml-2"
            size="icon"
            leftIcon="cached"
            variant="outline"
            onClick={triggerRefresh}
          />
          {props.instances.length > 1 && (
            <ColumnSearchComponent
              instances={props.instances}
              setCurrentInstances={props.setCurrentInstances}
            />
          )}
        </div>
        <div className="flex  flex-wrap gap-2 mt-2 md:mt-0  ">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            (props.lifecycleStage == "pending" ||
              props.lifecycleStage == "general") && (
              <RedirectButton
                leftIcon="add"
                label={dict.action.addItem.replace(
                  "{replace}",
                  props.entityType.replace("_", " ")
                )}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
              />
            )}
          {props.lifecycleStage == "report" && (
            <ReturnButton
              leftIcon="first_page"
              label={dict.action.backTo.replace(
                "{replace}",
                props.entityType.replace("_", " ")
              )}
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.invoice) &&
            props.lifecycleStage == "report" && (
              <RedirectButton
                leftIcon="print"
                label={dict.action.generateReport}
                url={`${Routes.REGISTRY_EDIT}/pricing/${props.path}`}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.export) && (
            <DownloadButton instances={props.instances} />
          )}
        </div>
      </div>
      <div className="flex ml-2 ">
        {(props.lifecycleStage == "scheduled" ||
          props.lifecycleStage == "closed") && (
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
