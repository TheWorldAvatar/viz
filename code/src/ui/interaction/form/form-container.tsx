"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";
import { PermissionScheme } from "types/auth";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FORM_IDENTIFIER, FormType, PropertyShape } from "types/form";
import { JsonObject } from "types/json";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { FormComponent } from "ui/interaction/form/form";
import Modal from "ui/interaction/modal/modal";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import { genBooleanClickHandler } from "utils/event-handler";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import RedirectButton from "../action/redirect/redirect-button";
import ReturnButton from "../action/redirect/return-button";
import Button from "../button";
import { ENTITY_STATUS, FORM_STATES, translateFormType } from "./form-utils";
import { FormTemplate } from "./template/form-template";

import { toast } from "../action/toast/toast";

interface FormContainerComponentProps {
  entityType: string;
  formType: FormType;
  isPrimaryEntity?: boolean;
  isModal?: boolean;
}

/**
 * Renders a form container.
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as add, update, delete, and view.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 * @param {boolean} isModal An optional indicator to render the form as a modal.
 */
export default function FormContainerComponent(
  props: Readonly<FormContainerComponentProps>
) {
  const [isOpen, setIsOpen] = React.useState<boolean>(props.isModal);

  if (props.isModal) {
    return (
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} returnPrevPage={true}>
        <FormContents {...props} />
      </Modal>
    );
  }

  return (
    <div className="relative flex flex-col w-[95vw] h-[80vh] sm:w-[95vw] sm:h-[85vh] md:h-[80vh] md:w-[95vw] lg:h-[85vh] xl:w-[50vw] xl:h-[85vh] mx-auto justify-between py-4 px-4 md:px-8 bg-zinc-100 dark:bg-modal-bg-dark border-1 shadow-2xl border-border rounded-xl mt-4  ">
      <FormContents {...props} />
    </div>
  );
}

