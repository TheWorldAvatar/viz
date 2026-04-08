"use client"

import { TableDescriptor } from 'hooks/table/useTable';
import React, { createContext, RefObject, useState } from 'react';
import { LifecycleStage } from 'types/form';
import { TableRowHandle } from 'ui/graphic/table/row/table-row';
import HistoryModal from 'ui/interaction/modal/history-modal';

export interface TableSessionState {
    activeRowId: string;
    recordType: string;
    lifecycleStage: LifecycleStage;
    tableDescriptor: TableDescriptor;
    rowRefs: RefObject<TableRowHandle[]>;
    setActiveRowId: React.Dispatch<React.SetStateAction<string>>;
    setHistoryId: React.Dispatch<React.SetStateAction<string>>;
    setIsOpenHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TableSessionContext = createContext<TableSessionState>(null);

export const TableSessionContextProvider = ({
    recordType,
    lifecycleStage,
    tableDescriptor,
    rowRefs,
    children,
}: {
    recordType: string;
    lifecycleStage: LifecycleStage;
    tableDescriptor: TableDescriptor;
    rowRefs: RefObject<TableRowHandle[]>;
    children: React.ReactNode;
}) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState<boolean>(false);
    const [historyId, setHistoryId] = useState<string>("");
    const [activeRowId, setActiveRowId] = useState<string>("");

    return (
        <TableSessionContext.Provider value={{ activeRowId, recordType, lifecycleStage, tableDescriptor, rowRefs, setActiveRowId, setHistoryId, setIsOpenHistoryModal }}>
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
