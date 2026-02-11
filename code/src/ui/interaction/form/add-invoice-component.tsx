"use client";

import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormType, FormTypeMap, LifecycleStageMap } from "types/form";
import { FormComponent } from "ui/interaction/form/form";
import { getAfterDelimiter, getInitialDateFromLifecycleStage } from "utils/client-utils";
import { FormSessionContextProvider } from "utils/form/FormSessionContext";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import Button from "../button";
import FormSkeleton from "./skeleton/form-skeleton";
import { DateRange } from "react-day-picker";
import { TableColumnOrderSettings } from "types/settings";
import { TableDescriptor, useTable } from "hooks/table/useTable";
import { translateFormType } from "./form-utils";

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
            <div className="flex flex-col w-full h-full mx-auto py-4 px-4 md:px-8 bg-muted overflow-y-auto">
                <FormContents {...props} />
            </div>
        </FormSessionContextProvider>
    );
}

function FormContents(props: Readonly<FormContainerComponentProps>) {
    const dict: Dictionary = useDictionary();
    const router = useRouter();
    const { refreshFlag, triggerRefresh, isLoading } = useOperationStatus();
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
        <div className="flex flex-col justify-between min-h-dvh">
            <div>
                <header className={`flex flex-col gap-4 text-foreground mt-5 mb-5`}>
                    <Button
                        leftIcon="arrow_back"
                        variant="outline"
                        onClick={() => router.back()}
                        size="icon"
                        iconSize="small"
                        tooltipPosition="right"
                        tooltipText={dict.action.backTo.replace("{replace}", props.entityType)}
                    />
                    <h1 className="text-xl font-bold">{`${translateFormType(props.formType, dict).toUpperCase()}`}</h1>
                </header>
                {refreshFlag ? <FormSkeleton numberOfFields={1} /> :
                    (<FormComponent
                        formRef={formRef}
                        entityType={props.entityType}
                        formType={props.formType}
                        primaryInstance={status?.data?.id}
                        isPrimaryEntity={props.isPrimaryEntity}
                        accountType={props.accountType}
                        pricingType={props.pricingType}
                        tableDescriptor={tableDescriptor}
                    />
                    )}
            </div>
            <section className="bg-muted flex items-center  justify-between sticky -bottom-4 py-2">
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
        </div >
    );
}
