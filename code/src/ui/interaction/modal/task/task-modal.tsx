"use client";
import styles from './task.modal.module.css';

import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { FieldValues, SubmitHandler } from 'react-hook-form';

import { Paths } from 'io/config/routes';
import { FORM_IDENTIFIER, PropertyGroup, PropertyShape, PropertyShapeOrGroup, RegistryTaskOption, VALUE_KEY } from 'types/form';
import MaterialIconButton from 'ui/graphic/icon/icon-button';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import ActionButton from 'ui/interaction/action/action';
import ResponseComponent from 'ui/text/response/response';
import { FormComponent } from 'ui/interaction/form/form';
import { FormTemplate } from 'ui/interaction/form/template/form-template';
import { FORM_STATES } from 'ui/interaction/form/form-utils';
import { getAfterDelimiter } from 'utils/client-utils';
import { genBooleanClickHandler } from 'utils/event-handler';
import { getLifecycleFormTemplate, HttpResponse, sendPostRequest, updateEntity } from 'utils/server-actions';

interface TaskModalProps {
  entityType: string;
  date: string;
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
 * @param {string} date The selected date.
 * @param {string} registryAgentApi The target endpoint for the default registry agent.
 * @param {boolean} isOpen Indicator if the this modal should be opened.
 * @param {RegistryTaskOption} task The current task to display.
 * @param setIsOpen Method to close or open the modal.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function TaskModal(props: Readonly<TaskModalProps>) {
  Modal.setAppElement("#globalContainer");

  const formRef: React.MutableRefObject<HTMLFormElement> = useRef<HTMLFormElement>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // Form actions
  const [isDispatchAction, setIsDispatchAction] = useState<boolean>(false);
  const [isCompleteAction, setIsCompleteAction] = useState<boolean>(false);
  const [isCancelAction, setIsCancelAction] = useState<boolean>(false);
  const [isReportAction, setIsReportAction] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<PropertyShapeOrGroup[]>([]);
  const [dispatchFields, setDispatchFields] = useState<PropertyShapeOrGroup[]>([]);
  const [response, setResponse] = useState<HttpResponse>(null);

  // Closes the modal on click
  const onClose: React.MouseEventHandler<HTMLDivElement> = () => {
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

  // Assign dispatch details
  const assignDispatch: SubmitHandler<FieldValues> = async (formData: FieldValues) => {
    formData[FORM_STATES.ORDER] = props.task.id;
    submitLifecycleAction(formData, `${props.registryAgentApi}/contracts/service/dispatch`, false);
  }

  // Submit a completion request
  const completeTask: SubmitHandler<FieldValues> = async (formData: FieldValues) => {
    submitLifecycleAction({
      dispatch: props.task.id,
      ...formData
    }, `${props.registryAgentApi}/contracts/service/complete`, true);
  }

  // Lodges a new report
  const reportTask: SubmitHandler<FieldValues> = async (formData: FieldValues) => {
    submitLifecycleAction(formData, `${props.registryAgentApi}/contracts/service/report`, true);
  }

  // Cancel a scheduled service
  const cancelTask: SubmitHandler<FieldValues> = async (formData: FieldValues) => {
    submitLifecycleAction(formData, `${props.registryAgentApi}/contracts/service/cancel`, true);
  }

  // Reusable action method to report or cancel the service task
  const submitLifecycleAction = async (formData: FieldValues, endpoint: string, isPost: boolean) => {
    // Add contract and date field
    formData[FORM_STATES.CONTRACT] = props.task.contract;
    formData[FORM_STATES.DATE] = props.date;
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
    // Only execute this for orders that are pending execution or completed
    if (props.task.status === "pending execution" || props.task.status === "completed") {
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

  const onSubmit: React.MouseEventHandler<HTMLDivElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

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
          <h2>{props.date}: {props.task.status}</h2>
        </section>
        <section className={styles["section-contents"]}>
          {isFetching && <LoadingSpinner isSmall={false} />}
          {!(isReportAction || isCancelAction || isCompleteAction || isDispatchAction || isFetching) && <FormComponent
            formRef={formRef}
            entityType={props.entityType}
            formType={Paths.REGISTRY}
            agentApi={props.registryAgentApi}
            setResponse={setResponse}
            id={getAfterDelimiter(props.task.contract, "/")}
            additionalFields={dispatchFields}
          />}
          {!isFetching && <p className={styles["instructions"]}>
            {isCompleteAction && <>To complete the service, please input the following details:</>}
            {isDispatchAction && <>Dispatch the resources for the scheduled service on {props.date}:</>}
            {isCancelAction && <>Cancel the scheduled service on {props.date}. <br /> Please provide a reason for the cancellation:</>}
            {isReportAction && <>Report an issue with the service on {props.date}. <br /> Please include the reason in your report:</>}
          </p>}
          {formFields.length > 0 && <FormTemplate
            agentApi={props.registryAgentApi}
            entityType={isReportAction ? "report" : isCancelAction ? "cancellation" : "dispatch"}
            formRef={formRef}
            fields={formFields}
            submitAction={isReportAction ? reportTask : isCancelAction ? cancelTask : isCompleteAction ? completeTask : assignDispatch}
          />}
        </section>
        <section className={styles["section-footer"]}>
          {formRef.current?.formState?.isSubmitting && <LoadingSpinner isSmall={false} />}
          {!formRef.current?.formState?.isSubmitting && (<ResponseComponent response={response} />)}
          <div className={styles["footer-button-row"]}>
            {props.task.status.toLowerCase().trim() == "pending execution" &&
              !(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) &&
              <ActionButton
                icon={"done_outline"}
                title={"COMPLETE"}
                onClick={genBooleanClickHandler(setIsCompleteAction)}
              />}
            {!(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ActionButton
              icon={"assignment"}
              title={"ASSIGN"}
              onClick={genBooleanClickHandler(setIsDispatchAction)}
            />}
            {!(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ActionButton
              icon={"cancel"}
              title={"CANCEL"}
              onClick={genBooleanClickHandler(setIsCancelAction)}
            />}
            {!(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <ActionButton
              icon={"report"}
              title={"REPORT"}
              onClick={genBooleanClickHandler(setIsReportAction)}
            />}
            <MaterialIconButton
              iconName={"keyboard_return"}
              className={styles["section-footer-button"]}
              iconStyles={[styles["icon"]]}
              text={{
                styles: [styles["button-text"]],
                content: "RETURN"
              }}
              onClick={onClose}
            />
            {(isCancelAction || isCompleteAction || isDispatchAction || isReportAction) && <MaterialIconButton
              iconName={"publish"}
              className={styles["section-footer-button"]}
              iconStyles={[styles["icon"]]}
              text={{
                styles: [styles["button-text"]],
                content: "SUBMIT"
              }}
              onClick={onSubmit}
            />}
          </div>
        </section>
      </div>
    </Modal>
  );
}