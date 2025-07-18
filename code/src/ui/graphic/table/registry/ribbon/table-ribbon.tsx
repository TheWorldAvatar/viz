"use client";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import React from "react";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import Button from "ui/interaction/button";
import DateRangeInput from "ui/interaction/input/date-range";
import ColumnSearchComponent from "../actions/column-search";
import { DateRange } from "react-day-picker";

interface TableRibbonProps {
  path: string;
  entityType: string;
  selectedDate: DateRange;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<DateRange>>;
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
 * @param {DateRange} selectedDate The selected date range object with 'from' and 'to' date strings.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 * @param setSelectedDate A dispatch method to update selected date range.
 * @param setCurrentInstances A dispatch method to set the current instances after parsing the initial instances.
 * @param triggerRefresh Method to trigger refresh.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      {props.lifecycleStage !== "general" &&
        props.lifecycleStage !== "pending" &&
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.allTasks) && (
          <div className="flex  items-centre justify-between  sm:gap-4 bg-gray-200 dark:bg-zinc-800   max-w-fit p-1.5 text-center rounded-lg flex-wrap">
            <RedirectButton
              label={dict.nav.title.outstanding}
              leftIcon="pending"
              url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
              variant={
                props.lifecycleStage == "outstanding" ? "active" : "ghost"
              }
            />
            <RedirectButton
              label={dict.nav.title.scheduled}
              leftIcon="schedule"
              url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
              variant={props.lifecycleStage == "scheduled" ? "active" : "ghost"}
            />
            <RedirectButton
              label={dict.nav.title.closed}
              leftIcon="archive"
              url={`${Routes.REGISTRY_TASK_CLOSED}`}
              variant={props.lifecycleStage == "closed" ? "active" : "ghost"}
            />
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
      <div className="flex ml-2">
        {(props.lifecycleStage == "scheduled" ||
          props.lifecycleStage == "closed") && (
          <DateRangeInput
            selectedDate={props.selectedDate}
            setSelectedDate={props.setSelectedDate}
            lifecycleStage={props.lifecycleStage}
          />
        )}
      </div>
    </div>
  );
}
