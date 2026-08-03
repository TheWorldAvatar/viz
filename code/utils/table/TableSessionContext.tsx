"use client"

import { TableDescriptor } from '@/hooks/table/useTable';
import React, { createContext, RefObject, useState } from 'react';
import { LifecycleStage } from '@/types/form';
import { TableRowHandle } from '@/ui/graphic/table/row/table-row';
import HistoryModal from '@/ui/interaction/modal/history-modal';
import { TableScrollDescriptor } from '@/hooks/table/useTableScroll';

export interface TableSessionState {
    activeRowId: string;
    recordType: string;
    lifecycleStage: LifecycleStage;
    tableDescriptor: TableDescriptor;
    tableScrollDescriptor: TableScrollDescriptor
    rowRefs: RefObject<TableRowHandle[]>;
    addEntity: string;
    pricingType: string;
    setActiveRowId: React.Dispatch<React.SetStateAction<string>>;
    setHistoryId: React.Dispatch<React.SetStateAction<string>>;
    setIsOpenHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TableSessionContext = createContext<TableSessionState>(null);

export const TableSessionContextProvider = ({
    recordType,
    lifecycleStage,
    tableDescriptor,
    tableScrollDescriptor,
    rowRefs,
    addEntity,
    pricingType,
    children,
}: {
    recordType: string;
    lifecycleStage: LifecycleStage;
    tableDescriptor: TableDescriptor;
    tableScrollDescriptor: TableScrollDescriptor
    rowRefs: RefObject<TableRowHandle[]>;
    addEntity?: string;
    pricingType?: string;
    children: React.ReactNode;
}) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState<boolean>(false);
    const [historyId, setHistoryId] = useState<string>("");
    const [activeRowId, setActiveRowId] = useState<string>("");

    return (
        <TableSessionContext.Provider value={{ activeRowId, recordType, lifecycleStage, tableDescriptor, tableScrollDescriptor, rowRefs, addEntity, pricingType, setActiveRowId, setHistoryId, setIsOpenHistoryModal }}>
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
