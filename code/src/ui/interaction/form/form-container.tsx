"use client";

import styles from "./form.module.css";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useDispatch } from "react-redux";

import useRefresh from "hooks/useRefresh";
import { Paths } from "io/config/routes";
import { setIsOpen } from "state/modal-slice";
import { FORM_IDENTIFIER, PropertyShape } from "types/form";
import { ApiResponse, JsonObject } from "types/json";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { FormComponent } from "ui/interaction/form/form";
import ResponseComponent from "ui/text/response/response";
import { getAfterDelimiter } from "utils/client-utils";
import { genBooleanClickHandler } from "utils/event-handler";
import {
  getLifecycleFormTemplate,
  HttpResponse,
  sendGetRequest,
  sendPostRequest,
} from "utils/server-actions";
import ClickActionButton from "../action/click/click-button";
import RedirectButton from "../action/redirect/redirect-button";
import ReturnButton from "../action/redirect/return-button";
import { ENTITY_STATUS, FORM_STATES, translateFormType } from "./form-utils";
import { FormTemplate } from "./template/form-template";
import { Dictionary } from "types/dictionary";
import { useDictionary } from "utils/dictionary/DictionaryContext";

interface FormContainerComponentProps {
  entityType: string;
  formType: string;
  agentApi: string;
  isPrimaryEntity?: boolean;
}

/**
 * Renders a form container page for entities.
 *
 * @param {string} entityType The type of entity.
 * @param {string} formType The type of form such as add, update, delete, and view.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 */