function FormContents(props: Readonly<FormContainerComponentProps>) {
  const router = useRouter();
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();

  const [refreshFlag, triggerRefresh] = useRefresh();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRescindAction, setIsRescindAction] = useState<boolean>(false);
  const [isTerminateAction, setIsTerminateAction] = useState<boolean>(false);
  const [status, setStatus] = useState<AgentResponseBody>(null);
  const [response, setResponse] = useState<AgentResponseBody>(null);
  const [formFields, setFormFields] = useState<PropertyShape[]>([]);
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);

  const id: string = getAfterDelimiter(usePathname(), "/");

  // Rescind the target contract
  const rescindContract: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    await rescindOrTerminateAction(formData, "rescind");
  };

  // Terminate the target contract
  const terminateContract: SubmitHandler<FieldValues> = async (
    formData: FieldValues
  ) => {
    await rescindOrTerminateAction(formData, "terminate");
  };

  // Reusable action method to rescind or terminate the contract via internal proxy API route
  const rescindOrTerminateAction = async (
    formData: FieldValues,
    action: "rescind" | "terminate"
  ) => {
    // Add contract and date field
    const payload = {
      ...formData,
      [FORM_STATES.CONTRACT]: status?.data?.id,
      [FORM_STATES.DATE]: new Date().toISOString().split("T")[0],
    };
    const res = await fetch(
      makeInternalRegistryAPIwithParams("event", "archive", action),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ formData: payload }),
      }
    );
    const agentResponseBody: AgentResponseBody = await res.json();
    setResponse(agentResponseBody);
    toast(agentResponseBody?.data?.message || agentResponseBody?.error?.message,
      agentResponseBody?.error ? "error" : "success");
  };

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    const getFormTemplate = async (
      lifecycleStage: string,
      eventType: string
    ): Promise<void> => {
      setIsLoading(true);
      const res = await fetch(
        makeInternalRegistryAPIwithParams(
          "event",
          lifecycleStage,
          eventType,
          FORM_IDENTIFIER
        ),
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );
      const responseBody: AgentResponseBody = await res.json();
      const template: PropertyShape[] = (
        responseBody.data?.items as Record<string, unknown>[]
      )?.[0]?.property as PropertyShape[];
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
      contract: status?.data?.id,
      remarks: "Contract has been approved successfully!",
    };
    const res = await fetch(
      makeInternalRegistryAPIwithParams("event", "service", "commence"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ ...reqBody }),
      }
    );
    const customAgentResponse: AgentResponseBody = await res.json();
    toast(customAgentResponse?.data?.message || customAgentResponse?.error?.message,
      customAgentResponse?.error ? "error" : "success");
    setIsLoading(false);

    if (!customAgentResponse?.error) {
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
      if (!response?.error) {
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    }
  };

  useEffect(() => {
    // Declare an async function that retrieves the contract status for a view page
    const getContractStatus = async (): Promise<void> => {
      const res = await fetch(
        makeInternalRegistryAPIwithParams("contract_status", id),
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );
      const resBody: AgentResponseBody = await res.json();
      setStatus(resBody);
    };

    if (
      props.isPrimaryEntity &&
      !status &&
      (props.formType === "view" ||
        props.formType === "delete" ||
        props.formType === "edit")
    ) {
      getContractStatus();
    }
  }, []);

  return (
    <>
      <div className="text-xl font-bold">
        <span>{`${translateFormType(
          props.formType,
          dict
        ).toUpperCase()} ${parseWordsForLabels(props.entityType)
          .toUpperCase()
          .replace("_", " ")}`}</span>
      </div>
      <div className="overflow-y-auto overflow-x-hidden h-[75vh] w-full mx-auto md:p-6  ">
        {!(isRescindAction || isTerminateAction) &&
          (refreshFlag ? (
            <LoadingSpinner isSmall={false} />
          ) : (
            <FormComponent
              formRef={formRef}
              entityType={props.entityType}
              formType={props.formType}
              primaryInstance={status?.data?.id}
              isPrimaryEntity={props.isPrimaryEntity}
            />
          ))}
        {formFields.length > 0 && (
          <FormTemplate
            entityType={isRescindAction ? "rescission" : "termination"}
            formRef={formRef}
            fields={formFields}
            submitAction={isRescindAction ? rescindContract : terminateContract}
          />
        )}
      </div>
      <div className="flex justify-between p-2 ">
        {!formRef.current?.formState?.isSubmitting && !response && (
          <Button
            leftIcon="cached"
            variant="outline"
            tooltipText={dict.action.refresh}
            onClick={triggerRefresh}
            size="icon"
          />
        )}
        {formRef.current?.formState?.isSubmitting ||
          (isLoading && <LoadingSpinner isSmall={false} />)}
        <div className="flex flex-wrap gap-2 justify-end items-center ">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.formType === "view" &&
            !response &&
            status?.data?.message === ENTITY_STATUS.ACTIVE &&
            !(isRescindAction || isTerminateAction) && (
              <Button // Rescind Button
                leftIcon="error"
                label={dict.action.rescind}
                variant="secondary"
                className="mr-2"
                tooltipText={`${dict.action.rescind} ${props.entityType}`}
                onClick={genBooleanClickHandler(setIsRescindAction)}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.formType === "view" &&
            !response &&
            status?.data?.message === ENTITY_STATUS.ACTIVE &&
            !(isRescindAction || isTerminateAction) && (
              <Button // Terminate Button
                leftIcon="cancel"
                label={dict.action.cancel}
                variant="secondary"
                tooltipText={`${dict.action.cancel} ${props.entityType}`}
                onClick={genBooleanClickHandler(setIsTerminateAction)}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            props.formType === "view" &&
            !response &&
            status?.data?.message === ENTITY_STATUS.PENDING && (
              <Button // Approval button
                leftIcon="done_outline"
                label={dict.action.approve}
                tooltipText={dict.action.approve}
                onClick={onApproval}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            props.formType === "view" &&
            !response &&
            (status?.data?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <RedirectButton // Edit button
                leftIcon="edit"
                label={dict.action.edit}
                tooltipText={dict.action.edit}
                url={`../../edit/${props.entityType}/${id}`}
                variant="primary"
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            props.formType === "view" &&
            !response &&
            (status?.data?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <RedirectButton // Delete button
                leftIcon="delete"
                label={dict.action.delete}
                tooltipText={dict.action.delete}
                url={`../../delete/${props.entityType}/${id}`}
                variant="destructive"
              />
            )}
          {props.formType != "view" && !response && (
            <Button
              leftIcon="send"
              label={dict.action.submit}
              tooltipText={dict.action.submit}
              onClick={onSubmit}
            />
          )}
          {!response && (isRescindAction || isTerminateAction) && (
            <Button
              // Remove the rescind and terminate action view back to original view if no response
              leftIcon="first_page"
              variant="secondary"
              tooltipText={dict.action.cancel}
              onClick={() => {
                setIsRescindAction(false);
                setIsTerminateAction(false);
              }}
            />
          )}
          {!response && !(isRescindAction || isTerminateAction) && (
            <ReturnButton
              label={dict.action.return}
              leftIcon={"first_page"}
              className="ml-2"
              variant="secondary"
              tooltipText={dict.action.return}
            />
          )}
        </div>
      </div>
    </>
  );
}
