"use client";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormType, FormTypeMap } from "types/form";
import { JsonObject } from "types/json";
import { FormComponent } from "ui/interaction/form/form";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import { FormSessionContextProvider } from "utils/form/FormSessionContext";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { toast } from "../action/toast/toast";
import Button from "../button";
import NavigationDrawer from "../drawer/navigation-drawer";
import { ENTITY_STATUS, translateFormType } from "./form-utils";
import FormSkeleton from "./skeleton/form-skeleton";

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
    <FormSessionContextProvider entityType={props.entityType}>
      <NavigationDrawer>
        <FormContents {...props} />
      </NavigationDrawer>
    </FormSessionContextProvider>
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
    <FormSessionContextProvider entityType={props.entityType}>
      <div className=" flex flex-col w-full h-full mt-0  xl:w-[50vw] xl:h-[85vh] mx-auto justify-between py-4 px-4 md:px-8 bg-muted xl:border-1 xl:shadow-lg xl:border-border xl:rounded-xl xl:mt-4  ">
        <FormContents {...props} />
      </div>
    </FormSessionContextProvider>
  );
}

function FormContents(props: Readonly<FormContainerComponentProps>) {
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const isPermitted = usePermissionGuard();
  const { navigateToDrawer, handleDrawerClose } = useDrawerNavigation();

  const { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading } = useOperationStatus();

  const [status, setStatus] = useState<AgentResponseBody>(null);
  const formRef: React.RefObject<HTMLFormElement> =
    useRef<HTMLFormElement>(null);

  const id: string = getAfterDelimiter(usePathname(), "/");

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
        ).toUpperCase()} ${parseWordsForLabels(props.entityType)
          .toUpperCase()
          .replace("_", " ")}`}</h1>
      </section>
      <div className="overflow-y-auto overflow-x-hidden md:p-3 p-1 flex-1 min-h-0">
        {refreshFlag ? <FormSkeleton /> :
          (<FormComponent
            formRef={formRef}
            entityType={props.entityType}
            formType={props.formType}
            primaryInstance={status?.data?.id}
            isPrimaryEntity={props.isPrimaryEntity}
            accountType={props.accountType}
            pricingType={props.pricingType}
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
          {isPermitted("registryFullAccess") &&
            props.formType === FormTypeMap.VIEW &&
            status?.data?.message === ENTITY_STATUS.ACTIVE && (
              <Button
                variant="secondary"
                leftIcon="block"
                className="mr-2"
                tooltipText={`${dict.action.rescind} ${props.entityType}`}
                disabled={isLoading}
                label={dict.action.terminate}
                onClick={() => {
                  navigateToDrawer(Routes.REGISTRY_TERMINATE, props.entityType, id);
                }}
              />
            )}
          {isPermitted("registryFullAccess") &&
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
          {isPermitted("edit") &&
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
          {isPermitted("delete") &&
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
        </div>
      </section>
    </ >
  );
}
