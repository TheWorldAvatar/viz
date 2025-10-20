"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";

import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  FORM_IDENTIFIER,
  FormTemplateType,
  PropertyShapeOrGroup,
  RegistryTaskOption,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import { FormComponent } from "ui/interaction/form/form";
import { FORM_STATES } from "ui/interaction/form/form-utils";
import { FormTemplate } from "ui/interaction/form/template/form-template";

import { getTranslatedStatusLabel, Status } from "ui/text/status/status";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { PermissionScheme } from "types/auth";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

import { toast } from "ui/interaction/action/toast/toast";
import { useDispatch } from "react-redux";
import { closeDrawer, openDrawer } from "state/drawer-component-slice";
import Drawer from "ui/interaction/drawer/drawer";

interface TaskModalProps {
  entityType: string;
  task: RegistryTaskOption;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  onSuccess?: () => void;
}

/**
 * A modal component for users to interact with their tasks while on the registry.
 *
 * @param {string} entityType The type of entity for the task's contract.
 * @param {RegistryTaskOption} task The current task to display.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function TaskModal(props: Readonly<TaskModalProps>) {
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();
  const dispatch = useDispatch();

  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  // Form actions
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);

  const { refreshFlag, triggerRefresh } = useRefresh();

  // Declare a function to get the previous event occurrence enum based on the current status.
  const getPrevEventOccurrenceEnum = useCallback(
    (currentStatus: string): number => {
      // Enum should be 0 for order received at pending dispatch state
      if (currentStatus === Status.NEW) {
        return 0;
      } else {
        // Enum will be 1 as there is already a dispatch event instantiated
        return 1;
      }
    },
    []
  );

  const taskSubmitAction: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    let action = "";
    if (props.task?.type === "dispatch") {
      action = "dispatch";
      formData[FORM_STATES.ORDER] = 0;
    } else if (props.task?.type === "complete") {
      if (isSaving) {
        action = "saved";
        setIsSaving(false);
      } else {
        action = "complete";
      }
      formData[FORM_STATES.ORDER] = 1;
    } else if (props.task?.type === "cancel") {
      action = "cancel";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task?.status
      );
    } else if (props.task?.type === "report") {
      action = "report";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task?.status
      );
    } else {
      return;
    }
    let response: AgentResponseBody = await submitLifecycleAction(
      formData,
      action,
      props.task?.type !== "dispatch" && props.task?.type !== "complete"
    );
    if (!response?.error && isDuplicate) {
      response = await submitLifecycleAction(formData, "continue", true);
      setIsDuplicate(false);
    }
    toast(
      response?.data?.message || response?.error?.message,
      response?.error ? "error" : "success"
    );

    if (response && !response?.error) {
      setTimeout(() => {
        // Inform parent to refresh data on successful action
        props.onSuccess?.();
        // Reset states on successful submission
        props.setTask(null);
        setFormFields([]);
        dispatch(closeDrawer());
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
    formData[FORM_STATES.CONTRACT] = props.task.contract;
    formData[FORM_STATES.DATE] = props.task.date;
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

  // A hook that submits the form when buttons are clicked
  // This approach ensures that the isSaving state is changed before the form is submitted, so that the saved state is acknowledged
  useEffect(() => {
    if ((isSubmitting || isSaving) && formRef.current) {
      formRef.current.requestSubmit();
      setIsSubmitting(false);
    }
  }, [isSubmitting, isSaving]);

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    // Target id is optional, and will default to form
    const getFormTemplate = async (
      lifecycleStage: string,
      eventType: string,
      targetId?: string
    ): Promise<void> => {
      setIsFetching(true);
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
      setFormFields(template.property);
      setIsFetching(false);
    };

    // Reset forms when they are changed
    triggerRefresh();
    setFormFields([]);

    if (props.task?.type === "dispatch") {
      getFormTemplate("service", "dispatch", props.task.id);
    } else if (props.task?.type === "complete") {
      getFormTemplate("service", "complete", props.task.id);
    } else if (props.task?.type === "report") {
      getFormTemplate("service", "report");
    } else if (props.task?.type === "cancel") {
      getFormTemplate("service", "cancel");
    }
  }, [props.task?.id, props.task?.status, props.task?.type]);

  return (
    <Drawer>
      {/* Header */}
      <section className="flex justify-between items-center text-nowrap text-foreground p-1 mt-10 mb-0.5  shrink-0">
        <h1 className="text-xl font-bold">
          {parseWordsForLabels(dict.title.actions)}
        </h1>
        <h2 className="text-base md:text-lg md:mr-8">
          {props.task.date}: {getTranslatedStatusLabel(props.task.status, dict)}
        </h2>
      </section>
      {/* Scrollable Content */}
      <section className="overflow-y-auto overflow-x-hidden md:p-3 p-1 flex-1 min-h-0">
        {props.task?.type !== "default" && (
          <p className="text-lg mb-4 whitespace-pre-line">
            {props.task?.type === "complete" &&
              dict.message.completeInstruction}
            {props.task?.type === "dispatch" &&
              `${dict.message.dispatchInstruction} ${props.task.date}:`}
            {props.task?.type === "cancel" &&
              `${dict.message.cancelInstruction} ${props.task.date}:`}
            {props.task?.type === "report" &&
              `${dict.message.reportInstruction.replace(
                "{date}",
                props.task.date
              )}`}
          </p>
        )}
        {isFetching || (refreshFlag && <LoadingSpinner isSmall={false} />)}
        {props.task?.type === "default" && !(refreshFlag || isFetching) && (
          <FormComponent
            formRef={formRef}
            entityType={props.entityType}
            formType={"view"}
            id={getAfterDelimiter(props.task.contract, "/")}
          />
        )}
        {formFields?.length > 0 && !refreshFlag && (
          <FormTemplate
            entityType={
              props.task?.type === "report"
                ? "report"
                : props.task?.type === "cancel"
                  ? "cancellation"
                  : "dispatch"
            }
            formRef={formRef}
            fields={formFields}
            submitAction={taskSubmitAction}
            setIsSubmitting={setIsFormSubmitting}
          />
        )}
      </section>
      {/* Footer */}
      <section className="flex items-start 2xl:items-center justify-between p-2  sticky bottom-0 shrink-0 mb-2.5 mt-2.5  2xl:mb-4 2xl:mt-4">
        {!formRef.current?.formState?.isSubmitting && (
          <Button
            leftIcon="cached"
            disabled={isFetching || isFormSubmitting}
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
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeTask) &&
            (props.task?.status?.toLowerCase() === "assigned" ||
              props.task?.status?.toLowerCase() === "completed") &&
            props.task?.type === "default" && (
              <Button
                leftIcon="done_outline"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.complete}
                onClick={() => {
                  props.setTask({
                    ...props.task,
                    type: "complete",
                  });
                  dispatch(openDrawer());
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.task?.status?.toLowerCase() !== "issue" &&
            props.task?.status?.toLowerCase() !== "cancelled" &&
            props.task?.type === "default" && (
              <Button
                leftIcon="assignment"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.dispatch}
                onClick={() => {
                  props.setTask({
                    ...props.task,
                    type: "dispatch",
                  });
                  dispatch(openDrawer());
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            (props.task?.status?.toLowerCase() === "new" ||
              props.task?.status?.toLowerCase() === "assigned") &&
            props.task?.type === "default" && (
              <Button
                variant="secondary"
                leftIcon="cancel"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.cancel}
                onClick={() => {
                  props.setTask({
                    ...props.task,
                    type: "cancel",
                  });
                  dispatch(openDrawer());
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.reportTask) &&
            (props.task?.status?.toLowerCase() === "new" ||
              props.task?.status?.toLowerCase() === "assigned") &&
            props.task?.type === "default" && (
              <Button
                variant="secondary"
                leftIcon="report"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.report}
                onClick={() => {
                  props.setTask({
                    ...props.task,
                    type: "report",
                  });
                  dispatch(openDrawer());
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            (permissionScheme.hasPermissions.completeTask &&
              props.task?.type === "complete") ||
            (permissionScheme.hasPermissions.reportTask &&
              props.task?.type === "report") ||
            (permissionScheme.hasPermissions.operation &&
              (props.task?.type === "dispatch" ||
                props.task?.type === "cancel"))) &&
            props.task?.type !== "default" && (
              <Button
                leftIcon="send"
                label={dict.action.submit}
                tooltipText={dict.action.submit}
                loading={isFormSubmitting && !isDuplicate && !isSaving}
                disabled={isFormSubmitting}
                onClick={() => {
                  if (
                    props.task?.type === "complete" &&
                    props.task.scheduleType === dict.form.perpetualService
                  ) {
                    setIsDuplicate(true);
                  }
                  setIsSubmitting(true);
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeAndDuplicateTask) &&
            props.task?.type === "complete" &&
            props.task.scheduleType != dict.form.perpetualService && (
              <Button
                leftIcon="schedule_send"
                variant="secondary"
                loading={isFormSubmitting && isDuplicate && !isSaving}
                disabled={isFormSubmitting}
                label={dict.action.submitAndDuplicate}
                tooltipText={dict.action.submitAndDuplicate}
                onClick={() => {
                  setIsSubmitting(true);
                  setIsDuplicate(true);
                  setIsSaving(false);
                }}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.saveTask) &&
            props.task?.type === "complete" && (
              <Button
                leftIcon="save"
                variant="secondary"
                loading={isFormSubmitting && !isSaving && !isDuplicate}
                disabled={isFormSubmitting}
                label={dict.action.save}
                tooltipText={dict.action.save}
                onClick={() => {
                  setIsSubmitting(true);
                  setIsSaving(true);
                  setIsDuplicate(false);
                }}
              />
            )}
        </div>
      </section>
    </Drawer>
  );
}
