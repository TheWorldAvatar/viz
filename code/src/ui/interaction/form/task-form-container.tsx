"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  FORM_IDENTIFIER,
  FormTemplateType,
  FormType,
  PropertyShapeOrGroup,
  RegistryTaskOption,
  RegistryTaskType,
  SparqlResponseField,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import { FormComponent } from "ui/interaction/form/form";
import { FORM_STATES } from "ui/interaction/form/form-utils";
import { FormTemplate } from "ui/interaction/form/template/form-template";
import FormSkeleton from "ui/interaction/form/skeleton/form-skeleton";
import NavigationDrawer from "ui/interaction/drawer/navigation-drawer";
import { toast } from "ui/interaction/action/toast/toast";
import { getTranslatedStatusLabel } from "ui/text/status/status";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

interface TaskFormContainerComponentProps {
  entityType: string;
  formType: FormType;
  isPrimaryEntity?: boolean;
}

/**
 * Renders a task form container for intercept routes (modal).
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as dispatch, complete, cancel, report, view.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 */
export function InterceptTaskFormContainerComponent(
  props: Readonly<TaskFormContainerComponentProps>
) {
  return (
    <NavigationDrawer>
      <TaskFormContents {...props} />
    </NavigationDrawer>
  );
}

/**
 * Renders a task form container for full page.
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as dispatch, complete, cancel, report, view.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 */
export function TaskFormContainerComponent(
  props: Readonly<TaskFormContainerComponentProps>
) {
  return (
    <div className="flex flex-col w-full h-full mt-0 xl:w-[50vw] xl:h-[85vh] mx-auto justify-between py-4 px-4 md:px-8 bg-muted xl:border-1 xl:shadow-lg xl:border-border xl:rounded-xl xl:mt-4">
      <TaskFormContents {...props} />
    </div>
  );
}

/**
 * The internal content component for task forms.
 * Fetches task data from the URL ID and handles task operations.
 */