export default function FormContainerComponent(
  props: Readonly<FormContainerComponentProps>
) {
  const router = useRouter();
  const dispatch = useDispatch();
  const dict: Dictionary = useDictionary();

  const [refreshFlag, triggerRefresh] = useRefresh();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRescindAction, setIsRescindAction] = useState<boolean>(false);
  const [isTerminateAction, setIsTerminateAction] = useState<boolean>(false);
  const [status, setStatus] = useState<ApiResponse>(null);
  const [response, setResponse] = useState<HttpResponse>(null);
  const [formFields, setFormFields] = useState<PropertyShape[]>([]);
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);

  const id: string = getAfterDelimiter(usePathname(), "/");

  // Rescind the target contract
  const rescindContract: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    rescindOrTerminateAction(
      formData,
      `${props.agentApi}/contracts/archive/rescind`
    );
  };

  // Terminate the target contract
  const terminateContract: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    rescindOrTerminateAction(
      formData,
      `${props.agentApi}/contracts/archive/terminate`
    );
  };

  // Reusable action method to rescind or terminate the contract
  const rescindOrTerminateAction = async (
    formData: FieldValues,
    endpoint: string
  ) => {
    // Add contract and date field
    formData[FORM_STATES.CONTRACT] = status.iri;
    formData[FORM_STATES.DATE] = new Date().toISOString().split("T")[0];
    const response: HttpResponse = await sendPostRequest(
      endpoint,
      JSON.stringify(formData)
    );
    setResponse(response);
  };

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    const getFormTemplate = async (
      endpoint: string,
      lifecycleStage: string,
      eventType: string
    ): Promise<void> => {
      setIsLoading(true);
      const template: PropertyShape[] = await getLifecycleFormTemplate(
        endpoint,
        lifecycleStage,
        eventType,
        FORM_IDENTIFIER
      );
      setFormFields(template);
      setIsLoading(false);
    };

    if (isRescindAction) {
      getFormTemplate(props.agentApi, "archive", "rescind");
    } else if (isTerminateAction) {
      getFormTemplate(props.agentApi, "archive", "terminate");
    }
  }, [isRescindAction, isTerminateAction]);

  // Action when approve button is clicked
  const onApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsLoading(true);
    const reqBody: JsonObject = {
      contract: status.iri,
      remarks: "Contract has been approved successfully!",
    };
    const response: HttpResponse = await sendPostRequest(
      `${props.agentApi}/contracts/service/commence`,
      JSON.stringify(reqBody)
    );
    setResponse(response);
    setIsLoading(false);
    setTimeout(() => {
      dispatch(setIsOpen(false));
      router.back();
    }, 2000);
  };

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  useEffect(() => {
    // Declare an async function that retrieves the contract status for a view page
    const getContractStatus = async (): Promise<void> => {
      const response: string = await sendGetRequest(
        `${props.agentApi}/contracts/status/${id}`
      );
      setStatus(JSON.parse(response));
    };

    if (
      props.isPrimaryEntity &&
      !status &&
      (props.formType === Paths.REGISTRY ||
        props.formType === Paths.REGISTRY_DELETE ||
        props.formType === Paths.REGISTRY_EDIT)
    ) {
      getContractStatus();
    }
  }, []);

  return (
    <div className={styles["container"]}>
      <div className={`${styles["form-title"]} ${styles["form-row"]}`}>
        <ReturnButton
          icon="first_page"
        />
        <span>{`${translateFormType(props.formType, dict).toUpperCase()} ${props.entityType
          .toUpperCase()
          .replace("_", " ")}`}</span>
      </div>
      <div className={styles["form-contents"]}>
        {!(isRescindAction || isTerminateAction) &&
          (refreshFlag ? (
            <LoadingSpinner isSmall={false} />
          ) : (
            <FormComponent
              formRef={formRef}
              entityType={props.entityType}
              formType={props.formType}
              agentApi={props.agentApi}
              setResponse={setResponse}
              primaryInstance={status?.iri}
              isPrimaryEntity={props.isPrimaryEntity}
            />
          ))}
        {formFields.length > 0 && (
          <FormTemplate
            agentApi={props.agentApi}
            entityType={isRescindAction ? "rescission" : "termination"}
            formRef={formRef}
            fields={formFields}
            submitAction={isRescindAction ? rescindContract : terminateContract}
          />
        )}
      </div>
      <div className={styles["form-footer"]}>
        {!formRef.current?.formState?.isSubmitting && !response && (
          <ClickActionButton
            icon={"cached"}
            tooltipText={dict.action.refresh}
            onClick={triggerRefresh}
            isTransparent={true}
          />
        )}
        {formRef.current?.formState?.isSubmitting ||
          (isLoading && <LoadingSpinner isSmall={false} />)}
        {!formRef.current?.formState?.isSubmitting && response && (
          <ResponseComponent response={response} />
        )}
        <div className={styles["form-row"]}>
          {props.formType === Paths.REGISTRY &&
            !response &&
            status?.message === ENTITY_STATUS.ACTIVE &&
            !(isRescindAction || isTerminateAction) && (
              <ClickActionButton // Rescind Button
                icon={"error"}
                tooltipText={`${dict.action.rescind} ${props.entityType}`}
                onClick={genBooleanClickHandler(setIsRescindAction)}
              />
            )}
          {props.formType === Paths.REGISTRY &&
            !response &&
            status?.message === ENTITY_STATUS.ACTIVE &&
            !(isRescindAction || isTerminateAction) && (
              <ClickActionButton // Terminate Button
                icon={"cancel"}
                tooltipText={`${dict.action.cancel} ${props.entityType}`}
                onClick={genBooleanClickHandler(setIsTerminateAction)}
              />
            )}
          {props.formType === Paths.REGISTRY &&
            !response &&
            status?.message === ENTITY_STATUS.PENDING && (
              <ClickActionButton // Approval button
                icon={"done_outline"}
                tooltipText={dict.action.approve}
                onClick={onApproval}
              />
            )}
          {props.formType === Paths.REGISTRY &&
            !response &&
            (status?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <RedirectButton // Edit button
                icon="edit"
                tooltipText={dict.action.edit}
                url={`../../edit/${props.entityType}/${id}`}
                isActive={false}
              />
            )}
          {props.formType === Paths.REGISTRY &&
            !response &&
            (status?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <RedirectButton // Delete button
                icon="delete"
                tooltipText={dict.action.delete}
                url={`../../delete/${props.entityType}/${id}`}
                isActive={false}
              />
            )}
          {props.formType != Paths.REGISTRY && !response && <ClickActionButton
            icon="publish"
            tooltipText={dict.action.submit}
            onClick={onSubmit}
          />}
          {!response && (isRescindAction || isTerminateAction) ?
            <ClickActionButton
              // Remove the rescind and terminate action view back to original view if no response
              icon={"keyboard_return"}
              tooltipText={dict.action.cancel}
              onClick={() => {
                setIsRescindAction(false);
                setIsTerminateAction(false);
              }}
            /> : <ReturnButton
              icon="keyboard_return"
              tooltipText={dict.action.return}
            />}
        </div>
      </div>
    </div>
  );
}
