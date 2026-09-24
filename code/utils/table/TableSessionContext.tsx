"use client"

import { TableDescriptor } from '@/hooks/table/useTable';
import { TableScrollDescriptor } from '@/hooks/table/useTableScroll';
import useOperationStatus from '@/hooks/useOperationStatus';
import { AgentResponseBody, InternalApiIdentifierMap } from '@/types/backend-agent';
import { FormTypeMap, LifecycleStage } from '@/types/form';
import { RegistryExportSettings } from '@/types/settings';
import { TableRowHandle } from '@/ui/graphic/table/row/table-row';
import { toast } from '@/ui/interaction/action/toast/toast';
import HistoryModal from '@/ui/interaction/modal/history-modal';
import React, { createContext, RefObject, useEffect, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { makeInternalRegistryAPIwithParams, queryInternalApi } from '../internal-api-services';

export interface TableSessionState {
    activeRowId: string;
    recordType: string;
    exports: RegistryExportSettings[];
    lifecycleStage: LifecycleStage;
    tableDescriptor: TableDescriptor;
    tableScrollDescriptor: TableScrollDescriptor
    rowRefs: RefObject<TableRowHandle[]>;
    addEntity: string;
    allowTaskPrioritisation: boolean;
    pricingType: string;
    setActiveRowId: React.Dispatch<React.SetStateAction<string>>;
    setHistoryId: React.Dispatch<React.SetStateAction<string>>;
    setIsOpenHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
    onBulkEditSubmit: () => void;
}

export const TableSessionContext = createContext<TableSessionState>(null);

export const TableSessionContextProvider = ({
    recordType,
    exports,
    lifecycleStage,
    tableDescriptor,
    tableScrollDescriptor,
    rowRefs,
    triggerRefresh,
    addEntity,
    allowTaskPrioritisation = false,
    pricingType,
    children,
}: {
    recordType: string;
    exports: RegistryExportSettings[];
    lifecycleStage: LifecycleStage;
    tableDescriptor: TableDescriptor;
    tableScrollDescriptor: TableScrollDescriptor
    rowRefs: RefObject<TableRowHandle[]>;
    triggerRefresh: () => void;
    addEntity?: string;
    allowTaskPrioritisation?: boolean;
    pricingType?: string;
    children: React.ReactNode;
}) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState<boolean>(false);
    const [historyId, setHistoryId] = useState<string>("");
    const [activeRowId, setActiveRowId] = useState<string>("");

    const { startLoading, stopLoading } = useOperationStatus();
    const onBulkEditSubmit = async () => {
        startLoading();
        const allData: FieldValues[] = rowRefs.current
            .filter(row => !!row && Object.keys(row.getRowData()).length > 0)
            .map(row => row.getRowData());
        const response: AgentResponseBody = await queryInternalApi(
            makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", FormTypeMap.MASS_EDIT),
            "PUT",
            JSON.stringify({ items: allData })
        );
        stopLoading();
        toast(
            response?.data?.message || response?.error?.message,
            response?.error ? "error" : "success"
        );
    };

    useEffect(() => {
        const startBulkEditSubmit = async () => {
            await onBulkEditSubmit();
        }

        if (tableDescriptor.triggerBulkEdit) {
            startBulkEditSubmit();
            triggerRefresh();
            tableDescriptor.table.resetRowSelection();
        }
    }, [tableDescriptor.triggerBulkEdit])

    return (
        <TableSessionContext.Provider value={{ activeRowId, recordType, exports, lifecycleStage, tableDescriptor, tableScrollDescriptor, rowRefs, addEntity, allowTaskPrioritisation, pricingType, setActiveRowId, setHistoryId, setIsOpenHistoryModal, onBulkEditSubmit }}>
            {children}
            {isOpenHistoryModal && historyId != "" &&
                <HistoryModal
                    id={historyId}
                    entityType={recordType}
                    lifecycleStage={lifecycleStage}
                    isOpen={isOpenHistoryModal}
                    setIsOpen={setIsOpenHistoryModal}
                />}
        </TableSessionContext.Provider>
    );
}
