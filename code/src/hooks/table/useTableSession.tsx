'use client';

import { useContext } from 'react';
import { LifecycleStageMap } from 'types/form';
import { TableSessionContext, TableSessionState } from 'utils/table/TableSessionContext';

interface useTableSessionReturn extends TableSessionState {
    isBulkActionPermitted: boolean;
}

/**
 * Manages the current table session, from managing the active row, history modal to storing the table states.
 */
const useTableSession = (): useTableSessionReturn => {
    const tableSession: TableSessionState = useContext(TableSessionContext);
    if (!tableSession) {
        throw new Error("useTableSessionReturn must be used within a TableSessionContextProvider");
    }

    return {
        ...tableSession,
        isBulkActionPermitted: tableSession.lifecycleStage === LifecycleStageMap.PENDING || tableSession.lifecycleStage === LifecycleStageMap.ACTIVE
            || tableSession.lifecycleStage === LifecycleStageMap.ARCHIVE || tableSession.lifecycleStage === LifecycleStageMap.OUTSTANDING || tableSession.lifecycleStage === LifecycleStageMap.SCHEDULED
            || tableSession.lifecycleStage === LifecycleStageMap.CLOSED || tableSession.lifecycleStage === LifecycleStageMap.BILLABLE,
    };
};

export default useTableSession;
