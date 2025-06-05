"use client";

import styles from "./form.module.css";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { usePermissionScheme } from 'hooks/auth/usePermissionScheme';
import { useDictionary } from 'hooks/useDictionary';
import useRefresh from "hooks/useRefresh";
import { PermissionScheme } from "types/auth";
import { CustomAgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FORM_IDENTIFIER, FormType, PropertyShape } from "types/form";
import { ApiResponse, JsonObject } from "types/json";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { FormComponent } from "ui/interaction/form/form";
import Modal from "ui/interaction/modal/modal";
import ResponseComponent from "ui/text/response/response";
import { getAfterDelimiter } from "utils/client-utils";
import { genBooleanClickHandler } from "utils/event-handler";
import InternalApiServices, { InternalApiIdentifier } from "utils/internal-api-services";
import ClickActionButton from "../action/click/click-button";
import RedirectButton from "../action/redirect/redirect-button";
import ReturnButton from "../action/redirect/return-button";
import { ENTITY_STATUS, FORM_STATES, translateFormType } from "./form-utils";
import { FormTemplate } from "./template/form-template";

interface FormContainerComponentProps {
  entityType: string;
  agentApi: string;
  formType: FormType;
  isPrimaryEntity?: boolean;
  isModal?: boolean;
}

/**
 * Renders a form container.
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as add, update, delete, and view.
 * @param {string} agentApi The target agent endpoint for any registry related functionalities.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 * @param {boolean} isModal An optional indicator to render the form as a modal.
 */
export default function FormContainerComponent(
  props: Readonly<FormContainerComponentProps>
) {
  const [isOpen, setIsOpen] = React.useState<boolean>(props.isModal);

  if (props.isModal) {
    return (<Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      returnPrevPage={true}
      styles={[styles["modal"]]}
    >
      <FormContents {...props} />
    </Modal>
    );
  }

  return (<div className={styles["container"]}>
    <ReturnButton
      icon={"close"}
      className={styles.close}
      styling={{ text: styles["close-text"] }}
    />
    <FormContents {...props} />
  </div>
  );
}

function FormContents(
  props: Readonly<FormContainerComponentProps>
) {
  const router = useRouter();
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === 'true';
  const permissionScheme: PermissionScheme = usePermissionScheme();

  const [refreshFlag, triggerRefresh] = useRefresh();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRescindAction, setIsRescindAction] = useState<boolean>(false);
  const [isTerminateAction, setIsTerminateAction] = useState<boolean>(false);
  const [status, setStatus] = useState<ApiResponse>(null);
  const [response, setResponse] = useState<CustomAgentResponseBody>(null);
  const [formFields, setFormFields] = useState<PropertyShape[]>([]);
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);

  const id: string = getAfterDelimiter(usePathname(), "/");

  // Rescind the target contract
  const rescindContract: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    await rescindOrTerminateAction(formData, "archive/rescind");
  };

  // Terminate the target contract
  const terminateContract: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    await rescindOrTerminateAction(formData, "archive/terminate");
  };

  // Reusable action method to rescind or terminate the contract via internal proxy API route
  const rescindOrTerminateAction = async (
    formData: FieldValues,
    action: "archive/rescind" | "archive/terminate"
  ) => {
    // Add contract and date field
    const payload = {
      ...formData,
      [FORM_STATES.CONTRACT]: status.iri,
      [FORM_STATES.DATE]: new Date().toISOString().split("T")[0],
    };
    const res = await fetch("/api/registry/contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        formData: payload,
      }),
    });
    const agentResponseBody: CustomAgentResponseBody = await res.json();
    setResponse(agentResponseBody);
  };

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    const getFormTemplate = async (
      lifecycleStage: string,
      eventType: string
    ): Promise<void> => {
      setIsLoading(true);
      const res = await fetch(InternalApiServices.getRegistryApi(InternalApiIdentifier.EVENT, lifecycleStage, eventType, FORM_IDENTIFIER), {
        cache: 'no-store',
        credentials: 'same-origin'
      });
      const template: PropertyShape[] = await res.json();
      setFormFields(template);
      setIsLoading(false);
    };

    if (isRescindAction) {
      getFormTemplate("archive", "rescind");
    } else if (isTerminateAction) {
      getFormTemplate("archive", "terminate");
    }
  }, [isRescindAction, isTerminateAction]);

  // Action when approve button is clicked
  const onApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    setIsLoading(true);
    const reqBody: JsonObject = {
      contract: status.iri,
      remarks: "Contract has been approved successfully!",
    };
    const res = await fetch("/api/registry/contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "service/commence",
        formData: reqBody,
      }),
    });
    const customAgentResponse: CustomAgentResponseBody = await res.json();
    setResponse(customAgentResponse);
    setIsLoading(false);
    setTimeout(() => {
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
      const params = new URLSearchParams({
        id,
      });
      const res = await fetch(`/api/registry/contract/status?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'same-origin'
      });
      const responseString = await res.text();
      setStatus(JSON.parse(responseString));
    };

    if (
      props.isPrimaryEntity &&
      !status &&
      (props.formType === FormType.VIEW ||
        props.formType === FormType.DELETE ||
        props.formType === FormType.EDIT)
    ) {
      getContractStatus();
    }
  }, []);

  return (
    <>
      <div className={`${styles["form-title"]} ${styles["form-row"]}`}>
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
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.operation) &&
            props.formType === FormType.VIEW &&
            !response && status?.message === ENTITY_STATUS.ACTIVE &&
            !(isRescindAction || isTerminateAction) && (
              <ClickActionButton // Rescind Button
                icon={"error"}
                tooltipText={`${dict.action.rescind} ${props.entityType}`}
                onClick={genBooleanClickHandler(setIsRescindAction)}
              />
            )}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.operation) &&
            props.formType === FormType.VIEW &&
            !response &&
            status?.message === ENTITY_STATUS.ACTIVE &&
            !(isRescindAction || isTerminateAction) && (
              <ClickActionButton // Terminate Button
                icon={"cancel"}
                tooltipText={`${dict.action.cancel} ${props.entityType}`}
                onClick={genBooleanClickHandler(setIsTerminateAction)}
              />
            )}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.sales) &&
            props.formType === FormType.VIEW &&
            !response &&
            status?.message === ENTITY_STATUS.PENDING && (
              <ClickActionButton // Approval button
                icon={"done_outline"}
                tooltipText={dict.action.approve}
                onClick={onApproval}
              />
            )}
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.sales) &&
            props.formType === FormType.VIEW &&
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
          {(!keycloakEnabled || !permissionScheme || permissionScheme.hasPermissions.sales) &&
            props.formType === FormType.VIEW &&
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
          {props.formType != FormType.VIEW && !response && <ClickActionButton
            icon="publish"
            tooltipText={dict.action.submit}
            onClick={onSubmit}
          />}
          {!response && (isRescindAction || isTerminateAction) &&
            <ClickActionButton
              // Remove the rescind and terminate action view back to original view if no response
              icon={"first_page"}
              tooltipText={dict.action.cancel}
              onClick={() => {
                setIsRescindAction(false);
                setIsTerminateAction(false);
              }}
            />}
          {!response && !(isRescindAction || isTerminateAction) &&
            <ReturnButton
              icon="first_page"
              tooltipText={dict.action.return}
            />}
        </div>
      </div>
    </>
  );
}
