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
import { FormType, FormTypeMap, LifecycleStageMap } from "types/form";
import { JsonObject } from "types/json";
import { FormComponent } from "ui/interaction/form/form";
import { getAfterDelimiter, getInitialDateFromLifecycleStage, parseWordsForLabels } from "utils/client-utils";
import { FormSessionContextProvider } from "utils/form/FormSessionContext";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { toast } from "../action/toast/toast";
import Button from "../button";
import { ENTITY_STATUS, translateFormType } from "./form-utils";
import FormSkeleton from "./skeleton/form-skeleton";
import { DateRange } from "react-day-picker";
import { TableColumnOrderSettings } from "types/settings";
import { TableDescriptor, useTable } from "hooks/table/useTable";
import RegistryTable from "ui/graphic/table/registry/registry-table";
import TableSkeleton from "ui/graphic/table/skeleton/table-skeleton";

interface FormContainerComponentProps {
    entityType: string;
    formType: FormType;
    accountType?: string;
    pricingType?: string;
    isPrimaryEntity?: boolean;
    registryEntityType: string;
    tableColumnOrder: TableColumnOrderSettings;
}

/**
 * Renders a form container.
 *
 * @param {string} entityType The type of entity.
 * @param {FormType} formType The type of form such as add, update, delete, and view.
 * @param {string} accountType Optionally indicates the type of account.
 * @param {string} pricingType Optionally indicates the type of pricing.
 * @param {boolean} isPrimaryEntity An optional indicator if the form is targeting a primary entity.
 * @param {string} registryEntityType The type of registry entity to display in the registry table.
 * @param {TableColumnOrderSettings} tableColumnOrder The column order settings for the registry table.
 */
export default function AddInvoiceComponent(
    props: Readonly<FormContainerComponentProps>
) {
    return (
        <FormSessionContextProvider entityType={props.entityType}>
            <div className=" flex flex-col w-full h-full mt-0 xl:w-[80vw] xl:h-[85vh] mx-auto py-4 px-4 md:px-8 bg-muted xl:mt-4">
                <FormContents {...props} />
            </div>
        </FormSessionContextProvider>
    );
}

function FormContents(props: Readonly<FormContainerComponentProps>) {
    const dict: Dictionary = useDictionary();
    const { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading } = useOperationStatus();
    const [status, setStatus] = useState<AgentResponseBody>(null);

    const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
    const [selectedDate] = useState<DateRange>(getInitialDateFromLifecycleStage(LifecycleStageMap.CLOSED));

    const tableDescriptor: TableDescriptor = useTable(
        props.registryEntityType,
        refreshFlag,
        LifecycleStageMap.CLOSED,
        selectedDate,
        props.tableColumnOrder,
    );

    const id: string = getAfterDelimiter(usePathname(), "/");


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
            <section className={`flex justify-between items-center text-foreground p-1 mt-5 mb-0.5  shrink-0`}>
                <h1 className="text-xl font-bold">{`${translateFormType(props.formType, dict).toUpperCase()}`}</h1>
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
            <section>
                <h2 className="text-lg font-semibold mb-2">Task selection</h2>
                <div className="rounded-lg border border-border overflow-hidden">
                    {refreshFlag || tableDescriptor.isLoading ? (
                        <TableSkeleton />
                    ) : tableDescriptor.data?.length > 0 ? (
                        <RegistryTable
                            recordType={props.entityType}
                            lifecycleStage={LifecycleStageMap.CLOSED}
                            selectedDate={selectedDate}
                            tableDescriptor={tableDescriptor}
                            triggerRefresh={triggerRefresh}
                            accountType={props.accountType}
                        />
                    ) : (
                        <div className="p-4 text-sm">{dict.message.noResultFound}</div>
                    )}
                </div>
            </section>
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
                <div>
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
