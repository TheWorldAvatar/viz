"use client";
import styles from './task.modal.module.css';

import React, { useEffect, useRef, useState } from 'react';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import Modal from 'react-modal';

import useRefresh from 'hooks/useRefresh';
import { Paths } from 'io/config/routes';
import { FORM_IDENTIFIER, PropertyGroup, PropertyShape, PropertyShapeOrGroup, RegistryTaskOption, VALUE_KEY } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import ClickActionButton from 'ui/interaction/action/click/click-button';
import { FormComponent } from 'ui/interaction/form/form';
import { FORM_STATES } from 'ui/interaction/form/form-utils';
import { FormTemplate } from 'ui/interaction/form/template/form-template';
import ResponseComponent from 'ui/text/response/response';
import { Status } from 'ui/text/status/status';
import { getAfterDelimiter } from 'utils/client-utils';
import { genBooleanClickHandler } from 'utils/event-handler';
import { getLifecycleFormTemplate, HttpResponse, sendPostRequest, updateEntity } from 'utils/server-actions';

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
  Modal.setAppElement("#globalContainer");

  const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // Form actions
  const [isDispatchAction, setIsDispatchAction] = useState<boolean>(false);
  const [isCompleteAction, setIsCompleteAction] = useState<boolean>(false);
  const [isCancelAction, setIsCancelAction] = useState<boolean>(false);
  const [isReportAction, setIsReportAction] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);
  const [dispatchFields, setDispatchFields] = useState<PropertyShapeOrGroup[]>([]);
  const [response, setResponse] = useState<HttpResponse>(null);

  const [refreshFlag, triggerRefresh] = useRefresh();

  // Closes the modal on click
  const onClose: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.setIsOpen(false);
    props.setTask(null);
    setIsDispatchAction(false);
    setIsCompleteAction(false);
    setIsCancelAction(false);
    setIsReportAction(false);
    setFormFields([]);
    setDispatchFields([]);
    setResponse(null);
  };

  // Return back to the non-action page
  const onReturnInAction: React.MouseEventHandler<HTMLButtonElement> = () => {
    setIsDispatchAction(false);
    setIsCompleteAction(false);
    setIsCancelAction(false);
    setIsReportAction(false);
    setFormFields([]);
  };

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const taskSubmitAction: SubmitHandler<FieldValues> = async (formData: FieldValues) => {
    formData[FORM_STATES.ORDER] = props.task.id;
    let url = `${props.registryAgentApi}/contracts/service/`;
    if (isReportAction) {
      url += "report";
    } else if (isCancelAction) {
      url += "cancel";
    } else if (isCompleteAction) {
      url += "complete";
    } else if (isDispatchAction) {
      url += "dispatch";
    } else {
      return;
    }
    // Submit post requests if they are not dispatch action
    submitLifecycleAction(formData, url, !isDispatchAction);
  }

  // Reusable action method to report, cancel, dispatch, or complete the service task
  const submitLifecycleAction = async (formData: FieldValues, endpoint: string, isPost: boolean) => {
    // Remove last item in any field array before submission
    for (const key in formData) {
      const field = formData[key];
      if (Array.isArray(field)) {
        field.pop();
      }
    }

    // Add contract and date field
    formData[FORM_STATES.CONTRACT] = props.task.contract;
    formData[FORM_STATES.DATE] = props.task.date;
    let response: HttpResponse;
    if (isPost) {
      response = await sendPostRequest(endpoint, JSON.stringify(formData));
    } else {
      response = await updateEntity(endpoint, JSON.stringify(formData));
    }
    setResponse(response);
    setFormFields([]);
    setDispatchFields([]);
  }

  // A hook that fetches the form template with dispatch details included
  useEffect(() => {
    // Declare an async function to retrieve the form template with dispatch details
    const getFormTemplateWithDispatchDetails = async (endpoint: string, targetId: string): Promise<void> => {
      setIsFetching(true);
      const id: string = getAfterDelimiter(targetId, "/");
      const template: PropertyShape[] = await getLifecycleFormTemplate(endpoint, "service", "dispatch", id);
      const group: PropertyGroup = {
        "@id": "dispatch group",
        "@type": "http://www.w3.org/ns/shacl#PropertyGroup",
        label: {
          "@value": "dispatch information"
        },
        comment: {
          "@value": "The dispatch details specified for this service."
        },
        order: 1000,
        property: template.filter(shape => shape.name[VALUE_KEY] != "id"), // Filter out id field
      };
      setDispatchFields([group]);
      setIsFetching(false);
    }
    // Only execute this for orders that are pending execution
    if (props.task.status === Status.PENDING_EXECUTION || props.task.status === Status.COMPLETED) {
      getFormTemplateWithDispatchDetails(props.registryAgentApi, props.task.id);
    }
  }, []);

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    // Target id is optional, and will default to form
    const getFormTemplate = async (endpoint: string, lifecycleStage: string, eventType: string, targetId?: string): Promise<void> => {
      setIsFetching(true);
      const template: PropertyShapeOrGroup[] = await getLifecycleFormTemplate(endpoint, lifecycleStage, eventType,
        targetId ? getAfterDelimiter(targetId, "/") : FORM_IDENTIFIER // use the target id if available, else, default to an empty form
      );
      setFormFields(template);
      setIsFetching(false);
    }

    if (isDispatchAction) {
      getFormTemplate(props.registryAgentApi, "service", "dispatch", props.task.id);
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

  return (
    <Modal
      isOpen={props.isOpen}
      overlayClassName={styles.overlay}
      className={styles.modal}
    >
      <div className={styles.container}>
        <section className={styles["section-title"]}>
          <h1>ACTIONS</h1>
          <h2>{props.task.date}: {props.task.status}</h2>
        </section>
        <section className={styles["section-contents"]}>
          {!isFetching && <p className={styles["instructions"]}>
            {isCompleteAction && <>To complete the service, please input the following details:</>}
            {isDispatchAction && <>Dispatch the resources for the scheduled service on {props.task.date}:</>}
            {isCancelAction && <>Cancel the scheduled service on {props.task.date}. <br /> Please provide a reason for the cancellation:</>}
            {isReportAction && <>Report an issue with the service on {props.task.date}. <br /> Please include the reason in your report:</>}
          </p>}
          {isFetching || refreshFlag && <LoadingSpinner isSmall={false} />}
          {!(isReportAction || isCancelAction || isCompleteAction || isDispatchAction || isFetching) && !refreshFlag && <FormComponent
            formRef={formRef}
            entityType={props.entityType}
            formType={Paths.REGISTRY}
            agentApi={props.registryAgentApi}
            setResponse={setResponse}
            id={getAfterDelimiter(props.task.contract, "/")}
            additionalFields={dispatchFields}
          />}
          {formFields.length > 0 && !refreshFlag && <FormTemplate
            agentApi={props.registryAgentApi}
            entityType={isReportAction ? "report" : isCancelAction ? "cancellation" : "dispatch"}
            formRef={formRef}
            fields={formFields}
            submitAction={taskSubmitAction}
          />}
        </section>
        <section className={styles["section-footer"]}>
          {!formRef.current?.formState?.isSubmitting && !response && (
            <ClickActionButton
              icon={"cached"}
              onClick={triggerRefresh}
              isTransparent={true}
            />
          )}
          {formRef.current?.formState?.isSubmitting && <LoadingSpinner isSmall={false} />}
          {!formRef.current?.formState?.isSubmitting && (<ResponseComponent response={response} />)}
          <div className={styles["footer-button-row"]}>
            {props.task.status.toLowerCase().trim() == Status.PENDING_EXECUTION &&
              !(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ClickActionButton
                icon={"done_outline"}
                tooltipText="Complete"
                onClick={genBooleanClickHandler(setIsCompleteAction)}
              />}
            {props.task.status.toLowerCase().trim() != Status.COMPLETED &&
              !(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ClickActionButton
                icon={"assignment"}
                tooltipText="Assign"
                onClick={genBooleanClickHandler(setIsDispatchAction)}
              />}
            {props.task.status.toLowerCase().trim() != Status.COMPLETED &&
              !(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ClickActionButton
                icon={"cancel"}
                tooltipText="Cancel"
                onClick={genBooleanClickHandler(setIsCancelAction)}
              />}
            {props.task.status.toLowerCase().trim() != Status.COMPLETED &&
              !(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ClickActionButton
                icon={"report"}
                tooltipText="Report"
                onClick={genBooleanClickHandler(setIsReportAction)}
              />}
            {(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ClickActionButton
              icon={"publish"}
              tooltipText="Submit"
              onClick={onSubmit}
            />}
            <ClickActionButton
              icon={"keyboard_return"}
              tooltipText="Return"
              // Closes the modal if there is a response in any action
              onClick={!response && (isCancelAction || isCompleteAction || isDispatchAction || isReportAction) ?
                onReturnInAction : onClose}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}