"use client";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FORM_IDENTIFIER, FormType, FormTypeMap, PropertyShape } from "types/form";
import { JsonObject } from "types/json";
import { FormComponent } from "ui/interaction/form/form";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import { genBooleanClickHandler } from "utils/event-handler";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { toast } from "../action/toast/toast";
import Button from "../button";
import NavigationDrawer from "../drawer/navigation-drawer";
import { ENTITY_STATUS, translateFormType } from "./form-utils";
import FormSkeleton from "./skeleton/form-skeleton";
import { FormTemplate } from "./template/form-template";

interface FormContainerComponentProps {
  entityType: string;
  formType: FormType;
  accountType?: string;
  pricingType?: string;
  isPrimaryEntity?: boolean;
}

/**
 * Renders a form container for intercept routes.
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as add, update, delete, and view.
 * @param {string} accountType Optionally indicates the type of account.
 * @param {string} pricingType Optionally indicates the type of pricing.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 */
export function InterceptFormContainerComponent(
  props: Readonly<FormContainerComponentProps>
) {
  return (
    <NavigationDrawer>
      <FormContents {...props} />
    </NavigationDrawer>
  );
}

/**
 * Renders a form container.
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as add, update, delete, and view.
 * @param {string} accountType Optionally indicates the type of account.
 * @param {string} pricingType Optionally indicates the type of pricing.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 */
export function FormContainerComponent(
  props: Readonly<FormContainerComponentProps>
) {
  return (
    <div className=" flex flex-col w-full h-full mt-0  xl:w-[50vw] xl:h-[85vh] mx-auto justify-between py-4 px-4 md:px-8 bg-muted xl:border-1 xl:shadow-lg xl:border-border xl:rounded-xl xl:mt-4  ">
      <FormContents {...props} />
    </div>
  );
}

function FormContents(props: Readonly<FormContainerComponentProps>) {
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const isPermitted = usePermissionGuard();
  const { navigateToDrawer, handleDrawerClose } = useDrawerNavigation();

  const { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading } = useOperationStatus();
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
    startLoading();
    // Get contract ID from either the terminate form type or status data
    const contractId = props.formType === "terminate" ? id : status?.data?.id;

    const payload = {
      ...formData,
      type: props.entityType,
      contract: contractId,
    };

    const agentResponseBody: AgentResponseBody = await queryInternalApi(
      makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "archive", action),
      "POST",
      JSON.stringify(payload)
    );
    stopLoading();
    toast(
      agentResponseBody?.data?.message || agentResponseBody?.error?.message,
      agentResponseBody?.error ? "error" : "success"
    );

    if (!agentResponseBody?.error) {
      handleDrawerClose(() => {
        router.back();
      });
    }
  };

  // A hook that fetches the form template for executing an action
  useEffect(() => {
    // Declare an async function to retrieve the form template for executing the target action
    const getFormTemplate = async (
      lifecycleStage: string,
      eventType: string
    ): Promise<void> => {
      const responseBody: AgentResponseBody = await queryInternalApi(
        makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT,
          lifecycleStage,
          eventType,
          FORM_IDENTIFIER
        )
      );
      const template: PropertyShape[] = (
        responseBody.data?.items as Record<string, unknown>[]
      )?.[0]?.property as PropertyShape[];
      setFormFields(template);
    };

    if (isRescindAction) {
      getFormTemplate("archive", "rescind");
    } else if (isTerminateAction) {
      getFormTemplate("archive", "terminate");
    } else if (props.formType === "terminate") {
      getFormTemplate("archive", "terminate");
    }
  }, [isRescindAction, isTerminateAction, props.formType]);

  // Action when approve button is clicked
  const onApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    startLoading();
    const reqBody: JsonObject = {
      contract: id,
      remarks: "Contract has been approved successfully!",
    };
    const customAgentResponse: AgentResponseBody = await queryInternalApi(
      makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", "commence"),
      "POST",
      JSON.stringify(reqBody)
    );
    stopLoading();
    toast(
      customAgentResponse?.data?.message || customAgentResponse?.error?.message,
      customAgentResponse?.error ? "error" : "success"
    );

    if (!customAgentResponse?.error) {
      handleDrawerClose(() => {
        router.back();
      });
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
      const resBody: AgentResponseBody = await queryInternalApi(
        makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.CONTRACT_STATUS, id)
      );
      setStatus(resBody);
    };

    if (
      props.isPrimaryEntity &&
      !status &&
      (props.formType === FormTypeMap.VIEW ||
        props.formType === FormTypeMap.DELETE ||
        props.formType === FormTypeMap.EDIT)
    ) {
      getContractStatus();
    }
  }, []);

  return (
    <>
      <section
        className={`flex justify-between items-center text-foreground p-1 mt-5 mb-0.5  shrink-0`}
      >
        <h1 className="text-xl font-bold">{`${translateFormType(
          props.formType,
          dict
        ).toUpperCase()} ${props.formType == FormTypeMap.ADD_INVOICE ? "" : parseWordsForLabels(props.entityType)
          .toUpperCase()
          .replace("_", " ")}`}</h1>
      </section>
      <div className="overflow-y-auto overflow-x-hidden md:p-3 p-1 flex-1 min-h-0">
        {!(isRescindAction || isTerminateAction || props.formType === "terminate") &&
          (refreshFlag ? (
            <FormSkeleton />
          ) : (
            <FormComponent
              formRef={formRef}
              entityType={props.entityType}
              formType={props.formType}
              primaryInstance={status?.data?.id}
              isPrimaryEntity={props.isPrimaryEntity}
              accountType={props.accountType}
              pricingType={props.pricingType}
            />
          ))}
        {formFields && formFields.length > 0 && (
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
            disabled={isLoading}
            tooltipText={dict.action.refresh}
            onClick={triggerRefresh}
            size="icon"
          />
        )}
        <div className="flex flex-wrap gap-2.5 2xl:gap-2 justify-end items-center ">
          {isPermitted("operation") &&
            props.formType === FormTypeMap.VIEW &&
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
          {isPermitted("operation") &&
            props.formType === FormTypeMap.VIEW &&
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
          {isPermitted("sales") &&
            props.formType === FormTypeMap.VIEW &&
            status?.data?.message === ENTITY_STATUS.PENDING && (
              <Button // Approval button
                leftIcon="done_outline"
                label={dict.action.approve}
                disabled={isLoading}
                loading={isLoading}
                tooltipText={dict.action.approve}
                onClick={onApproval}
              />
            )}
          {isPermitted("sales") &&
            props.formType === FormTypeMap.VIEW &&
            (status?.data?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <Button // Edit button
                leftIcon="edit"
                label={dict.action.edit}
                disabled={isLoading}
                tooltipText={dict.action.edit}
                onClick={() => navigateToDrawer(`../../edit/${props.entityType}/${id}`)}
                variant="secondary"
              />
            )}
          {isPermitted("sales") &&
            props.formType === FormTypeMap.VIEW &&
            (status?.data?.message === ENTITY_STATUS.PENDING ||
              !props.isPrimaryEntity) && (
              <Button // Delete button
                leftIcon="delete"
                iconSize="medium"
                label={dict.action.delete}
                disabled={isLoading}
                tooltipText={dict.action.delete}
                onClick={() => navigateToDrawer(`../../delete/${props.entityType}/${id}`)}
                variant="secondary"
              />
            )}
          {props.formType != FormTypeMap.VIEW && (
            <Button
              leftIcon="send"
              label={dict.action.submit}
              tooltipText={dict.action.submit}
              loading={isLoading}
              disabled={isLoading}
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
