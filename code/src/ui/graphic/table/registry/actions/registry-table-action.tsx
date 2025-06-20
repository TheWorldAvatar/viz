import iconStyles from "ui/graphic/icon/icon-button.module.css";
import styles from "../registry.table.module.css";

import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { Routes } from "io/config/routes";
import { LifecycleStage, RegistryTaskOption } from "types/form";
import MaterialIconButton from "ui/graphic/icon/icon-button";
import { Status } from "ui/text/status/status";
import { getId } from "utils/client-utils";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import Button from "ui/interaction/button";
import { PermissionScheme } from "types/auth";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { genBooleanClickHandler } from "utils/event-handler";
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
      let status: string;
      if (
        props.row.order === "0" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/OrderReceivedEvent"
      ) {
        status = Status.PENDING_DISPATCH;
      } else if (
        props.row.order === "1" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/ServiceDispatchEvent"
      ) {
        status = Status.PENDING_EXECUTION;
      } else if (
        props.row.order === "2" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/ServiceDeliveryEvent"
      ) {
        status = Status.COMPLETED;
      } else if (
        props.row.order === "3" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/TerminatedServiceEvent"
      ) {
        status = Status.CANCELLED;
      } else if (
        props.row.order === "4" ||
        props.row.event ===
          "https://www.theworldavatar.com/kg/ontoservice/IncidentReportEvent"
      ) {
        status = Status.INCOMPLETE;
      } else {
        status = "";
      }
      props.setTask({
        id: recordId,
        status: status,
        contract: props.row.id,
        date: props.row.date,
        type: "default",
      });
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <MaterialIconButton
        iconName="open_in_new"
        iconStyles={[iconStyles["medium-icon"], styles["expand-icon"]]}
        onClick={handleClickView}
      />
      <PopoverActionButton
        placement="bottom-start"
        leftIcon="more_vert"
        variant="ghost"
        tooltipText="Actions"
        size="icon"
        className="ml-2"
      >
        <div className="p-2 ">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeTask) && (
            <Button
              leftIcon="done_outline"
              label="Complete"
              tooltipText={dict.action.complete}
              onClick={() => {
                props.setTask({
                  id: recordId,
                  status: Status.PENDING_EXECUTION,
                  contract: props.row.id,
                  date: props.row.date,
                  type: "complete",
                });
              }}
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) && (
            <Button
              leftIcon="assignment"
              label="Assign"
              tooltipText={dict.action.dispatch}
              onClick={() => {
                props.setTask({
                  id: recordId,
                  status: Status.COMPLETED,
                  contract: props.row.id,
                  date: props.row.date,
                  type: "dispatch",
                });
              }}
            />
          )}
        </div>
      </PopoverActionButton>
    </div>
  );
}
