"use client";

import useFormSession from "hooks/form/useFormSession";
import { TableDescriptor, useTable } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, LifecycleStageMap } from "types/form";
import { TableColumnOrderSettings } from "types/settings";
import ColumnToggle from "ui/graphic/table/action/column-toggle";
import RegistryTable from "ui/graphic/table/registry/registry-table";
import { FormComponent } from "ui/interaction/form/form";
import { FormSessionContextProvider } from "utils/form/FormSessionContext";
import Button from "../button";
import { translateFormType } from "./form-utils";
import FormSkeleton from "./skeleton/form-skeleton";

interface InvoiceFormComponentProps {
    entityType: string;
    accountType: string;
    tableColumnOrder: TableColumnOrderSettings;
}

/**
 * Renders a form container for invoices.
 *
 * @param {string} entityType The type of entity.
 * @param {string} accountType The type of account.
 * @param {TableColumnOrderSettings} tableColumnOrder The column order settings for the registry table.
 */
export default function InvoiceFormComponent(
    props: Readonly<InvoiceFormComponentProps>
) {
    return (
        <FormSessionContextProvider entityType={props.entityType} accountType={props.accountType}>
            <InvoiceFormContents {...props} />
        </FormSessionContextProvider>
    );
}

function InvoiceFormContents(props: Readonly<InvoiceFormComponentProps>) {
    const dict: Dictionary = useDictionary();
    const router = useRouter();
    const { refreshFlag, triggerRefresh, isLoading } = useOperationStatus();
    const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
    const { invoiceAccountFilter } = useFormSession();

    const tableDescriptor: TableDescriptor = useTable(
        props.entityType,
        refreshFlag,
        LifecycleStageMap.BILLABLE,
        props.tableColumnOrder,
        invoiceAccountFilter,
    );
    const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    return (
        <section className="flex flex-col h-full w-full mx-auto px-4 gap-5 md:px-8 bg-muted justify-between">
            <header className={`flex flex-row gap-4 pt-10 text-foreground justify-between`}>
                <Button
                    leftIcon="arrow_back"
                    variant="outline"
                    onClick={() => router.back()}
                    size="icon"
                    iconSize="small"
                    tooltipPosition="right"
                    tooltipText={dict.action.backTo.replace("{replace}", props.entityType)}
                />
                <h1 className="text-xl font-bold">{`${translateFormType(FormTypeMap.INVOICE, dict).toUpperCase()}`}</h1>
            </header>
            <div className="grow overflow-y-auto">
                {refreshFlag ? <FormSkeleton /> :
                    (<FormComponent
                        formRef={formRef}
                        entityType={FormTypeMap.INVOICE}
                        formType={FormTypeMap.INVOICE}
                        accountType={props.accountType}
                        selectedRowIds={tableDescriptor.selectedRowIds}
                    />
                    )}

                {invoiceAccountFilter && <section>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-end mb-4 mt-4">
                        {tableDescriptor.data?.length > 0 && (
                            <ColumnToggle
                                columns={tableDescriptor.table.getAllLeafColumns()}
                            />
                        )}
                    </div>
                    {!refreshFlag && !tableDescriptor.isLoading && <div>
                        {tableDescriptor.data?.length > 0 && (
                            <RegistryTable
                                recordType={props.entityType}
                                lifecycleStage={LifecycleStageMap.BILLABLE}
                                disableRowAction={true}
                                tableDescriptor={tableDescriptor}
                                triggerRefresh={triggerRefresh}
                                accountType={props.accountType}
                            />
                        )}
                        {tableDescriptor.data?.length == 0 && (
                            <div className="p-4 text-base">{dict.message.noResultFound}</div>
                        )}
                    </div>}
                </section>}
            </div>
            <footer className="bg-muted flex items-center justify-between">
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
                    <Button
                        leftIcon="send"
                        label={dict.action.submit}
                        tooltipText={dict.action.submit}
                        loading={isLoading}
                        disabled={isLoading}
                        onClick={onSubmit}
                    />
                </div>
            </footer>
        </section>
    );
}
