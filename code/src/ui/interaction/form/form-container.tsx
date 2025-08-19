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
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import { genBooleanClickHandler } from "utils/event-handler";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import RedirectButton from "../action/redirect/redirect-button";
import Button from "../button";
import Drawer from "../drawer/drawer";
import { ENTITY_STATUS, FORM_STATES, translateFormType } from "./form-utils";
import { FormTemplate } from "./template/form-template";

import { Routes } from "io/config/routes";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentEntityType, setCurrentEntityType } from "state/registry-slice";
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
  if (props.isModal) {
    const router = useRouter();
    const dispatch = useDispatch();
    const currentEntityType: string = useSelector(getCurrentEntityType);
    return (
      <Drawer
        onClose={() => {
          if (currentEntityType != "") {
            dispatch(setCurrentEntityType(""));
            router.push(`${Routes.REGISTRY_GENERAL}/${currentEntityType}`)
          }
        }}>
        <FormContents {...props} />
      </Drawer>
    );
  }

  return (
    <div className=" flex flex-col w-full h-full mt-0  xl:w-[50vw] xl:h-[85vh] mx-auto justify-between py-4 px-4 md:px-8 bg-muted xl:border-1 xl:shadow-2xl xl:border-border xl:rounded-xl xl:mt-4  ">
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
    toast(
      agentResponseBody?.data?.message || agentResponseBody?.error?.message,
      agentResponseBody?.error ? "error" : "success"
    );
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
    toast(
      customAgentResponse?.data?.message || customAgentResponse?.error?.message,
      customAgentResponse?.error ? "error" : "success"
    );
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
      <section
        className={`flex justify-between items-center text-nowrap text-foreground p-1 ${!props.isModal ? "mt-0" : "mt-10"
          }  mb-0.5  shrink-0`}
      >
        <h1 className="text-xl font-bold">{`${translateFormType(
          props.formType,
          dict
        ).toUpperCase()} ${parseWordsForLabels(props.entityType)
          .toUpperCase()
          .replace("_", " ")}`}</h1>
      </section>
      <div className="overflow-y-auto overflow-x-hidden md:p-3 p-1 flex-1 min-h-0">
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

      <section className="flex items-start 2xl:items-center justify-between p-2  sticky bottom-0 shrink-0 mb-2.5 mt-2.5  2xl:mb-4 2xl:mt-4">
        {!formRef.current?.formState?.isSubmitting && (
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
        <div className="flex flex-wrap gap-2.5 2xl:gap-2 justify-end items-center ">
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.operation) &&
            props.formType === "view" &&
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
            (status?.data?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <RedirectButton // Delete button
                leftIcon="delete"
                iconSize="medium"
                label={dict.action.delete}
                tooltipText={dict.action.delete}
                url={`../../delete/${props.entityType}/${id}`}
                variant="secondary"
              />
            )}
          {props.formType != "view" && (
            <Button
              leftIcon="send"
              label={dict.action.submit}
              tooltipText={dict.action.submit}
              onClick={onSubmit}
            />
          )}
          {isRescindAction ||
            (isTerminateAction && (
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
            ))}
        </div>
      </section>
    </>
  );
}
