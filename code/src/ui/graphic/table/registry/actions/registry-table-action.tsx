import iconStyles from "ui/graphic/icon/icon-button.module.css";
import styles from "../registry.table.module.css";

import { useRouter } from "next/navigation";

import React from "react";
import { FieldValues } from "react-hook-form";

import { Routes } from "io/config/routes";
import { LifecycleStage, RegistryTaskOption } from "types/form";
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
      {(props.lifecycleStage === "report" ||
        props.lifecycleStage === "tasks") &&
        <PopoverActionButton
          placement="bottom-start"
          leftIcon="more_vert"
          variant="ghost"
          tooltipText="Actions"
          size="icon"
          className="ml-2"
        >
          <div className=" space-y-2 ">
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.completeTask) && (
                <Button
                  leftIcon="done_outline"
                  variant="outline"
                  size="sm"
                  iconSize="small"
                  label={dict.action.complete}
                  tooltipText={dict.action.complete}
                  tooltipPosition="top"
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
              permissionScheme.hasPermissions.operation) &&
              props.row.status !== Status.COMPLETED && (
                <Button
                  leftIcon="assignment"
                  variant="outline"
                  size="sm"
                  iconSize="small"
                  label={dict.action.dispatch}
                  tooltipText={dict.action.dispatch}
                  tooltipPosition="top"
                  onClick={() => {
                    props.setTask({
                      id: recordId,
                      status: Status.PENDING_DISPATCH,
                      contract: props.row.id,
                      date: props.row.date,
                      type: "dispatch",
                    });
                  }}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.reportTask) &&
              props.row.status !== Status.COMPLETED && (
                <Button
                  leftIcon="cancel"
                  size="sm"
                  iconSize="small"
                  label={dict.action.cancel}
                  variant="outline"
                  tooltipText={dict.action.cancel}
                  tooltipPosition="top"
                  onClick={() => {
                    props.setTask({
                      id: recordId,
                      status: Status.CANCELLED,
                      contract: props.row.id,
                      date: props.row.date,
                      type: "cancel",
                    });
                  }}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.operation) &&
              props.row.status !== Status.COMPLETED && (
                <Button
                  leftIcon="report"
                  size="sm"
                  iconSize="small"
                  label={dict.action.report}
                  variant="outline"
                  tooltipText={dict.action.report}
                  tooltipPosition="bottom"
                  onClick={() => {
                    props.setTask({
                      id: recordId,
                      status: Status.INCOMPLETE,
                      contract: props.row.id,
                      date: props.row.date,
                      type: "report",
                    });
                  }}
                />
              )}
          </div>
        </PopoverActionButton>
      }
    </div>
  );
}
