import { useRouter } from "next/navigation";

import React, { useState } from "react";
import { FieldValues } from "react-hook-form";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import {
  LifecycleStage,
  RegistryTaskOption,
  RegistryTaskType,
} from "types/form";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import Button from "ui/interaction/button";
import { Status } from "ui/text/status/status";
import { getId, parseWordsForLabels } from "utils/client-utils";

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
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);

  const handleClickView = (): void => {
    if (props.lifecycleStage == "active" || props.lifecycleStage == "archive") {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY_REPORT}/${recordId}`);
    } else if (
      props.lifecycleStage == "tasks" ||
      props.lifecycleStage == "report"
    ) {
      props.setTask(genTaskOption(recordId, props.row, "default", dict));
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  const showsExpandedTask: boolean =
    (props.lifecycleStage === "report" || props.lifecycleStage === "tasks") &&
    !(
      props.row?.status.toLowerCase() === dict.title.incomplete || props.row?.status.toLowerCase() === dict.title.cancelled
    );

  return (
    <div className="flex items-center justify-center">
      {!showsExpandedTask && (
        <Button
          variant="ghost"
          leftIcon="open_in_new"
          size="icon"
          iconSize="medium"
          className="text-primary"
          tooltipText={parseWordsForLabels(dict.action.view)}
          tooltipPosition="right"
          onClick={handleClickView}
        />
      )}
      {showsExpandedTask && (
        <PopoverActionButton
          placement="bottom-start"
          leftIcon="more_vert"
          variant="ghost"
          tooltipText={dict.title.actions}
          size="icon"
          className="ml-2"
          isOpen={isActionMenuOpen}
          setIsOpen={setIsActionMenuOpen}
        >
          <div className="flex flex-col space-y-8 lg:space-y-4 ">
            <Button
              variant="ghost"
              leftIcon="open_in_new"
              size="md"
              iconSize="medium"
              className="w-full justify-start"
              label={parseWordsForLabels(dict.action.view)}
              onClick={() => {
                setIsActionMenuOpen(false);
                props.setTask(genTaskOption(recordId, props.row, "default", dict));
              }}
            />

            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.completeTask) &&
              (props.row?.status.toLowerCase() === dict.title.ongoing || props.row?.status.toLowerCase() === dict.title.completed) && (
                <Button
                  variant="ghost"
                  leftIcon="done_outline"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  label={dict.action.complete}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    props.setTask(
                      genTaskOption(recordId, props.row, "complete", dict)
                    );
                  }}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.operation) &&
              props.row?.status.toLowerCase() !== dict.title.incomplete &&
              props.row?.status.toLowerCase() !== dict.title.cancelled && (
                <Button
                  variant="ghost"
                  leftIcon="assignment"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  label={dict.action.dispatch}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    props.setTask(
                      genTaskOption(recordId, props.row, "dispatch", dict)
                    );
                  }}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.operation) &&
              (props.row?.status.toLowerCase() === dict.title.outstanding || props.row?.status.toLowerCase() === dict.title.ongoing) && (
                <Button
                  variant="ghost"
                  leftIcon="cancel"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  label={dict.action.cancel}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    props.setTask(genTaskOption(recordId, props.row, "cancel", dict));
                  }}
                />
              )}
            {(!keycloakEnabled ||
              !permissionScheme ||
              permissionScheme.hasPermissions.reportTask) &&
              (props.row?.status.toLowerCase() === dict.title.outstanding || props.row?.status.toLowerCase() === dict.title.ongoing) && (
                <Button
                  variant="ghost"
                  leftIcon="report"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  label={dict.action.report}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    props.setTask(genTaskOption(recordId, props.row, "report", dict));
                  }}
                />
              )}
          </div>
        </PopoverActionButton>
      )}
    </div>
  );
}

// Generates a task option based on the input parameters
function genTaskOption(
  recordId: string,
  row: FieldValues,
  taskType: RegistryTaskType,
  dict: Dictionary,
): RegistryTaskOption {
  let status: string;
  if (
    row.order === "0" ||
    row.status.toLowerCase() === dict.title.outstanding
  ) {
    status = Status.PENDING_DISPATCH;
  } else if (
    row.order === "1" ||
    row.status.toLowerCase() === dict.title.ongoing
  ) {
    status = Status.PENDING_EXECUTION;
  } else if (
    row.order === "2" ||
    row.status.toLowerCase() === dict.title.completed
  ) {
    status = Status.COMPLETED;
  } else if (
    row.order === "3" ||
    row.status.toLowerCase() === dict.title.cancelled
  ) {
    status = Status.CANCELLED;
  } else if (
    row.order === "4" ||
    row.status.toLowerCase() === dict.title.incomplete
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
