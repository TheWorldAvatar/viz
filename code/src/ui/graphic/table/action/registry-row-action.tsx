import { useRouter } from "next/navigation";

import React from "react";
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
import { compareDates, getId, parseWordsForLabels } from "utils/client-utils";

import { useDictionary } from "hooks/useDictionary";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { JsonObject } from "types/json";
import { toast } from "ui/interaction/action/toast/toast";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import { openDrawer } from "state/drawer-component-slice";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "ui/graphic/loader/spinner";
import {
  selectIsApiLoading,
  setApiLoading,
} from "state/api-loading-slice";

interface RegistryRowActionProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  row: FieldValues;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  triggerRefresh: () => void;
}

/**
 * Renders the possible row actions for each row in the registry.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {FieldValues} row Row values.
 * @param setTask A dispatch method to set the task option when required.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function RegistryRowAction(
  props: Readonly<RegistryRowActionProps>
) {
  const router = useRouter();
  const dispatch = useDispatch();
  const recordId: string = props.row.event_id
    ? props.row.event_id
    : props.row.id
      ? getId(props.row.id)
      : props.row.iri;

  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();
  const [isActionMenuOpen, setIsActionMenuOpen] =
    React.useState<boolean>(false);

  const isLoading: boolean = useSelector(selectIsApiLoading);

  const onApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const reqBody: JsonObject = {
      contract: recordId,
      remarks: "Contract has been approved successfully!",
    };
    const url: string = makeInternalRegistryAPIwithParams(
      "event",
      "service",
      "commence"
    );

    submitPendingActions(url, "POST", JSON.stringify({ ...reqBody }));
  };

  const onResubmissionForApproval: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    const url: string = makeInternalRegistryAPIwithParams(
      "event",
      "draft",
      props.row?.id
    );
    submitPendingActions(url, "PUT", "{}");
  };

  const submitPendingActions = async (
    url: string,
    method: string,
    body: string
  ): Promise<void> => {
    dispatch(setApiLoading(true));
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "same-origin",
      body,
    });
    setIsActionMenuOpen(false);
    const customAgentResponse: AgentResponseBody = await res.json();
    toast(
      customAgentResponse?.data?.message || customAgentResponse?.error?.message,
      customAgentResponse?.error ? "error" : "success"
    );

    props.triggerRefresh();
  };

  const handleClickView = (): void => {
    if (
      props.lifecycleStage == "tasks" ||
      props.lifecycleStage == "report" ||
      props.lifecycleStage == "outstanding" ||
      props.lifecycleStage == "scheduled" ||
      props.lifecycleStage == "closed"
    ) {
      props.setTask(
        genTaskOption(recordId, props.row, "default", dict.title.scheduleType)
      );
      dispatch(openDrawer());
    } else {
      // Move to the view modal page for the specific record
      router.push(`${Routes.REGISTRY}/${props.recordType}/${recordId}`);
    }
  };

  const showsExpandedTask: boolean =
    (props.lifecycleStage === "report" ||
      props.lifecycleStage === "tasks" ||
      props.lifecycleStage === "outstanding" ||
      props.lifecycleStage === "scheduled" ||
      props.lifecycleStage === "closed") &&
    !(
      props.row?.status?.toLowerCase() === "issue" ||
      props.row?.status?.toLowerCase() === "cancelled"
    );
  const isSubmissionOrGeneralPage: boolean =
    props.lifecycleStage == "pending" || props.lifecycleStage == "general";

  return (
    <div aria-label="Actions">
      {!isSubmissionOrGeneralPage && !showsExpandedTask && (
        <Button
          variant="ghost"
          leftIcon="open_in_new"
          size="icon"
          iconSize="medium"
          tooltipText={parseWordsForLabels(dict.action.view)}
          tooltipPosition="right"
          onClick={handleClickView}
        />
      )}
      {(isSubmissionOrGeneralPage || showsExpandedTask) && (
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
          {isLoading && props.lifecycleStage == "pending" && (
            <div className="flex gap-2 justify-center items-center m-auto p-1.5 cursor-auto">
              {dict.message.processing}
              <LoadingSpinner isSmall={true} />
            </div>
          )}
          <div className="flex flex-col space-y-8 lg:space-y-4 ">
            {isSubmissionOrGeneralPage && !isLoading && (
              <>
                <Button
                  variant="ghost"
                  leftIcon="open_in_new"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"
                  disabled={isLoading}
                  label={parseWordsForLabels(dict.action.view)}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    if (isSubmissionOrGeneralPage) {
                      handleClickView();
                    } else {
                      props.setTask(
                        genTaskOption(
                          recordId,
                          props.row,
                          "default",
                          dict.title.scheduleType
                        )
                      );
                      dispatch(openDrawer());
                    }
                  }}
                />
                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.operation) &&
                  props.lifecycleStage === "active" && (
                    <Button
                      variant="ghost"
                      leftIcon="cancel"
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      disabled={isLoading}
                      label={dict.action.cancel}
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        props.setTask(
                          genTaskOption(
                            recordId,
                            props.row,
                            "cancel",
                            dict.title.scheduleType
                          )
                        );
                        dispatch(openDrawer());
                      }}
                    />
                  )}

                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.operation) &&
                  props.lifecycleStage === "pending" && (
                    <Button
                      variant="ghost"
                      leftIcon="done_outline"
                      disabled={isLoading}
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      label={dict.action.approve}
                      onClick={onApproval}
                    />
                  )}

                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.sales) &&
                  props.lifecycleStage === "pending" &&
                  props.row?.status?.toLowerCase() === "amended" && (
                    <Button
                      variant="ghost"
                      leftIcon="published_with_changes"
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      disabled={isLoading}
                      label={dict.action.resubmit}
                      onClick={onResubmissionForApproval}
                    />
                  )}

                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.sales) &&
                  isSubmissionOrGeneralPage && (
                    <Button
                      variant="ghost"
                      leftIcon="edit"
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      disabled={isLoading}
                      label={dict.action.edit}
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        router.push(
                          `${Routes.REGISTRY_EDIT}/${props.recordType}/${recordId}`
                        );
                      }}
                    />
                  )}

                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.sales) &&
                  isSubmissionOrGeneralPage && (
                    <Button
                      variant="ghost"
                      leftIcon="delete"
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      disabled={isLoading}
                      label={dict.action.delete}
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        router.push(
                          `${Routes.REGISTRY_DELETE}/${props.recordType}/${recordId}`
                        );
                      }}
                    />
                  )}
              </>
            )}
            {!isSubmissionOrGeneralPage && (
              <>
                <Button
                  variant="ghost"
                  leftIcon="open_in_new"
                  size="md"
                  iconSize="medium"
                  className="w-full justify-start"

                  label={parseWordsForLabels(dict.action.view)}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    if (isSubmissionOrGeneralPage) {
                      handleClickView();
                    } else {
                      props.setTask(
                        genTaskOption(
                          recordId,
                          props.row,
                          "default",
                          dict.title.scheduleType
                        )
                      );
                      dispatch(openDrawer());
                    }
                  }}
                />
                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.completeTask) &&
                  (props.lifecycleStage === "outstanding" ||
                    props.lifecycleStage === "closed") &&
                  (props.row?.status?.toLowerCase() === "assigned" ||
                    props.row?.status?.toLowerCase() === "completed") && (
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
                          genTaskOption(
                            recordId,
                            props.row,
                            "complete",
                            dict.title.scheduleType
                          )
                        );
                        dispatch(openDrawer());
                      }}
                    />
                  )}
                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.operation) &&
                  props.row?.status?.toLowerCase() !== "issue" &&
                  props.row?.status?.toLowerCase() !== "cancelled" && (
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
                          genTaskOption(
                            recordId,
                            props.row,
                            "dispatch",
                            dict.title.scheduleType
                          )
                        );
                        dispatch(openDrawer());
                      }}
                    />
                  )}
                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.operation) &&
                  (props.lifecycleStage === "outstanding" ||
                    props.lifecycleStage === "scheduled") &&
                  compareDates(props.row?.date, true) &&
                  (props.row?.status?.toLowerCase() === "new" ||
                    props.row?.status?.toLowerCase() === "assigned") && (
                    <Button
                      variant="ghost"
                      leftIcon="cancel"
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      label={dict.action.cancel}
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        props.setTask(
                          genTaskOption(
                            recordId,
                            props.row,
                            "cancel",
                            dict.title.scheduleType
                          )
                        );
                        dispatch(openDrawer());
                      }}
                    />
                  )}
                {(!keycloakEnabled ||
                  !permissionScheme ||
                  permissionScheme.hasPermissions.reportTask) &&
                  props.lifecycleStage === "outstanding" &&
                  compareDates(props.row?.date, false) &&
                  (props.row?.status?.toLowerCase() === "new" ||
                    props.row?.status?.toLowerCase() === "assigned") && (
                    <Button
                      variant="ghost"
                      leftIcon="report"
                      size="md"
                      iconSize="medium"
                      className="w-full justify-start"
                      label={dict.action.report}
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        props.setTask(
                          genTaskOption(
                            recordId,
                            props.row,
                            "report",
                            dict.title.scheduleType
                          )
                        );
                        dispatch(openDrawer());
                      }}
                    />
                  )}
              </>
            )}
          </div>
        </PopoverActionButton>
      )}
    </div>
  );
}

// Generates a task option based on the input parameters
export function genTaskOption(
  recordId: string,
  row: FieldValues,
  taskType: RegistryTaskType,
  scheduleTypeKey: string
): RegistryTaskOption {
  let status: string;
  if (row.order === "0" || row.status?.toLowerCase() === "new") {
    status = Status.NEW;
  } else if (row.order === "1" || row.status?.toLowerCase() === "assigned") {
    status = Status.ASSIGNED;
  } else if (row.order === "2" || row.status?.toLowerCase() === "completed") {
    status = Status.COMPLETED;
  } else if (row.order === "3" || row.status?.toLowerCase() === "cancelled") {
    status = Status.CANCELLED;
  } else if (row.order === "4" || row.status?.toLowerCase() === "issue") {
    status = Status.ISSUE;
  } else {
    status = "";
  }
  return {
    id: recordId,
    status: status,
    contract: row.id,
    date: row.date,
    scheduleType: row[scheduleTypeKey],
    type: taskType,
  };
}
