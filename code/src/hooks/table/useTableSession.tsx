'use client';

import { useContext } from 'react';
import { FieldValues } from 'react-hook-form';
import { LifecycleStageMap } from 'types/form';
import { TableSessionContext, TableSessionState } from 'utils/table/TableSessionContext';

interface useTableSessionReturn extends TableSessionState {
    isBulkActionPermitted: boolean;
    onBulkEditSubmit: () => void;
}

/**
 * Manages the current table session, from managing the active row, history modal to storing the table states.
 */
const useTableSession = (): useTableSessionReturn => {
    const tableSession: TableSessionState = useContext(TableSessionContext);
    if (!tableSession) {
        throw new Error("useTableSessionReturn must be used within a TableSessionContextProvider");
    }

    const onBulkEditSubmit = async () => {
        const allData: FieldValues[] = tableSession.rowRefs.current
            .filter(row => Object.keys(row.getRowData()).length > 0)
            .map(row => row.getRowData());

    };

    return {
        ...tableSession,
        isBulkActionPermitted: tableSession.lifecycleStage === LifecycleStageMap.PENDING || tableSession.lifecycleStage === LifecycleStageMap.ACTIVE
            || tableSession.lifecycleStage === LifecycleStageMap.ARCHIVE || tableSession.lifecycleStage === LifecycleStageMap.OUTSTANDING || tableSession.lifecycleStage === LifecycleStageMap.SCHEDULED
            || tableSession.lifecycleStage === LifecycleStageMap.CLOSED || tableSession.lifecycleStage === LifecycleStageMap.BILLABLE,
        onBulkEditSubmit,
    };
};

export default useTableSession;
