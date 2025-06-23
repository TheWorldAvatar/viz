import iconStyles from "ui/graphic/icon/icon-button.module.css";
import styles from "../registry.table.module.css";

import { useRouter } from "next/navigation";

import React from "react";
import { FieldValues } from "react-hook-form";

import { Routes } from "io/config/routes";
import { LifecycleStage, RegistryTaskOption, RegistryTaskType } from "types/form";
import MaterialIconButton from "ui/graphic/icon/icon-button";
import { Status } from "ui/text/status/status";
import { getId } from "utils/client-utils";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import Button from "ui/interaction/button";
import { PermissionScheme } from "types/auth";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";

interface RegistryRowActionsProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  row: FieldValues;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

/**
 * Renders the possible row actions for each row in the registry.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {FieldValues} row Row values.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function RegistryRowActions(
  props: Readonly<RegistryRowActionsProps>
) {
  const router = useRouter();
  const recordId: string = props.row.event_id
    ? props.row.event_id
    : props.row.id
      ? getId(props.row.id)
      : props.row.iri;

  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();

  const handleClickView = (): void => {
    if (props.lifecycleStage == "active" || props.lifecycleStage == "archive") {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY_REPORT}/${recordId}`);
    } else if (
      props.lifecycleStage == "tasks" ||
      props.lifecycleStage == "report"
    ) {
      props.setTask(genTaskOption(recordId, props.row, "default"));
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  return (
    <div className="flex items-center">
      <MaterialIconButton
        iconName="open_in_new"
        iconStyles={[iconStyles["medium-icon"], styles["expand-icon"]]}
        onClick={handleClickView}
      />
      {(props.lifecycleStage === "report" ||
        props.lifecycleStage === "tasks") &&
        !(props.row?.event === "https://www.theworldavatar.com/kg/ontoservice/IncidentReportEvent" ||
          props.row?.event === "https://www.theworldavatar.com/kg/ontoservice/TerminatedServiceEvent") && <PopoverActionButton
            placement="bottom-start"
            leftIcon="more_vert"
            variant="ghost"
            tooltipText="Actions"
            size="icon"
            className="ml-2"
          >
          <div className="flex flex-col items-center justify-center space-y-2 ">
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.completeTask) &&
              (props.row.event === "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent" ||
                props.row.event === "https://www.theworldavatar.com/kg/ontoservice/ServiceDeliveryEvent") && (
                <Button
                  variant="ghost"
                  leftIcon="done_outline"
                  size="icon"
                  iconSize="small"
                  tooltipText={dict.action.complete}
                  tooltipPosition="right"
                  onClick={() => props.setTask(genTaskOption(recordId, props.row, "complete"))}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.operation) &&
              (props.row.event !== "https://www.theworldavatar.com/kg/ontoservice/IncidentReportEvent" &&
                props.row.event !== "https://www.theworldavatar.com/kg/ontoservice/TerminatedServiceEvent") && (
                <Button
                  variant="ghost"
                  leftIcon="assignment"
                  size="icon"
                  iconSize="small"
                  tooltipText={dict.action.dispatch}
                  tooltipPosition="right"
                  onClick={() => props.setTask(genTaskOption(recordId, props.row, "dispatch"))}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.reportTask) &&
              (props.row.event === "https://www.theworldavatar.com/kg/ontoservice/OrderReceivedEvent" ||
                props.row.event === "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent") && (
                <Button
                  variant="ghost"
                  leftIcon="cancel"
                  size="icon"
                  iconSize="small"
                  tooltipText={dict.action.cancel}
                  tooltipPosition="right"
                  onClick={() => props.setTask(genTaskOption(recordId, props.row, "cancel"))}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.operation) &&
              (props.row.event === "https://www.theworldavatar.com/kg/ontoservice/OrderReceivedEvent" ||
                props.row.event === "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent") && (
                <Button
                  variant="ghost"
                  leftIcon="report"
                  size="icon"
                  iconSize="small"
                  tooltipText={dict.action.report}
                  tooltipPosition="right"
                  onClick={() => props.setTask(genTaskOption(recordId, props.row, "report"))}
                />
              )}
          </div>
        </PopoverActionButton>
      }
    </div>
  );
}

// Generates a task option based on the input parameters
function genTaskOption(recordId: string, row: FieldValues, taskType: RegistryTaskType): RegistryTaskOption {
  let status: string;
  if (
    row.order === "0" ||
    row.event ===
    "https://www.theworldavatar.com/kg/ontoservice/OrderReceivedEvent"
  ) {
    status = Status.PENDING_DISPATCH;
  } else if (
    row.order === "1" ||
    row.event ===
    "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent"
  ) {
    status = Status.PENDING_EXECUTION;
  } else if (
    row.order === "2" ||
    row.event ===
    "https://www.theworldavatar.com/kg/ontoservice/ServiceDeliveryEvent"
  ) {
    status = Status.COMPLETED;
  } else if (
    row.order === "3" ||
    row.event ===
    "https://www.theworldavatar.com/kg/ontoservice/TerminatedServiceEvent"
  ) {
    status = Status.CANCELLED;
  } else if (
    row.order === "4" ||
    row.event ===
    "https://www.theworldavatar.com/kg/ontoservice/IncidentReportEvent"
  ) {
    status = Status.INCOMPLETE;
  } else {
    status = "";
  }
  return {
    id: recordId,
    status: status,
    contract: row.id,
    date: row.date,
    type: taskType,
  };
}
