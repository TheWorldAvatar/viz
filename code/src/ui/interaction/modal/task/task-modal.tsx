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
  RegistryTaskType,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import Button from "ui/interaction/button";
import { FormComponent } from "ui/interaction/form/form";
import { FORM_STATES } from "ui/interaction/form/form-utils";
import { FormTemplate } from "ui/interaction/form/template/form-template";
import Modal from "ui/interaction/modal/modal";

import { getTranslatedStatusLabel, Status } from "ui/text/status/status";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { PermissionScheme } from "types/auth";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

import { toast } from "ui/interaction/action/toast/toast";

interface TaskModalProps {
  entityType: string;
  isOpen: boolean;
  task: RegistryTaskOption;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

/**
 * A modal component for users to interact with their tasks while on the registry.
 *
 * @param {string} entityType The type of entity for the task's contract.
 * @param {boolean} isOpen Indicator if the this modal should be opened.
 * @param {RegistryTaskOption} task The current task to display.
 * @param setIsOpen Method to close or open the modal.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function TaskModal(props: Readonly<TaskModalProps>) {
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const dict: Dictionary = useDictionary();
  const [taskType, setTaskType] = useState<RegistryTaskType>(props.task.type);

  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // Form actions
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);

  const [refreshFlag, triggerRefresh] = useRefresh();

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

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
    if (taskType === "dispatch") {
      action = "dispatch";
      formData[FORM_STATES.ORDER] = 0;
    } else if (taskType === "complete") {
      action = "complete";
      formData[FORM_STATES.ORDER] = 1;
    } else if (taskType === "cancel") {
      action = "cancel";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task.status
      );
    } else if (taskType === "report") {
      action = "report";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task.status
      );
    } else {
      return;
    }
    submitLifecycleAction(
      formData,
      action,
      taskType !== "dispatch" && taskType !== "complete"
    );
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
    toast(
      response?.data?.message || response?.error?.message,
      response?.error ? "error" : "success"
    );
    if (response && !response?.error) {
      setTimeout(() => {
        props.setIsOpen(false);
        // Reset states on successful submission
        props.setTask(null);
        setFormFields([]);
      }, 2000);
    }
  };

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

    if (taskType === "dispatch") {
      getFormTemplate("service", "dispatch", props.task.id);
    } else if (taskType === "complete") {
      getFormTemplate("service", "complete", props.task.id);
    } else if (taskType === "report") {
      getFormTemplate("service", "report");
    } else if (taskType === "cancel") {
      getFormTemplate("service", "cancel");
    }
  }, [taskType]);

  return (
    <Modal isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
      <section className="flex justify-between items-center text-nowrap text-foreground p-2">
        <h1 className="text-xl font-bold">
          {parseWordsForLabels(dict.title.actions)}
        </h1>
        <h2 className="text-md md:text-lg mr-4  md:mr-8">
          {props.task.date}: {getTranslatedStatusLabel(props.task.status, dict)}
        </h2>
      </section>
      <section className="overflow-y-auto overflow-x-hidden h-[75vh] md:p-2 p-1">
        {taskType !== "default" && (
          <p className="text-lg mb-4 whitespace-pre-line">
            {taskType === "complete" && dict.message.completeInstruction}
            {taskType === "dispatch" &&
              `${dict.message.dispatchInstruction} ${props.task.date}:`}
            {taskType === "cancel" &&
              `${dict.message.cancelInstruction} ${props.task.date}:`}
            {taskType === "report" &&
              `${dict.message.reportInstruction.replace(
                "{date}",
                props.task.date
              )}`}
          </p>
        )}
        {isFetching || (refreshFlag && <LoadingSpinner isSmall={false} />)}
        {taskType === "default" && !(refreshFlag || isFetching) && (
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
      <section className="flex justify-between p-2">
        {!formRef.current?.formState?.isSubmitting && (
          <Button
            leftIcon="cached"
            variant="outline"
            size="icon"
            onClick={triggerRefresh}
          />
        )}
        {formRef.current?.formState?.isSubmitting && (
          <LoadingSpinner isSmall={false} />
        )}

        <div className="flex flex-wrap gap-2 justify-end items-center ">
          <div className="flex-grow" />
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeTask) &&
            (props.task?.status?.toLowerCase() ==
              dict.title.assigned?.toLowerCase() ||
              props.task?.status?.toLowerCase() ==
                dict.title.completed?.toLowerCase()) &&
            taskType === "default" && (
              <Button
                leftIcon="done_outline"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.complete}
                onClick={() => setTaskType("complete")}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.task?.status?.toLowerCase() !==
              dict.title.issue?.toLowerCase() &&
            props.task?.status?.toLowerCase() !==
              dict.title.cancelled?.toLowerCase() &&
            taskType === "default" && (
              <Button
                leftIcon="assignment"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.dispatch}
                onClick={() => setTaskType("dispatch")}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            (props.task?.status?.toLowerCase() ===
              dict.title.new?.toLowerCase() ||
              props.task?.status?.toLowerCase() ===
                dict.title.assigned?.toLowerCase()) &&
            taskType === "default" && (
              <Button
                variant="secondary"
                leftIcon="cancel"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.cancel}
                onClick={() => setTaskType("cancel")}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.reportTask) &&
            (props.task?.status?.toLowerCase() ===
              dict.title.new?.toLowerCase() ||
              props.task?.status?.toLowerCase() ===
                dict.title.assigned?.toLowerCase()) &&
            taskType === "default" && (
              <Button
                variant="secondary"
                leftIcon="report"
                size="md"
                iconSize="medium"
                className="w-full justify-start"
                label={dict.action.report}
                onClick={() => setTaskType("report")}
              />
            )}
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
                onClick={onSubmit}
              />
            )}
          <Button
            leftIcon="first_page"
            variant="secondary"
            label={dict.action.return}
            tooltipText={dict.action.return}
            onClick={() => {
              props.setIsOpen(false);
              // Reset states on return
              props.setTask(null);
              setFormFields([]);
            }}
          />
        </div>
      </section>
    </Modal>
  );
}