function TaskFormContents(props: Readonly<TaskFormContainerComponentProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();
  const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);

  const id: string = getAfterDelimiter(pathname, "/");

  // State for task data
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);
  const [taskData, setTaskData] = useState<RegistryTaskOption | null>(null);

  const { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading } = useOperationStatus();

  // Map formType to RegistryTaskType
  const getTaskType = (): RegistryTaskType => {
    switch (props.formType) {
      case "dispatch":
        return "dispatch";
      case "complete":
        return "complete";
      case "cancel":
        return "cancel";
      case "report":
        return "report";
      default:
        return "default";
    }
  };

  const taskType = getTaskType();


  // Declare a function to get the previous event occurrence enum based on the current status.
  const getPrevEventOccurrenceEnum = useCallback(
    (currentStatus: string): number => {
      // Enum should be 0 for order received at pending dispatch state
      if (currentStatus === "new") {
        return 0;
      } else {
        // Enum will be 1 as there is already a dispatch event instantiated
        return 1;
      }
    },
    []
  );

  // Fetch form template for the task type
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    // Target id is optional, and will default to form
    const getFormTemplate = async (
      lifecycleStage: string,
      eventType: string,
      targetId?: string
    ): Promise<void> => {
      setIsFetching(true);
      try {
        const template: FormTemplateType = await fetch(
          makeInternalRegistryAPIwithParams(
            "event",
            lifecycleStage,
            eventType,
            targetId ? getAfterDelimiter(targetId, "/") : FORM_IDENTIFIER
          ),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        ).then(async (res) => {
          const resBody: AgentResponseBody = await res.json();
          return resBody.data?.items?.[0] as FormTemplateType;
        });
        if (template?.property) {
          setFormFields(template.property);
        }
      } catch (error) {
        console.error("Failed to fetch form template:", error);
      } finally {
        setIsFetching(false);
      }
    };

    // Reset forms when they are changed
    triggerRefresh();
    setFormFields([]);

    if (taskType === "dispatch") {
      getFormTemplate("service", "dispatch", id);
    } else if (taskType === "complete") {
      getFormTemplate("service", "complete", id);
    } else if (taskType === "report") {
      getFormTemplate("service", "report");
    } else if (taskType === "cancel") {
      getFormTemplate("service", "cancel");
    }
  }, [id, taskType]);


  // Handle task metadata (status, date, contract, scheduleType) from internal tasks API

  useEffect(() => {
    const fetchTask = async (): Promise<void> => {
      setIsFetching(true);
      try {
        const res = await fetch(
          makeInternalRegistryAPIwithParams("task", id),
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        );
        const resBody: AgentResponseBody = await res.json();
        const itemData: Record<string, SparqlResponseField> = resBody.data?.items?.[0] as Record<string, SparqlResponseField>;
        const item: RegistryTaskOption = {
          contract: itemData.contract.value,
          status: itemData.status.value,
          date: itemData.date.value,
          scheduleType: itemData.scheduleType.value,
        };

        setTaskData(item);

      } catch (error) {
        // Should I add task errror as a toast here?
        console.error("Failed to fetch task data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  // Handle form submission when buttons are clicked
  useEffect(() => {
    if ((isSubmitting || isSaving) && formRef.current) {
      formRef.current.requestSubmit();
      setIsSubmitting(false);
    }
  }, [isSubmitting, isSaving]);

  const taskSubmitAction: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    startLoading();
    let action = "";
    if (taskType === "dispatch") {
      action = "dispatch";
      formData[FORM_STATES.ORDER] = 0;
    } else if (taskType === "complete") {
      if (isSaving) {
        action = "saved";
        setIsSaving(false);
      } else {
        action = "complete";
      }
      formData[FORM_STATES.ORDER] = 1;
    } else if (taskType === "cancel") {
      action = "cancel";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(taskData?.status ?? "");
    } else if (taskType === "report") {
      action = "report";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(taskData?.status ?? "");
    } else {
      return;
    }

    let response: AgentResponseBody = await submitLifecycleAction(
      formData,
      action,
      taskType !== "dispatch" && taskType !== "complete"
    );

    if (!response?.error && isDuplicate) {
      response = await submitLifecycleAction(formData, "continue", true);
      setIsDuplicate(false);
    }

    stopLoading();
    toast(
      response?.data?.message || response?.error?.message,
      response?.error ? "error" : "success"
    );

    if (response && !response?.error) {
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  // Reusable action method to report, cancel, dispatch, or complete the service task
  const submitLifecycleAction = async (
    formData: FieldValues,
    action: string,
    isPost: boolean
  ) => {
    // Add contract and date field

    formData[FORM_STATES.CONTRACT] = taskData.contract;
    formData[FORM_STATES.DATE] = taskData.date;


    let response: AgentResponseBody;
    if (isPost) {
      const res = await fetch(
        makeInternalRegistryAPIwithParams("event", "service", action),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "same-origin",
          body: JSON.stringify(formData),
        }
      );
      response = await res.json();
    } else {
      const res = await fetch(
        makeInternalRegistryAPIwithParams("event", "service", action),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "same-origin",
          body: JSON.stringify(formData),
        }
      );
      response = await res.json();
    }
    return response;
  };

  // Navigate to a different task action with query params
  const navigateToTaskAction = (action: RegistryTaskType) => {
    const routeMap: Record<RegistryTaskType, string> = {
      dispatch: Routes.REGISTRY_TASK_DISPATCH,
      complete: Routes.REGISTRY_TASK_COMPLETE,
      cancel: Routes.REGISTRY_TASK_CANCEL,
      report: Routes.REGISTRY_TASK_REPORT,
      default: Routes.REGISTRY_TASK_VIEW,
    };

    router.push(`${routeMap[action]}/${props.entityType}/${id}`);
  };

  return (
    <>
      {/* Header */}
      <section className="flex justify-between items-center text-nowrap text-foreground p-1 mt-10 mb-0.5 shrink-0">
        <h1 className="text-xl font-bold">
          {parseWordsForLabels(dict.title.actions)}
        </h1>
        {taskData?.date && (
          <h2 className="text-base md:text-lg md:mr-8">
            {taskData.date}: {getTranslatedStatusLabel(taskData?.status, dict)}
          </h2>
        )}
      </section>

      {/* Scrollable Content */}
      <section className="overflow-y-auto overflow-x-hidden md:p-3 p-1 flex-1 min-h-0">
        {taskType !== "default" && taskData?.date && (
          <p className="text-lg mb-4 whitespace-pre-line">
            {taskType === "complete" && dict.message.completeInstruction}
            {taskType === "dispatch" &&
              `${dict.message.dispatchInstruction} ${taskData.date}:`}
            {taskType === "cancel" &&
              `${dict.message.cancelInstruction} ${taskData.date}:`}
            {taskType === "report" &&
              `${dict.message.reportInstruction.replace(
                "{date}",
                taskData.date
              )}`}
          </p>
        )}

        {(isFetching || refreshFlag) && <FormSkeleton />}

        {taskType === "default" && !(refreshFlag || isFetching) && (
          <FormComponent
            formRef={formRef}
            entityType={props.entityType}
            formType={"view"}
            id={taskData ? getAfterDelimiter(taskData.contract, "/") : ""}
          />
        )}

        {formFields?.length > 0 && !refreshFlag && (
          <FormTemplate
            entityType={
              taskType === "report"
                ? "report"
                : taskType === "cancel"
                  ? "cancellation"
                  : "dispatch"
            }
            formRef={formRef}
            fields={formFields}
            submitAction={taskSubmitAction}
          />
        )}
      </section>

      {/* Footer */}
      <section className="flex items-start 2xl:items-center justify-between p-2 sticky bottom-0 shrink-0 mb-2.5 mt-2.5 2xl:mb-4 2xl:mt-4">
        {!formRef.current?.formState?.isSubmitting && (
          <Button
            leftIcon="cached"
            disabled={isFetching || isLoading}
            variant="outline"
            size="icon"
            onClick={triggerRefresh}
          />
        )}
        {formRef.current?.formState?.isSubmitting && (
          <LoadingSpinner isSmall={false} />
        )}

        <div className="flex flex-wrap gap-2.5 2xl:gap-2 justify-end items-center">
          <div className="flex-grow" />

          {/* Complete button - shown when viewing and status is assigned/completed */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeTask) &&
            (taskData?.status?.toLowerCase() === "assigned" ||
              taskData?.status?.toLowerCase() === "completed") &&
            taskType === "default" && (
              <Button
                leftIcon="done_outline"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.complete}
                onClick={() => navigateToTaskAction("complete")}
              />
            )}

          {/* Dispatch button - shown when viewing and status is not issue/cancelled */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            taskData?.status?.toLowerCase() !== "issue" &&
            taskData?.status?.toLowerCase() !== "cancelled" &&
            taskType === "default" && (
              <Button
                leftIcon="assignment"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.dispatch}
                onClick={() => navigateToTaskAction("dispatch")}
              />
            )}

          {/* Cancel button - shown when viewing and status is new/assigned */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            (taskData?.status?.toLowerCase() === "new" ||
              taskData?.status?.toLowerCase() === "assigned") &&
            taskType === "default" && (
              <Button
                variant="secondary"
                leftIcon="cancel"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.cancel}
                onClick={() => navigateToTaskAction("cancel")}
              />
            )}

          {/* Report button - shown when viewing and status is new/assigned */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.reportTask) &&
            (taskData?.status?.toLowerCase() === "new" ||
              taskData?.status?.toLowerCase() === "assigned") &&
            taskType === "default" && (
              <Button
                variant="secondary"
                leftIcon="report"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.report}
                onClick={() => navigateToTaskAction("report")}
              />
            )}

          {/* Submit button - shown for non-view task types */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            (permissionScheme.hasPermissions.completeTask &&
              taskType === "complete") ||
            (permissionScheme.hasPermissions.reportTask &&
              taskType === "report") ||
            (permissionScheme.hasPermissions.operation &&
              (taskType === "dispatch" || taskType === "cancel"))) &&
            taskType !== "default" && (
              <Button
                leftIcon="send"
                label={dict.action.submit}
                tooltipText={dict.action.submit}
                disabled={isLoading}
                onClick={() => {
                  if (
                    taskType === "complete" &&
                    taskData?.scheduleType === dict.form.perpetualService
                  ) {
                    setIsDuplicate(true);
                  }
                  setIsSubmitting(true);
                }}
              />
            )}

          {/* Submit and Duplicate button - shown for complete task type */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeAndDuplicateTask) &&
            taskType === "complete" &&
            taskData?.scheduleType !== dict.form.perpetualService && (
              <Button
                leftIcon="schedule_send"
                variant="secondary"
                disabled={isLoading}
                label={dict.action.submitAndDuplicate}
                tooltipText={dict.action.submitAndDuplicate}
                onClick={() => {
                  setIsSubmitting(true);
                  setIsDuplicate(true);
                }}
              />
            )}

          {/* Save button - shown for complete task type */}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.saveTask) &&
            taskType === "complete" && (
              <Button
                leftIcon="save"
                variant="secondary"
                disabled={isLoading}
                label={dict.action.save}
                tooltipText={dict.action.save}
                onClick={() => {
                  setIsSubmitting(true);
                  setIsSaving(true);
                }}
              />
            )}
        </div>
      </section>
    </>
  );
}
