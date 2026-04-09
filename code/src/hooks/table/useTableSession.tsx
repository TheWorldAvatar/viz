'use client';

import useOperationStatus from 'hooks/useOperationStatus';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form';
import { AgentResponseBody, InternalApiIdentifierMap } from 'types/backend-agent';
import { FormTypeMap, LifecycleStageMap } from 'types/form';
import { toast } from 'ui/interaction/action/toast/toast';
import { makeInternalRegistryAPIwithParams, queryInternalApi } from 'utils/internal-api-services';
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

    const { startLoading, stopLoading } = useOperationStatus();
    const onBulkEditSubmit = async () => {
        startLoading();
        const allData: FieldValues[] = tableSession.rowRefs.current
            .filter(row => Object.keys(row.getRowData()).length > 0)
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

    return {
        ...tableSession,
        isBulkActionPermitted: tableSession.lifecycleStage === LifecycleStageMap.PENDING || tableSession.lifecycleStage === LifecycleStageMap.ACTIVE
            || tableSession.lifecycleStage === LifecycleStageMap.ARCHIVE || tableSession.lifecycleStage === LifecycleStageMap.OUTSTANDING || tableSession.lifecycleStage === LifecycleStageMap.SCHEDULED
            || tableSession.lifecycleStage === LifecycleStageMap.CLOSED || tableSession.lifecycleStage === LifecycleStageMap.BILLABLE,
        onBulkEditSubmit,
    };
};

export default useTableSession;
