"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";

import { CustomAgentResponseBody } from "types/backend-agent";
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
import Modal from "ui/interaction/modal/modal";
import ResponseComponent from "ui/text/response/response";
import { getTranslatedStatusLabel, Status } from "ui/text/status/status";
import { getAfterDelimiter } from "utils/client-utils";

import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

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
  const dict: Dictionary = useDictionary();

  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // Form actions

  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);
  const [dispatchFields, setDispatchFields] = useState<PropertyShapeOrGroup[]>(
    []
  );
  const [response, setResponse] = useState<CustomAgentResponseBody>(null);

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
      if (currentStatus === Status.PENDING_DISPATCH) {
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
    if (props.task.type === "dispatch") {
      action = "dispatch";
      formData[FORM_STATES.ORDER] = 0;
    } else if (props.task.type === "complete") {
      action = "complete";
      formData[FORM_STATES.ORDER] = 1;
    } else if (props.task.type === "cancel") {
      action = "cancel";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task.status
      );
    } else if (props.task.type === "report") {
      action = "report";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task.status
      );
    } else {
      return;
    }
    submitLifecycleAction(formData, action, props.task.type !== "dispatch");
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
    let response: CustomAgentResponseBody;
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
    setResponse(response);
    setFormFields([]);
    setDispatchFields([]);
  };
  // A hook that fetches the form template with dispatch details included
  useEffect(() => {
    // Declare an async function to retrieve the form template with dispatch details
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
      ).then((res) => res.json());
      setFormFields(template.property);
      setIsFetching(false);
    };

    if (props.task.type === "dispatch") {
      getFormTemplate("service", "dispatch", props.task.id);
    } else if (props.task.type === "complete") {
      getFormTemplate("service", "complete");
    } else if (props.task.type === "report") {
      getFormTemplate("service", "report");
    } else if (props.task.type === "cancel") {
      getFormTemplate("service", "cancel");
    }
  }, [props.task.type]);

  // Closes the modal only if response is successfull
  useEffect(() => {
    if (response?.success) {
      setTimeout(() => {
        setResponse(null);
        props.setIsOpen(false);
      }, 2000);
    }
  }, [response]);

  // Reset the states when the modal is closed
  useEffect(() => {
    if (!props.isOpen) {
      setResponse(null);
      setFormFields([]);
      setDispatchFields([]);
    }
  }, [props.isOpen]);

  return (
    <Modal isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
      <section className="flex justify-between items-center text-nowrap text-foreground p-2">
        <h1 className="text-xl font-bold">{dict.title.actions}</h1>
        <h2 className="text-sm md:text-lg mr-4  md:mr-8">
          {props.task.date}: {getTranslatedStatusLabel(props.task.status, dict)}
        </h2>
      </section>
      <section className="overflow-y-auto overflow-x-hidden h-[75vh] md:p-2">
        {!isFetching && props.task.type !== "default" && (
          <p className="text-lg mb-4">
            {props.task.type === "complete" && dict.message.completeInstruction}
            {props.task.type === "dispatch" &&
              `${dict.message.dispatchInstruction} ${props.task.date}:`}
            {props.task.type === "cancel" &&
              `${dict.message.cancelInstruction} ${props.task.date}:`}
            {props.task.type === "report" &&
              `${dict.message.reportInstruction.replace(
                "{date}",
                props.task.date
              )}`}
          </p>
        )}
        {isFetching || (refreshFlag && <LoadingSpinner isSmall={false} />)}
        {!(props.task.type !== "default" || isFetching) && !refreshFlag && (
          <FormComponent
            formRef={formRef}
            entityType={props.entityType}
            formType={"view"}
            setResponse={setResponse}
            id={getAfterDelimiter(props.task.contract, "/")}
            additionalFields={dispatchFields}
          />
        )}
        {formFields.length > 0 && !refreshFlag && (
          <FormTemplate
            entityType={
              props.task.type === "report"
                ? "report"
                : props.task.type === "cancel"
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
        {!formRef.current?.formState?.isSubmitting && !response && (
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

        {!formRef.current?.formState?.isSubmitting && (
          <ResponseComponent response={response} />
        )}
        <div className="flex flex-wrap gap-2 justify-end items-center">
          <div className="flex-grow" />
          {!response && props.task.type !== "default" && (
            <Button
              leftIcon="send"
              label={dict.action.submit}
              tooltipText={dict.action.submit}
              onClick={onSubmit}
            />
          )}
        </div>
      </section>
    </Modal>
  );
}
