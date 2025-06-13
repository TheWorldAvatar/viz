"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";
import { Paths } from "io/config/routes";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import {
  FORM_IDENTIFIER,
  PropertyGroup,
  PropertyShape,
  PropertyShapeOrGroup,
  RegistryTaskOption,
  VALUE_KEY,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import ClickActionButton from "ui/interaction/action/click/click-button";
import { FormComponent } from "ui/interaction/form/form";
import { FORM_STATES } from "ui/interaction/form/form-utils";
import { FormTemplate } from "ui/interaction/form/template/form-template";
import Modal from "ui/interaction/modal/modal";
import ResponseComponent from "ui/text/response/response";
import { getTranslatedStatusLabel, Status } from "ui/text/status/status";
import { getAfterDelimiter } from "utils/client-utils";
import { genBooleanClickHandler } from "utils/event-handler";
import {
  getLifecycleFormTemplate,
  CustomAgentResponseBody,
  sendPostRequest,
  updateEntity,
} from "utils/server-actions";

interface TaskModalProps {
  entityType: string;
  registryAgentApi: string;
  isOpen: boolean;
  task: RegistryTaskOption;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

/**
 * A modal component for users to interact with their tasks while on the registry.
 *
 * @param {string} entityType The type of entity for the task's contract.
 * @param {string} registryAgentApi The target endpoint for the default registry agent.
 * @param {boolean} isOpen Indicator if the this modal should be opened.
 * @param {RegistryTaskOption} task The current task to display.
 * @param setIsOpen Method to close or open the modal.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function TaskModal(props: Readonly<TaskModalProps>) {
  const dict: Dictionary = useDictionary();
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const keycloakEnabled = process.env.KEYCLOAK === "true";

  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // Form actions
  const [isDispatchAction, setIsDispatchAction] = useState<boolean>(false);
  const [isCompleteAction, setIsCompleteAction] = useState<boolean>(false);
  const [isCancelAction, setIsCancelAction] = useState<boolean>(false);
  const [isReportAction, setIsReportAction] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);
  const [dispatchFields, setDispatchFields] = useState<PropertyShapeOrGroup[]>(
    []
  );
  const [response, setResponse] = useState<CustomAgentResponseBody>(null);

  const [refreshFlag, triggerRefresh] = useRefresh();

  // Return back to the non-action page
  const onReturnInAction: React.MouseEventHandler<HTMLButtonElement> = () => {
    setIsDispatchAction(false);
    setIsCompleteAction(false);
    setIsCancelAction(false);
    setIsReportAction(false);
    setResponse(null);
    setFormFields([]);
  };

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
    let url = `${props.registryAgentApi}/contracts/service/`;
    if (isDispatchAction) {
      url += "dispatch";
      // Enum should be always be 0 to update dispatch
      formData[FORM_STATES.ORDER] = 0;
    } else if (isCompleteAction) {
      url += "complete";
      formData[FORM_STATES.ORDER] = 1;
    } else if (isCancelAction) {
      url += "cancel";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task.status
      );
    } else if (isReportAction) {
      url += "report";
      formData[FORM_STATES.ORDER] = getPrevEventOccurrenceEnum(
        props.task.status
      );
    } else {
      return;
    }
    // Submit post requests if they are not dispatch action
    submitLifecycleAction(formData, url, !isDispatchAction);
  };

  // Reusable action method to report, cancel, dispatch, or complete the service task
  const submitLifecycleAction = async (
    formData: FieldValues,
    endpoint: string,
    isPost: boolean
  ) => {
    // Add contract and date field
    formData[FORM_STATES.CONTRACT] = props.task.contract;
    formData[FORM_STATES.DATE] = props.task.date;
    let response: CustomAgentResponseBody;
    if (isPost) {
      response = await sendPostRequest(endpoint, JSON.stringify(formData));
    } else {
      response = await updateEntity(endpoint, JSON.stringify(formData));
    }
    setResponse(response);
    setFormFields([]);
    setDispatchFields([]);
  };

  // A hook that fetches the form template with dispatch details included
  useEffect(() => {
    // Declare an async function to retrieve the form template with dispatch details
    const getFormTemplateWithDispatchDetails = async (
      endpoint: string,
      targetId: string
    ): Promise<void> => {
      setIsFetching(true);
      const id: string = getAfterDelimiter(targetId, "/");
      const template: PropertyShape[] = await getLifecycleFormTemplate(
        endpoint,
        "service",
        "dispatch",
        id
      );
      const group: PropertyGroup = {
        "@id": "dispatch group",
        "@type": "http://www.w3.org/ns/shacl#PropertyGroup",
        label: {
          "@value": dict.title.dispatchInfo,
        },
        comment: {
          "@value": "The dispatch details specified for this service.",
        },
        order: 1000,
        property: template.filter((shape) => shape.name[VALUE_KEY] != "id"), // Filter out id field
      };
      setDispatchFields([group]);
      setIsFetching(false);
    };
    // Only execute this for orders that are pending execution
    if (
      props.task.status === Status.PENDING_EXECUTION ||
      props.task.status === Status.COMPLETED
    ) {
      getFormTemplateWithDispatchDetails(props.registryAgentApi, props.task.id);
    }
  }, []);

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    // Target id is optional, and will default to form
    const getFormTemplate = async (
      endpoint: string,
      lifecycleStage: string,
      eventType: string,
      targetId?: string
    ): Promise<void> => {
      setIsFetching(true);
      const template: PropertyShapeOrGroup[] = await getLifecycleFormTemplate(
        endpoint,
        lifecycleStage,
        eventType,
        targetId ? getAfterDelimiter(targetId, "/") : FORM_IDENTIFIER // use the target id if available, else, default to an empty form
      );
      setFormFields(template);
      setIsFetching(false);
    };

    if (isDispatchAction) {
      getFormTemplate(
        props.registryAgentApi,
        "service",
        "dispatch",
        props.task.id
      );
    } else if (isCompleteAction) {
      getFormTemplate(props.registryAgentApi, "service", "complete");
    } else if (isReportAction) {
      getFormTemplate(props.registryAgentApi, "service", "report");
    } else if (isCancelAction) {
      getFormTemplate(props.registryAgentApi, "service", "cancel");
    }
  }, [isDispatchAction, isCompleteAction, isReportAction, isCancelAction]);

  // Closes the modal only if response is successfull
  useEffect(() => {
    if (response?.success) {
      setTimeout(() => {
        setIsDispatchAction(false);
        setIsCompleteAction(false);
        setIsCancelAction(false);
        setIsReportAction(false);
        setResponse(null);
        props.setIsOpen(false);
      }, 2000);
    }
  }, [response]);

  // Reset the states when the modal is closed
  useEffect(() => {
    if (!props.isOpen) {
      setIsDispatchAction(false);
      setIsCompleteAction(false);
      setIsCancelAction(false);
      setIsReportAction(false);
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
        {!isFetching &&
          (isReportAction ||
            isCancelAction ||
            isCompleteAction ||
            isDispatchAction) && (
            <p className="text-lg mb-4">
              {isCompleteAction && dict.message.completeInstruction}
              {isDispatchAction &&
                `${dict.message.dispatchInstruction} ${props.task.date}:`}
              {isCancelAction &&
                `${dict.message.cancelInstruction} ${props.task.date}:`}
              {isReportAction &&
                `${dict.message.reportInstruction.replace(
                  "{date}",
                  props.task.date
                )}`}
            </p>
          )}
        {isFetching || (refreshFlag && <LoadingSpinner isSmall={false} />)}
        {!(
          isReportAction ||
          isCancelAction ||
          isCompleteAction ||
          isDispatchAction ||
          isFetching
        ) &&
          !refreshFlag && (
            <FormComponent
              formRef={formRef}
              entityType={props.entityType}
              formType={Paths.REGISTRY}
              agentApi={props.registryAgentApi}
              setResponse={setResponse}
              id={getAfterDelimiter(props.task.contract, "/")}
              additionalFields={dispatchFields}
            />
          )}
        {formFields.length > 0 && !refreshFlag && (
          <FormTemplate
            agentApi={props.registryAgentApi}
            entityType={
              isReportAction
                ? "report"
                : isCancelAction
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
          <ClickActionButton
            icon={"cached"}
            onClick={triggerRefresh}
            isTransparent={true}
          />
        )}
        {formRef.current?.formState?.isSubmitting && (
          <LoadingSpinner isSmall={false} />
        )}

        {!formRef.current?.formState?.isSubmitting && (
          <ResponseComponent response={response} />
        )}
        <div className="flex flex-wrap gap-2 justify-end items-center">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.completeTask) &&
            props.task.status.toLowerCase().trim() ==
              Status.PENDING_EXECUTION &&
            !(
              isCancelAction ||
              isCompleteAction ||
              isDispatchAction ||
              isReportAction
            ) && (
              <ClickActionButton
                icon={"done_outline"}
                label="Complete"
                tooltipText={dict.action.complete}
                onClick={genBooleanClickHandler(setIsCompleteAction)}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.task.status.toLowerCase().trim() != Status.COMPLETED &&
            !(
              isCancelAction ||
              isCompleteAction ||
              isDispatchAction ||
              isReportAction
            ) && (
              <ClickActionButton
                icon={"assignment"}
                label="Assign"
                tooltipText={dict.action.dispatch}
                onClick={genBooleanClickHandler(setIsDispatchAction)}
                className="!bg-blue-300 hover:!bg-blue-500/80 dark:!bg-blue-800 dark:hover:!bg-blue-900/80"
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.task.status.toLowerCase().trim() != Status.COMPLETED &&
            !(
              isCancelAction ||
              isCompleteAction ||
              isDispatchAction ||
              isReportAction
            ) && (
              <ClickActionButton
                icon={"cancel"}
                label="Cancel"
                tooltipText={dict.action.cancel}
                onClick={genBooleanClickHandler(setIsCancelAction)}
                className="!bg-red-300 hover:!bg-red-500/80 dark:!bg-red-800 dark:hover:!bg-red-900/80"
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.reportTask) &&
            props.task.status.toLowerCase().trim() != Status.COMPLETED &&
            !(
              isCancelAction ||
              isCompleteAction ||
              isDispatchAction ||
              isReportAction
            ) && (
              <ClickActionButton
                icon={"report"}
                label="Report"
                tooltipText={dict.action.report}
                onClick={genBooleanClickHandler(setIsReportAction)}
                className="!bg-amber-300 hover:!bg-amber-500/80 dark:!bg-amber-800 dark:hover:!bg-amber-900/80"
              />
            )}
          {!response &&
            (isCancelAction ||
              isCompleteAction ||
              isDispatchAction ||
              isReportAction) && (
              <ClickActionButton
                icon={"send"}
                label="Submit"
                tooltipText={dict.action.submit}
                onClick={onSubmit}
              />
            )}
          {(isCancelAction ||
            isCompleteAction ||
            isDispatchAction ||
            isReportAction) && (
            <ClickActionButton
              icon={"first_page"}
              label="Return"
              tooltipText={dict.action.return}
              onClick={onReturnInAction}
              className="!bg-gray-300 hover:!bg-gray-400/80"
            />
          )}
        </div>
      </section>
    </Modal>
  );
}
