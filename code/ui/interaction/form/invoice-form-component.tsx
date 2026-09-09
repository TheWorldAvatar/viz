"use client";

import useFormSession from "@/hooks/form/useFormSession";
import { TableDescriptor, useTable } from "@/hooks/table/useTable";
import { useDictionary } from "@/hooks/useDictionary";
import useOperationStatus from "@/hooks/useOperationStatus";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { Dictionary } from "@/types/dictionary";
import { FormTypeMap, LifecycleStageMap } from "@/types/form";
import { RegistryExportSettings, TableColumnOption } from "@/types/settings";
import ClearAllFiltersButton from "@/ui/graphic/table/action/clear-all-filters-button";
import ColumnToggle from "@/ui/graphic/table/action/column-toggle";
import RegistryTable from "@/ui/graphic/table/registry/registry-table";
import { FormComponent } from "@/ui/interaction/form/form";
import { interpolate } from "@/utils/client-utils";
import { FormSessionContextProvider } from "@/utils/form/FormSessionContext";
import Button from "../button";
import { translateFormType } from "./form-utils";
import FormSkeleton from "./skeleton/form-skeleton";
import { TableScrollDescriptor, useTableScroll } from "@/hooks/table/useTableScroll";
import { ArrowLeft, RefreshCw, SendHorizonal } from "lucide-react";

interface InvoiceFormComponentProps {
    entityType: string;
    exports: RegistryExportSettings[];
    accountType: string;
    tableColumnOptions: TableColumnOption[];
}

/**
 * Renders a form container for invoices.
 *
 * @param {string} entityType The type of entity.
 * @param {RegistryExportSettings[]} exports The export options available for this table.
 * @param {string} accountType The type of account.
 * @param {TableColumnOption[]} tableColumnOptions Configuration for table column options.
 */
export default function InvoiceFormComponent(
    props: Readonly<InvoiceFormComponentProps>
) {
    return (
        <FormSessionContextProvider formType={FormTypeMap.INVOICE} entityType={props.entityType} accountType={props.accountType}>
            <InvoiceFormContents {...props} />
        </FormSessionContextProvider>
    );
}

function InvoiceFormContents(props: Readonly<InvoiceFormComponentProps>) {
    const dict: Dictionary = useDictionary();
    const router = useRouter();
    const { refreshId, refreshFlag, triggerRefresh, isLoading } = useOperationStatus();
    const formRef: React.RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
    const { invoiceAccountFilter } = useFormSession();
    const tableScrollDescriptor: TableScrollDescriptor = useTableScroll();

    const tableDescriptor: TableDescriptor = useTable(
        props.entityType,
        refreshId,
        LifecycleStageMap.BILLABLE,
        props.tableColumnOptions,
        invoiceAccountFilter,
    );
    const onSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    return (
        <section className="flex flex-col h-full w-full mx-auto px-4 gap-5 md:px-8 bg-muted justify-between">
            <header className={`flex flex-row gap-4 pt-10 text-foreground items-baseline`}>
                <Button
                    leftIcon={ArrowLeft}
                    variant="outline"
                    onClick={() => router.back()}
                    size="icon"
                    tooltipPosition="right"
                    tooltipText={interpolate(dict.action.backTo, FormTypeMap.INVOICE)}
                    aria-label={interpolate(dict.action.backTo, FormTypeMap.INVOICE)}
                />
                <h1 className="text-xl font-bold">{`${translateFormType(FormTypeMap.INVOICE, dict).toUpperCase()}`}</h1>
            </header>
            <div className="grow overflow-y-auto">
                <div className="w-full xl:max-w-xl">
                    {refreshFlag ? <FormSkeleton /> :
                        (<FormComponent
                            formRef={formRef}
                            entityType={FormTypeMap.INVOICE}
                            accountType={props.accountType}
                            selectedRowIds={tableDescriptor.selectedRowIds}
                        />
                        )}
                </div>
                {invoiceAccountFilter && <section>
                    <div className="flex flex-col md:flex-row gap-2 items-center justify-end mb-4 mt-4">
                        {tableDescriptor.data?.length > 0 && (
                            <ColumnToggle
                                columns={tableDescriptor.table.getAllLeafColumns()}
                            />
                        )}
                        <ClearAllFiltersButton
                            tableDescriptor={tableDescriptor}
                            tableScrollDescriptor={tableScrollDescriptor}
                            disabled={tableDescriptor.filters.every((filter) => filter.id === invoiceAccountFilter.id || (filter.value as string[])?.length === 0)}
                            pinnedFilter={invoiceAccountFilter}
                        />
                    </div>
                    {!refreshFlag && !tableDescriptor.isLoading && <div>
                        {tableDescriptor.data?.length > 0 && (
                            <RegistryTable
                                recordType={props.entityType}
                                exports={props.exports}
                                lifecycleStage={LifecycleStageMap.BILLABLE}
                                disableRowAction={true}
                                tableDescriptor={tableDescriptor}
                                triggerRefresh={triggerRefresh}
                                accountType={props.accountType}
                                tableScrollDescriptor={tableScrollDescriptor}
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
                        leftIcon={RefreshCw}
                        variant="outline"
                        disabled={isLoading}
                        tooltipText={dict.action.refresh}
                        aria-label={dict.action.refresh}
                        onClick={triggerRefresh}
                        size="icon"
                    />
                )}
                <div>
                    <Button
                        leftIcon={SendHorizonal}
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
